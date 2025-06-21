import * as path from "path";

import type { App, Vault, FileSystemAdapter } from "obsidian";
import { authenticate } from "@google-cloud/local-auth";
import { google, Auth, calendar_v3 } from "googleapis";

import { InternalGoogleTodo, Todo } from "src/sync/Todo";
import { logger } from "src/util/Logger";
import { GoogleTodoConverter } from "./GoogleTodoConverter";
import { OAuth2Client } from "google-auth-library";
import { changeGoogleStatusTodo } from "./GoogleUtils";

/**
 * This class handles syncing with Google Calendar.
 */
export class GoogleCalendarSync {
	vault: Vault;
	converter: GoogleTodoConverter;

	public SCOPES = ["https://www.googleapis.com/auth/calendar"];
	private TOKEN_PATH: string;
	private CREDENTIALS_PATH: string;

	private isTokenValid: boolean = true;
	private isTokenRefreshing = false;

	constructor(app: App) {
		this.vault = app.vault;

		// Set the paths for the token and credentials files
		this.TOKEN_PATH = path.join(
			this.vault.configDir,
			"calendar.sync.token.json",
		);
		this.CREDENTIALS_PATH = path.join(
			this.vault.configDir,
			"calendar.sync.credentials.json",
		);
		this.converter = new GoogleTodoConverter();
	}

	async listEvents(
		startMoment: moment.Moment,
		endMoment: moment.Moment,
		maxResults = 200,
	): Promise<InternalGoogleTodo[]> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		const eventsListQueryResult = await calendar.events
			.list({
				calendarId: "primary",
				timeMin: startMoment.toISOString(),
				timeMax: endMoment.toISOString(),
				maxResults: maxResults,
				singleEvents: true,
				orderBy: "startTime",
			})
			.catch((err) => {
				if (err.message == "invalid_grant") {
					this.isTokenValid = false;
				}
				throw err;
			});

		return this.converter.fromExternalTodos(
			eventsListQueryResult.data.items ?? [],
		);
	}

	async insertEvent(todo: Todo) {
		const auth = await this.authorize();
		const calendar: calendar_v3.Calendar = google.calendar({
			version: "v3",
			auth,
		});

		let retryTimes = 0;
		let isInsertSuccess = false;

		while (retryTimes < 3 && !isInsertSuccess) {
			++retryTimes;
			await calendar.events
				.insert({
					auth: auth,
					calendarId: "primary",
					resource: this.converter.toExternalTodo(todo),
				} as calendar_v3.Params$Resource$Events$Insert)
				.then(() => {
					isInsertSuccess = true;
				})
				.catch(async (err) => {
					logger.error(
						"GoogleCalendarSync",
						`Error on insert event: ${err}`,
					);
					await new Promise((resolve) => setTimeout(resolve, 100));
				});
		}

		// Set the sync status and network status based on whether the insert was successful
		if (!isInsertSuccess) {
			logger.error(
				"GoogleCalendarSync",
				`Failed to insert event: ${todo.content}`,
			);
			throw Error(`Failed to insert event: ${todo.content}`);
		}
	}

	async patchEvent(todo: InternalGoogleTodo): Promise<void> {
		const auth = await this.authorize();
		const calendar = google.calendar({ version: "v3", auth });

		let retryTimes = 0;
		let isPatchSuccess = false;

		while (retryTimes < 3 && !isPatchSuccess) {
			++retryTimes;

			await calendar.events
				.patch({
					auth: auth,
					calendarId: "primary",
					eventId: todo.eventId,
					resource: changeGoogleStatusTodo(todo),
				} as calendar_v3.Params$Resource$Events$Patch)
				.then(() => {
					isPatchSuccess = true;
				})
				.catch(async (err) => {
					logger.log(
						"GoogleCalendarSync",
						`Error on patch event: ${JSON.stringify(err)}`,
					);
					await new Promise((resolve) => setTimeout(resolve, 100));
				});
		}

		if (!isPatchSuccess) {
			logger.error(
				"GoogleCalendarSync",
				`Failed on patched event: ${todo.content}`,
			);
		}
	}

	async isReady(): Promise<boolean> {
		if (this.isTokenRefreshing) {
			return false;
		}

		const client = await this.loadSavedCredentialsIfExist();
		if (!client) {
			return false;
		}

		return true;
	}

	async loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
		try {
			const content = await this.vault.adapter.read(this.TOKEN_PATH);
			const credentials = JSON.parse(content);
			return google.auth.fromJSON(credentials) as Auth.OAuth2Client;
		} catch (err) {
			return null;
		}
	}

	async saveCredentials(client: OAuth2Client): Promise<void> {
		const content = await this.vault.adapter.read(this.CREDENTIALS_PATH);
		const keys = JSON.parse(content);
		const key = keys.installed || keys.web;

		const payload = JSON.stringify({
			type: "authorized_user",
			client_id: key.client_id,
			client_secret: key.client_secret,
			refresh_token: client.credentials.refresh_token,
		});
		await this.vault.adapter.write(this.TOKEN_PATH, payload);
	}

	public async authorize(): Promise<Auth.OAuth2Client> {
		let client: Auth.OAuth2Client;
		if (this.isTokenValid) {
			client =
				(await this.loadSavedCredentialsIfExist()) as Auth.OAuth2Client;
			if (client) {
				return client;
			}
		}

		this.isTokenRefreshing = true;
		const fs_adapter = this.vault.adapter as FileSystemAdapter;
		const KEY_FILE = fs_adapter.getFullPath(this.CREDENTIALS_PATH);
		client = (await authenticate({
			scopes: this.SCOPES,
			keyfilePath: KEY_FILE,
		})) as Auth.OAuth2Client;

		if (client.credentials) {
			await this.saveCredentials(client);
		}
		this.isTokenValid = true;
		this.isTokenRefreshing = false;
		return client;
	}
}
