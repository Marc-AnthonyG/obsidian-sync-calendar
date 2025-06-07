import * as path from 'path';

import type { App, Vault, FileSystemAdapter } from 'obsidian';
import { authenticate } from '@google-cloud/local-auth';
import { google, Auth, calendar_v3 } from 'googleapis';

import { Todo } from 'src/sync/Todo';
import { logger } from 'src/util/Logger';
import { GoogleTodoConverter } from './GoogleTodoConverter';
import type { GoogleTodo } from './GoogleTodo';
import {OAuth2Client} from "google-auth-library";

/**
 * This class handles syncing with Google Calendar.
 */
export class GoogleCalendarSync {
  vault: Vault;
  converter: GoogleTodoConverter;

  public SCOPES = ['https://www.googleapis.com/auth/calendar'];
  private TOKEN_PATH: string;
  private CREDENTIALS_PATH: string;

  private isTokenValid: boolean = true;
  private isTokenRefreshing = false;

  constructor(app: App) {
    this.vault = app.vault

    // Set the paths for the token and credentials files
    this.TOKEN_PATH = path.join(this.vault.configDir, 'calendar.sync.token.json');
    this.CREDENTIALS_PATH = path.join(this.vault.configDir, 'calendar.sync.credentials.json');
    this.converter = new GoogleTodoConverter();
  }

  async listEvents(startMoment: moment.Moment, maxResults = 200): Promise<Todo[]> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const eventsListQueryResult =
      await calendar.events
        .list({
          calendarId: 'primary',
          timeMin: startMoment.toISOString(),
          maxResults: maxResults,
          singleEvents: true,
          orderBy: 'startTime',
        })
        .catch(err => {
          if (err.message == 'invalid_grant') {
            this.isTokenValid = false;
          }
          throw err;
        });


    return this.converter.fromExternalTodos(eventsListQueryResult.data.items ?? []);
  }

  /**
   * @deprecated TODO pass on this function
   */
  async insertEvent(todo: Todo) {
    const auth = await this.authorize();
    const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth });

    let retryTimes = 0;
    let isInsertSuccess = false;

    while (retryTimes < 20 && !isInsertSuccess) {
      ++retryTimes;
      await calendar.events
        .insert({
          auth: auth,
          calendarId: 'primary',
          resource: this.converter.toExternalTodo(todo)
        } as calendar_v3.Params$Resource$Events$Insert
        )
        .then((event) => {
          isInsertSuccess = true;
          logger.log("GoogleCalendarSync", `Added event: ${todo.content}! link: ${event.data.htmlLink}`);
          return;
        }).catch(async (error) => {
          logger.log("GoogleCalendarSync", `Error on inserting event: ${error}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        });
    }

    // Set the sync status and network status based on whether the insert was successful
    if (!isInsertSuccess) {
      throw Error(`Failed to insert event: ${todo.content}`);
    }
  }

  /**
   * @deprecated TODO pass on this function
   */
  async deleteEvent(todo: Todo): Promise<void> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    let retryTimes = 0;
    let isDeleteSuccess = false;

    // Set the sync status to UPLOAD and attempt to delete the event
    while (retryTimes < 20 && !isDeleteSuccess) {
      ++retryTimes;

      await calendar.events
        .delete({
          auth: auth,
          calendarId: 'primary',
          eventId: todo.eventId
        } as calendar_v3.Params$Resource$Events$Delete)
        .then(() => {
          isDeleteSuccess = true;
          logger.log("GoogleCalendarSync", `Deleted event: ${todo.content}!`);
          return;
        }).catch(async (err) => {
          logger.log("GoogleCalendarSync", `Error on delete event: ${err}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        });
    }

    if (!isDeleteSuccess) {
      throw Error(`Failed to delete event: ${todo.content}`);
    }
  }

  /**
   * @deprecated TODO pass on this function
   */
  async patchEvent(todo: Todo, getEventPatch: (todo: Todo) => calendar_v3.Schema$Event): Promise<void> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    let retryTimes = 0;
    let isPatchSuccess = false;

    // Set the sync status to UPLOAD and attempt to patch the event
    while (retryTimes < 20 && !isPatchSuccess) {
      ++retryTimes;

      await calendar.events
        .patch({
          auth: auth,
          calendarId: 'primary',
          eventId: todo.eventId,
          resource: getEventPatch(todo)
        } as calendar_v3.Params$Resource$Events$Patch)
        .then(() => {
          isPatchSuccess = true;
          logger.log("GoogleCalendarSync", `Patched event: ${todo.content}!`);
          return;
        }).catch(async (err) => {
          logger.log("GoogleCalendarSync", `Error on patch event: ${err}`);
          await new Promise(resolve => setTimeout(resolve, 100));
        });
    }

    // Set the sync status and network status based on whether the patch was successful
    if (!isPatchSuccess) {
      throw Error(`Failed on patched event: ${todo.content}`);
    }
  }

  /**
   * @deprecated TODO pass on this function
   */
  static getEventDonePatch(todo: Todo): GoogleTodo {
    if (!todo.eventStatus) {
      todo.eventStatus = 'x';
    }
    if (['!', '?', '>', '-', ' '].indexOf(todo.eventStatus) < 0) {
      todo.eventStatus = 'x';
    }

    const eventDescUpdate = todo.serializeDescription();
    switch (todo.eventStatus) {
      case '-':
        return {
          "summary": `🚫 ${todo.content}`,
          "description": eventDescUpdate,
        } as GoogleTodo;
      case '!':
        return {
          "summary": `❗️ ${todo.content}`,
          "description": eventDescUpdate,
        } as GoogleTodo;
      case '>':
        return {
          "summary": `💤 ${todo.content}`,
          "description": eventDescUpdate,
        } as GoogleTodo;
      case '?':
        return {
          "summary": `❓ ${todo.content}`,
          "description": eventDescUpdate,
        } as GoogleTodo;
      case 'x':
      case 'X':
        return {
          "summary": `✅ ${todo.content}`,
          "description": eventDescUpdate,
        } as GoogleTodo;
    }
    return {
      "summary": `✅ ${todo.content}`,
      "description": eventDescUpdate,
    } as GoogleTodo;
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

  async loadSavedCredentialsIfExist(): Promise<OAuth2Client|null> {
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
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await this.vault.adapter.write(this.TOKEN_PATH, payload);
  }

  public async authorize(): Promise<Auth.OAuth2Client> {
    let client: Auth.OAuth2Client;
    if (this.isTokenValid) {
      client = await this.loadSavedCredentialsIfExist() as Auth.OAuth2Client;
      if (client) {
        return client;
      }
    }

    this.isTokenRefreshing = true;
    const fs_adapter = this.vault.adapter as FileSystemAdapter;
    const KEY_FILE = fs_adapter.getFullPath(this.CREDENTIALS_PATH);
    client = await authenticate({
      scopes: this.SCOPES,
      keyfilePath: KEY_FILE,
    }) as Auth.OAuth2Client;

    if (client.credentials) {
      await this.saveCredentials(client);
    }
    this.isTokenValid = true;
    this.isTokenRefreshing = false;
    return client;
  }
}
