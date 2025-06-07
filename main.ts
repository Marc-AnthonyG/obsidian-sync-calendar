import { App, type PluginManifest, Plugin } from 'obsidian';

import { gfSyncStatus$, gfNetStatus$, NetworkStatus } from 'src/obsidian/NetworkMenu';
import { MainSync } from "src/sync/MainSync";
import QueryInjector from 'src/obsidian/injector/QueryInjector';
import { Logger } from 'src/lib/Logger';
import { SyncCalendarPluginSettingTab } from 'src/obsidian/SettingMenu';
import { updateNetStatusItem, updateSyncStatusItem } from 'src/obsidian/NetworkMenu';

export let logger: Logger;

interface SyncCalendarPluginSettings {
  fetchWeeksAgo: number;
  fetchMaximumEvents: number;

  renderDate: boolean;
  renderTags: boolean;
}

const DEFAULT_SETTINGS: SyncCalendarPluginSettings = {
  fetchWeeksAgo: 2,
  fetchMaximumEvents: 1000,

  renderDate: true,
  renderTags: true,
}


export default class SyncCalendarPlugin extends Plugin {
  public settings: SyncCalendarPluginSettings;

  public syncStatusItem: HTMLElement;

  public netStatus: NetworkStatus;
  public netStatusItem: HTMLElement;

  private mainSync: MainSync;

  private queryInjector: QueryInjector;

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);
  }

  async onload() {
    await this.loadSettings();
    logger = new Logger("/Users/marc-anthonygirard/repository/obsidian-sync-calendar");

    this.addSettingTab(new SyncCalendarPluginSettingTab(this.app, this));

    // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
    this.netStatusItem = this.addStatusBarItem();
    this.syncStatusItem = this.addStatusBarItem();

    gfNetStatus$.subscribe(newNetStatus => updateNetStatusItem(newNetStatus));
    gfSyncStatus$.subscribe(newSyncStatus => updateSyncStatusItem(newSyncStatus));

    this.mainSync = new MainSync(this.app);

    this.queryInjector = new QueryInjector(this);
    this.queryInjector.setMainSync(this.mainSync);

    this.registerMarkdownCodeBlockProcessor("sync-calendar",
      this.queryInjector.onNewBlock.bind(this.queryInjector)
    );

    const syncCallback = () => {
      this.mainSync.sync();
    }

    this.addCommand({
      id: 'sync-google-calendar',
      name: 'Sync Google Calendar',
      callback: async () => {
        syncCallback();
      }
    });

    syncCallback();
    this.app.vault.on('modify', (file) => {
      syncCallback();
    });
  }

  onunload() {}


  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
}
