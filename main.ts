<<<<<<< Updated upstream
import { App, type PluginManifest, Plugin } from "obsidian";

import { MainSynchronizer } from "src/sync/MainSynchronizer";
import QueryInjector from "src/obsidian/injector/QueryInjector";
import { logger } from "src/util/Logger";
import { SyncCalendarPluginSettingTab } from "src/obsidian/SettingMenu";

export interface SyncCalendarPluginSettings {
	fetchWeeksAgo: number;
	fetchMaximumEvents: number;
=======
import { App, type PluginManifest, Plugin } from 'obsidian'

import { MainSynchronizer } from 'src/sync/MainSynchronizer'
import QueryInjector from 'src/obsidian/injector/QueryInjector'
import { logger } from 'src/util/Logger'
import { SyncCalendarPluginSettingTab } from 'src/obsidian/SettingMenu'

export interface SyncCalendarPluginSettings {
	fetchWeeksAgo: number
	fetchMaximumEvents: number
>>>>>>> Stashed changes
}

const DEFAULT_SETTINGS: SyncCalendarPluginSettings = {
	fetchWeeksAgo: 2,
	fetchMaximumEvents: 1000,
<<<<<<< Updated upstream
};

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

		this.registerMarkdownCodeBlockProcessor(
			"sync-calendar",
			this.queryInjector.onNewBlock.bind(this.queryInjector),
		);
=======
}

export default class SyncCalendarPlugin extends Plugin {
	public settings: SyncCalendarPluginSettings

	private mainSync: MainSynchronizer

	private queryInjector: QueryInjector

	constructor(app: App, pluginManifest: PluginManifest) {
		super(app, pluginManifest)
	}

	async onload() {
		await this.loadSettings()
		logger.log('SyncCalendarPlugin', 'onload')

		this.addSettingTab(new SyncCalendarPluginSettingTab(this.app, this))

		this.mainSync = new MainSynchronizer(this.app)

		this.queryInjector = new QueryInjector(this, this.mainSync)

		this.registerMarkdownCodeBlockProcessor(
			'sync-calendar',
			this.queryInjector.onNewBlock.bind(this.queryInjector)
		)
>>>>>>> Stashed changes
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
<<<<<<< Updated upstream
			await this.loadData(),
		);
=======
			await this.loadData()
		)
>>>>>>> Stashed changes
	}
}
