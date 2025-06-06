import { App, type PluginManifest, Plugin } from 'obsidian';

import { MainSynchronizer } from "src/sync/MainSynchronizer";
import QueryInjector from 'src/obsidian/injector/QueryInjector';
import { logger } from 'src/util/Logger';
import { SyncCalendarPluginSettingTab } from 'src/obsidian/SettingMenu';

export interface SyncCalendarPluginSettings {
  fetchWeeksAgo: number;
  fetchMaximumEvents: number;
}

const DEFAULT_SETTINGS: SyncCalendarPluginSettings = {
  fetchWeeksAgo: 2,
  fetchMaximumEvents: 1000,
}


export default class SyncCalendarPlugin extends Plugin {
  public settings: SyncCalendarPluginSettings;

  private mainSync: MainSynchronizer;

  private queryInjector: QueryInjector;

  constructor(app: App, pluginManifest: PluginManifest) {
    super(app, pluginManifest);
  }

  async onload() {
    await this.loadSettings();
    logger.log("SyncCalendarPlugin", "onload");

    this.addSettingTab(new SyncCalendarPluginSettingTab(this.app, this));

    this.mainSync = new MainSynchronizer(this.app);

    this.queryInjector = new QueryInjector(this, this.mainSync);

    this.registerMarkdownCodeBlockProcessor("sync-calendar",
      this.queryInjector.onNewBlock.bind(this.queryInjector)
    );
  }

  onunload() {}


  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
}
