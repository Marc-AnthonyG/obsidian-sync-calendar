import type { App } from 'obsidian'

import type {
	BlockId,
	InternalGoogleTodo,
	ObsidianTodo,
	SyncedTodo,
	Todo,
<<<<<<< Updated upstream
} from "src/sync/Todo";
import { GoogleCalendarSync } from "./google-calendar/GoogleCalendarSync";
import { ObsidianTasksSync } from "./obsidian/ObsidianTasksSync";
import { logger } from "src/util/Logger";

export class MainSynchronizer {
	private calendarSync: GoogleCalendarSync;
	private obsidianSync: ObsidianTasksSync;

	constructor(app: App) {
		this.calendarSync = new GoogleCalendarSync(app);
		this.obsidianSync = new ObsidianTasksSync(app);
	}

	public isReady(): Promise<boolean> {
		return this.calendarSync.isReady();
=======
} from 'src/sync/Todo'
import { GoogleCalendarSync } from './google-calendar/GoogleCalendarSync'
import { ObsidianTasksSync } from './obsidian/ObsidianTasksSync'
import { logger } from 'src/util/Logger'

export class MainSynchronizer {
	private calendarSync: GoogleCalendarSync
	private obsidianSync: ObsidianTasksSync

	constructor(app: App) {
		this.calendarSync = new GoogleCalendarSync(app)
		this.obsidianSync = new ObsidianTasksSync(app)
	}

	public isReady(): Promise<boolean> {
		return this.calendarSync.isReady()
>>>>>>> Stashed changes
	}

	public async pushTodosToCalendar(
		startMoment: moment.Moment,
		clEvents: InternalGoogleTodo[],
<<<<<<< Updated upstream
		obTasks: ObsidianTodo[],
	) {
		logger.log("MainSynchronizer", `push Todos to calendar`);
		const clEventCreatedFromTodo = new Map<BlockId, SyncedTodo>();
		clEvents.forEach((event: InternalGoogleTodo) => {
			const obTodo = event.toSyncedTodo();
			if (obTodo) {
				clEventCreatedFromTodo.set(obTodo.blockId, obTodo);
			}
		});

		obTasks.map(async (task) => {
			const event = clEventCreatedFromTodo.get(task.blockId);
			if (event) {
				if (
					event.eventStatus === task.eventStatus ||
					task.eventStatus === " "
				) {
					return;
				}
				logger.log(
					"MainSynchronizer",
					`patchEvent: event=${event.content}`,
				);
				this.calendarSync.patchEvent(event);
			} else {
				logger.log(
					"MainSynchronizer",
					`insertEvent: event=${task.content}`,
				);
				await this.calendarSync.insertEvent(task);
			}
		});
=======
		obTasks: ObsidianTodo[]
	) {
		logger.log('MainSynchronizer', `push Todos to calendar`)
		const clEventCreatedFromTodo = new Map<BlockId, SyncedTodo>()
		clEvents.forEach((event: InternalGoogleTodo) => {
			const obTodo = event.toSyncedTodo()
			if (obTodo) {
				clEventCreatedFromTodo.set(obTodo.blockId, obTodo)
			}
		})

		obTasks.map(async (task) => {
			const event = clEventCreatedFromTodo.get(task.blockId)
			if (event) {
				if (
					event.eventStatus === task.eventStatus ||
					task.eventStatus === ' '
				) {
					return
				}
				logger.log(
					'MainSynchronizer',
					`patchEvent: event=${event.content}`
				)
				this.calendarSync.patchEvent(event)
			} else {
				logger.log(
					'MainSynchronizer',
					`insertEvent: event=${task.content}`
				)
				await this.calendarSync.insertEvent(task)
			}
		})
>>>>>>> Stashed changes
	}

	public async pullTodosFromCalendar(
		startMoment: moment.Moment,
		endMoment: moment.Moment,
		maxResults = 200,
<<<<<<< Updated upstream
		path: string,
	): Promise<InternalGoogleTodo[]> {
		const obTasks = this.obsidianSync.listTasks(startMoment, path);
		const clEvents = await this.calendarSync.listEvents(
			startMoment,
			endMoment,
			maxResults,
		);
		this.pushTodosToCalendar(startMoment, clEvents, obTasks);

		logger.log(
			"MainSynchronizer",
			`pull Todos: startMoment=${startMoment}`,
		);

		const obBlockId2Task = new Map<string, ObsidianTodo>();

		obTasks.forEach((task: ObsidianTodo) => {
			obBlockId2Task.set(task.blockId, task);
		});

		clEvents.forEach((event: Todo) => {
			const obEvent = event.toSyncedTodo();
			if (obEvent === null) {
				logger.log(
					"MainSynchronizer",
					`Event is not in Obsidian and will be created: ${event.content}`,
				);
				return;
			}
			if (!obBlockId2Task.has(obEvent.blockId)) {
				logger.log(
					"MainSynchronizer",
					`Event was created in Obsidian, but is no longer in Obsidian: ${event.content}`,
				);
				return;
			}

			// Calendar -[m]-> Obsidian
			const task = obBlockId2Task.get(obEvent.blockId);

			if (!task || !task.path || !task.blockId) {
				logger.log(
					"MainSynchronizer",
					`Cannot find file/blockId for updated todo: $ {event.content}`,
				);
				throw Error(
					`Cannot find file/blockId for updated todo: $ {event.content}`,
				);
			}

			// Fully updated from calendars(only exclude blockId...)
			task.updateFrom(event);
			this.obsidianSync.updateTodo(task);
		});

		logger.log(
			"MainSynchronizer",
			`source events: clEvents=${JSON.stringify(clEvents)}`,
		);
		const clTodos = clEvents.filter((todo) => {
			return !todo.isDone();
		});

		logger.log(
			"MainSynchronizer",
			`filtered events: clEvents=${JSON.stringify(clEvents)}`,
		);
		clTodos.forEach((todo) => {
			if (!todo.blockId || !obBlockId2Task.has(todo.blockId)) {
				return;
			}
			const obTask = obBlockId2Task.get(todo.blockId);
			if (obTask) {
				todo.path = obTask.path;
				todo.content = obTask.content;
			}
		});
		logger.log(
			"MainSynchronizer",
			`pull Todos (Done): clEvents=${JSON.stringify(clEvents)}`,
		);

		return clTodos;
=======
		path: string
	): Promise<InternalGoogleTodo[]> {
		const obTasks = this.obsidianSync.listTasks(startMoment, path)
		const clEvents = await this.calendarSync.listEvents(
			startMoment,
			endMoment,
			maxResults
		)
		this.pushTodosToCalendar(startMoment, clEvents, obTasks)

		logger.log('MainSynchronizer', `pull Todos: startMoment=${startMoment}`)

		const obBlockId2Task = new Map<string, ObsidianTodo>()

		obTasks.forEach((task: ObsidianTodo) => {
			obBlockId2Task.set(task.blockId, task)
		})

		clEvents.forEach((event: Todo) => {
			const obEvent = event.toSyncedTodo()
			if (obEvent === null) {
				logger.log(
					'MainSynchronizer',
					`Event is not in Obsidian and will be created: ${event.content}`
				)
				return
			}
			if (!obBlockId2Task.has(obEvent.blockId)) {
				logger.log(
					'MainSynchronizer',
					`Event was created in Obsidian, but is no longer in Obsidian: ${event.content}`
				)
				return
			}

			// Calendar -[m]-> Obsidian
			const task = obBlockId2Task.get(obEvent.blockId)

			if (!task || !task.path || !task.blockId) {
				logger.log(
					'MainSynchronizer',
					`Cannot find file/blockId for updated todo: $ {event.content}`
				)
				throw Error(
					`Cannot find file/blockId for updated todo: $ {event.content}`
				)
			}

			// Fully updated from calendars(only exclude blockId...)
			task.updateFrom(event)
			this.obsidianSync.updateTodo(task)
		})

		logger.log(
			'MainSynchronizer',
			`source events: clEvents=${JSON.stringify(clEvents)}`
		)
		const clTodos = clEvents.filter((todo) => {
			return !todo.isDone()
		})

		logger.log(
			'MainSynchronizer',
			`filtered events: clEvents=${JSON.stringify(clEvents)}`
		)
		clTodos.forEach((todo) => {
			if (!todo.blockId || !obBlockId2Task.has(todo.blockId)) {
				return
			}
			const obTask = obBlockId2Task.get(todo.blockId)
			if (obTask) {
				todo.path = obTask.path
				todo.content = obTask.content
			}
		})
		logger.log(
			'MainSynchronizer',
			`pull Todos (Done): clEvents=${JSON.stringify(clEvents)}`
		)

		return clTodos
>>>>>>> Stashed changes
	}

	/**
	 * Patch a todo to done in both Google Calendar and Obsidian
	 * @param todo - The todo to patch
	 */
	public async patchTodoToDone(todo: Todo): Promise<void> {
<<<<<<< Updated upstream
		logger.log("MainSynchronizer", `patchTodoToDone: todo=${todo.content}`);
		todo.eventStatus = "x";
=======
		logger.log('MainSynchronizer', `patchTodoToDone: todo=${todo.content}`)
		todo.eventStatus = 'x'
>>>>>>> Stashed changes

		await this.obsidianSync
			.patchTodo(todo, ObsidianTasksSync.getStatusDonePatch)
			.catch((err) => {
<<<<<<< Updated upstream
				throw err;
			});

		const syncedTodo = todo.toSyncedTodo();
		if (syncedTodo) {
			await this.calendarSync.patchEvent(syncedTodo).catch((err) => {
				throw err;
			});
=======
				throw err
			})

		const syncedTodo = todo.toSyncedTodo()
		if (syncedTodo) {
			await this.calendarSync.patchEvent(syncedTodo).catch((err) => {
				throw err
			})
>>>>>>> Stashed changes
		}
	}
}
