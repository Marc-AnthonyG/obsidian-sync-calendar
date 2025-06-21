import type SyncCalendarPlugin from 'main'
import { App, PluginSettingTab, Setting } from 'obsidian'

export class SyncCalendarPluginSettingTab extends PluginSettingTab {
<<<<<<< Updated upstream
	plugin: SyncCalendarPlugin;

	constructor(app: App, plugin: SyncCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.settings);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const header = this.containerEl.createDiv();
		header.createEl("p", {
			text: "Fetch",
			cls: "sync-calendar-setting-header-title",
		});

		new Setting(containerEl)
			.setName("Weeks ago")
			.setDesc(
				"Enter weeks from the earliest task to now for this plugin to consider.",
=======
	plugin: SyncCalendarPlugin

	constructor(app: App, plugin: SyncCalendarPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.settings)
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		const header = this.containerEl.createDiv()
		header.createEl('p', {
			text: 'Fetch',
			cls: 'sync-calendar-setting-header-title',
		})

		new Setting(containerEl)
			.setName('Weeks ago')
			.setDesc(
				'Enter weeks from the earliest task to now for this plugin to consider.'
>>>>>>> Stashed changes
			)
			.addText((text) =>
				text
					.setValue(this.plugin.settings.fetchWeeksAgo.toString())
					.onChange(async (value) => {
<<<<<<< Updated upstream
						const weeksAgo = parseInt(value);
						if (!isNaN(weeksAgo)) {
							this.plugin.settings.fetchWeeksAgo = weeksAgo;
						}
						await this.saveSettings();
					}),
			)
			.controlEl.querySelector("input");

		new Setting(containerEl)
			.setName("Maximum events")
			.setDesc(
				"Enter the maximum number of events in the fetching window",
=======
						const weeksAgo = parseInt(value)
						if (!isNaN(weeksAgo)) {
							this.plugin.settings.fetchWeeksAgo = weeksAgo
						}
						await this.saveSettings()
					})
			)
			.controlEl.querySelector('input')

		new Setting(containerEl)
			.setName('Maximum events')
			.setDesc(
				'Enter the maximum number of events in the fetching window'
>>>>>>> Stashed changes
			)
			.addText((text) =>
				text
					.setValue(
<<<<<<< Updated upstream
						this.plugin.settings.fetchMaximumEvents.toString(),
					)
					.onChange(async (value) => {
						const maximumEvents = parseInt(value);
						if (!isNaN(maximumEvents)) {
							this.plugin.settings.fetchMaximumEvents =
								maximumEvents;
							await this.saveSettings();
						}
					}),
			)
			.controlEl.querySelector("input");

		const header2 = this.containerEl.createDiv();
		header2.createEl("p", {
			text: "Render",
			cls: "sync-calendar-setting-header-title",
		});
=======
						this.plugin.settings.fetchMaximumEvents.toString()
					)
					.onChange(async (value) => {
						const maximumEvents = parseInt(value)
						if (!isNaN(maximumEvents)) {
							this.plugin.settings.fetchMaximumEvents =
								maximumEvents
							await this.saveSettings()
						}
					})
			)
			.controlEl.querySelector('input')

		const header2 = this.containerEl.createDiv()
		header2.createEl('p', {
			text: 'Render',
			cls: 'sync-calendar-setting-header-title',
		})
>>>>>>> Stashed changes
	}
}
