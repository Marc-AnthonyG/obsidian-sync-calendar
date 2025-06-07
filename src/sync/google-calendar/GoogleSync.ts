import * as path from 'path';

import type { App, Vault, FileSystemAdapter } from 'obsidian';
import { google, type calendar_v3, Auth } from 'googleapis';

import { Todo } from '../Todo';
import { logger } from '../../../main';
import { gfSyncStatus$, gfNetStatus$, NetworkStatus, SyncStatus } from '../../obsidian/NetworkMenu';
import type { Syncher, PartialTodo } from '../Syncher';
import { fromGoogleEvent, toGoogleEvent } from './GoogleTodoConverter';
import { authenticate } from '@google-cloud/local-auth';

/**
 * This class handles syncing with Google Calendar.
 */
export class GoogleSync implements Syncher {
  vault: Vault;

  public SCOPES = ['https://www.googleapis.com/auth/calendar'];
  private TOKEN_PATH = ""
  private CREDENTIALS_PATH = ""

  private isTokenValid = true;
  private isTokenRefreshing = false;

  constructor(app: App) {
    this.vault = app.vault

    // Set the paths for the token and credentials files
    this.TOKEN_PATH = path.join(this.vault.configDir, 'calendar.sync.token.json');
    this.CREDENTIALS_PATH = path.join(this.vault.configDir, 'calendar.sync.credentials.json');
  }

  async pull(destination: Todo[]): Promise<Todo[]> {
    // A simple pull implementation. For a more efficient version,
    // you would use the destination todos to perform a diff and only fetch what's needed.
    return this.fetchAll();
  }

  /**
   * Returns a list of completed and uncompleted events.
   * @param startMoment The start moment for the events to retrieve.
   * @param maxResults The maximum number of results to retrieve.
   * @returns A Promise that resolves to an array of Todo objects.
   */
  async fetchAll(startMoment: moment.Moment = window.moment().startOf('day'), maxResults = 200): Promise<Todo[]> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    // Set the sync and network status to DOWNLOAD
    gfSyncStatus$.next(SyncStatus.DOWNLOAD);

    // Retrieve the events from Google Calendar
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
          // Set the network status to CONNECTION_ERROR and the sync status to FAILED_WARNING
          gfNetStatus$.next(NetworkStatus.CONNECTION_ERROR);
          gfSyncStatus$.next(SyncStatus.FAILED_WARNING);
          throw err;
        });

    // Set the network status to HEALTH and the sync status to SUCCESS_WAITING
    gfNetStatus$.next(NetworkStatus.HEALTH);
    gfSyncStatus$.next(SyncStatus.SUCCESS_WAITING);

    const eventsMetaList = eventsListQueryResult.data.items;
    const eventsList: Todo[] = [];

    if (eventsMetaList != undefined) {
      eventsMetaList.forEach((eventMeta: calendar_v3.Schema$Event) => {
        eventsList.push(fromGoogleEvent(eventMeta));
      });
    }

    return eventsList;
  }

  /**
   * Inserts a new event into Google Calendar.
   * @param todo The Todo object to insert.
   */
  async create(todo: Todo): Promise<Todo> {
    const auth = await this.authorize();
    const calendar: calendar_v3.Calendar = google.calendar({ version: 'v3', auth });

    // Set the sync status to UPLOAD and attempt to insert the event
    gfSyncStatus$.next(SyncStatus.UPLOAD);

    const createdEvent = await calendar.events
      .insert({
        auth: auth,
        calendarId: 'primary',
        requestBody: toGoogleEvent(todo)
      }
      )
    
    gfSyncStatus$.next(SyncStatus.SUCCESS_WAITING);
    gfNetStatus$.next(NetworkStatus.HEALTH);
    logger.log("GoogleSync", `Added event: ${todo.content}! link: ${createdEvent.data.htmlLink}`);
    
    return fromGoogleEvent(createdEvent.data);
  }

  async update(todo: Todo): Promise<Todo> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });
    
    gfSyncStatus$.next(SyncStatus.UPLOAD);

    const updatedEvent = await calendar.events.update({
      auth: auth,
      calendarId: 'primary',
      eventId: todo.eventId!,
      requestBody: toGoogleEvent(todo)
    });
    
    gfSyncStatus$.next(SyncStatus.SUCCESS_WAITING);
    gfNetStatus$.next(NetworkStatus.HEALTH);
    logger.log("GoogleSync", `Updated event: ${todo.content}!`);
    
    return fromGoogleEvent(updatedEvent.data);
  }

  /**
   * Deletes an event from Google Calendar.
   * @param todo The Todo object to delete.
   */
  async delete(todo: PartialTodo): Promise<void> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    // Set the sync status to UPLOAD and attempt to delete the event
    gfSyncStatus$.next(SyncStatus.UPLOAD);
    
    await calendar.events
      .delete({
        auth: auth,
        calendarId: 'primary',
        eventId: todo.id!
      });
    
    gfSyncStatus$.next(SyncStatus.SUCCESS_WAITING);
    gfNetStatus$.next(NetworkStatus.HEALTH);
    logger.log("GoogleSync", `Deleted event: ${todo.id}!`);
  }

  /**
   * Patches an event in Google Calendar.
   * @param todo The Todo object to patch.
   * @param fields The fields to patch.
   */
  async patch(todo: Todo, fields: (keyof Todo)[]): Promise<Todo> {
    const auth = await this.authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    gfSyncStatus$.next(SyncStatus.UPLOAD);
    
    const eventPatch: calendar_v3.Schema$Event = {};
    for (const field of fields) {
      switch (field) {
        case 'content':
          eventPatch.summary = todo.content;
          break;
        case 'eventStatus':
          eventPatch.description = todo.serializeDescription();
          // Add more cases for other fields as needed
      }
    }
    
    const patchedEvent = await calendar.events
      .patch({
        auth: auth,
        calendarId: 'primary',
        eventId: todo.eventId!,
        requestBody: eventPatch
      });
    
    gfSyncStatus$.next(SyncStatus.SUCCESS_WAITING);
    gfNetStatus$.next(NetworkStatus.HEALTH);
    logger.log("GoogleSync", `Patched event: ${todo.content}!`);
    
    return fromGoogleEvent(patchedEvent.data);
  }

  /**
   * Checks if the client is authorized to call APIs.
   * @returns {Promise<boolean>} Whether the client is authorized.
   */
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

  /**
   * Reads previously authorized credentials from the save file.
   * @returns {Promise<OAuth2Client|null>} The authorized client or null if not found.
   */
  async loadSavedCredentialsIfExist() {
    try {
      const content = await this.vault.adapter.read(this.TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials) as Auth.OAuth2Client;
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
   * @param {OAuth2Client} client The client to serialize.
   * @returns {Promise<void>}
   */
  async saveCredentials(client: Auth.OAuth2Client) {
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

  /**
   * Load or request authorization to call APIs.
   * @returns {Promise<OAuth2Client>} The authorized client.
   */
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