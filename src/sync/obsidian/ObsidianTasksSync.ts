<<<<<<< Updated upstream
import { Mutex } from "async-mutex";
import { App, TFile, Notice } from "obsidian";
=======
import crypto from 'crypto'
import { Mutex } from 'async-mutex'
import { App, TFile, Notice } from 'obsidian'
>>>>>>> Stashed changes
import {
	DataviewApi,
	getAPI,
	isPluginEnabled,
	type STask,
<<<<<<< Updated upstream
} from "obsidian-dataview";

import { ObsidianTodo, Todo } from "src/sync/Todo";
import {
	DEFAULT_SYMBOLS,
	DefaultTodoSerializer,
} from "./ObsidianTodoConverter";
import type { TodoDetails } from "./MdTodo";
import { logger } from "src/util/Logger";
import { createTodoId } from "./ObsidianUtils";
import moment from "moment";
=======
} from 'obsidian-dataview'

import { ObsidianTodo, Todo } from 'src/sync/Todo'
import { DEFAULT_SYMBOLS, DefaultTodoSerializer } from './ObsidianTodoConverter'
import type { TodoDetails } from './MdTodo'
import { logger } from 'src/util/Logger'
import { createTodoId } from './ObsidianUtils'
import moment from 'moment'
>>>>>>> Stashed changes

/**
 * This class is responsible for syncing tasks between Obsidian and a calendar.
 */
export class ObsidianTasksSync {
<<<<<<< Updated upstream
	private app: App;
	private dataviewAPI: DataviewApi | undefined;
	private deserializer: DefaultTodoSerializer;
	private readonly fileMutex: Mutex;

	constructor(app: App) {
		if (!isPluginEnabled(app)) {
			new Notice("You need to install dataview first!");
			throw Error("dataview is not avaliable!");
		}
		this.deserializer = new DefaultTodoSerializer(DEFAULT_SYMBOLS);
		this.app = app;
		this.dataviewAPI = getAPI(app);
		if (!this.dataviewAPI) {
			new Notice("Dateview API enable failed!");
			throw Error("dataview api enable failed!");
		}
		this.fileMutex = new Mutex();
=======
	private app: App
	private dataviewAPI: DataviewApi | undefined
	private deserializer: DefaultTodoSerializer
	private readonly fileMutex: Mutex

	constructor(app: App) {
		if (!isPluginEnabled(app)) {
			new Notice('You need to install dataview first!')
			throw Error('dataview is not avaliable!')
		}
		this.deserializer = new DefaultTodoSerializer(DEFAULT_SYMBOLS)
		this.app = app
		this.dataviewAPI = getAPI(app)
		if (!this.dataviewAPI) {
			new Notice('Dateview API enable failed!')
			throw Error('dataview api enable failed!')
		}
		this.fileMutex = new Mutex()
>>>>>>> Stashed changes
	}

	/**
	 * Deletes a todo item from its file.
	 * @param todo - The todo item to delete.
	 */
	public async deleteTodo(todo: Todo): Promise<void> {
<<<<<<< Updated upstream
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.updateFileContent(todo, (fileLines, _) => {
			// Filter out the line containing the todo item's blockId to delete the todo item from its file.
			return fileLines.filter(
				(line) => !line.includes(todo.blockId ?? ""),
			);
		});
=======
		this.updateFileContent(todo, (fileLines, targetLineNumber) => {
			// Filter out the line containing the todo item's blockId to delete the todo item from its file.
			return fileLines.filter(
				(line) => !line.includes(todo.blockId ?? '')
			)
		})
>>>>>>> Stashed changes
	}

	static getStatusDonePatch(todo: Todo, line: string): string {
		// Replace "- [ ] " with "- [x] " to indicate that the task has been completed
<<<<<<< Updated upstream
		return line.replace(/.*(- \[.\] )/, "- [x] ");
=======
		return line.replace(/.*(- \[.\] )/, '- [x] ')
>>>>>>> Stashed changes
	}

	/**
	 * Marks a todo item as done in its file.
	 * @param todo - The todo item to mark as done.
	 * @param getTodoPatch - A function that returns the updated line for the todo item.
	 */
	public async patchTodo(
		todo: Todo,
<<<<<<< Updated upstream
		getTodoPatch: (todo: Todo, line: string) => string,
	): Promise<void> {
		logger.log("ObsidianTasksSync", `patchTodo: todo=${todo.content}`);
		this.updateFileContent(todo, (fileLines, targetLineNumber) => {
			const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /);
			if (!matchResult) {
				logger.log(
					"ObsidianTasksSync",
					`We cannot find a line with pattern - [ ] in ${fileLines[targetLineNumber]}`,
				);
				return fileLines;
=======
		getTodoPatch: (todo: Todo, line: string) => string
	): Promise<void> {
		logger.log('ObsidianTasksSync', `patchTodo: todo=${todo.content}`)
		this.updateFileContent(todo, (fileLines, targetLineNumber) => {
			const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /)
			if (!matchResult) {
				logger.log(
					'ObsidianTasksSync',
					`We cannot find a line with pattern - [ ] in ${fileLines[targetLineNumber]}`
				)
				return fileLines
>>>>>>> Stashed changes
			}

			const updatedLines: string[] = [
				...fileLines.slice(0, targetLineNumber),
				getTodoPatch(todo, fileLines[targetLineNumber]),
				...fileLines.slice(targetLineNumber + 1),
<<<<<<< Updated upstream
			];
			return updatedLines;
		});
=======
			]
			return updatedLines
		})
>>>>>>> Stashed changes
	}

	/**
	 * Updates a todo item in its file.
	 * @param todo - The todo item to update.
	 */
	public async updateTodo(todo: ObsidianTodo) {
<<<<<<< Updated upstream
		logger.log("ObsidianTasksSync", `updateTodo: todo=${todo.content}`);
		await this.updateFileContent(todo, (fileLines, targetLineNumber) => {
			const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /);
			if (!matchResult) {
				return fileLines;
			}

			const updatedLine =
				matchResult[0]! + this.deserializer.toExternalTodo(todo);
=======
		logger.log('ObsidianTasksSync', `updateTodo: todo=${todo.content}`)
		await this.updateFileContent(todo, (fileLines, targetLineNumber) => {
			const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /)
			if (!matchResult) {
				return fileLines
			}

			const updatedLine =
				matchResult[0]! + this.deserializer.toExternalTodo(todo)
>>>>>>> Stashed changes
			const updatedLines: string[] = [
				...fileLines.slice(0, targetLineNumber),
				updatedLine,
				...fileLines.slice(targetLineNumber + 1),
<<<<<<< Updated upstream
			];
			return updatedLines;
		});
=======
			]
			return updatedLines
		})
>>>>>>> Stashed changes
	}

	/**
	 * Fetches todos based on a key moment and a time window bias ahead.
	 * @param startMoment - The key moment to fetch todos for.
	 * @param triggeredBy - Whether the fetch was triggered automatically or manually.
	 * @returns An array of todos.
	 */
	public listTasks(startMoment: moment.Moment, path: string): ObsidianTodo[] {
<<<<<<< Updated upstream
		const obTodos: ObsidianTodo[] = [];
		logger.log("ObsidianTasksSync", `listTasks: path=${path}`);
=======
		const obTodos: ObsidianTodo[] = []
		logger.log('ObsidianTasksSync', `listTasks: path=${path}`)
>>>>>>> Stashed changes

		const queriedTasks = this.dataviewAPI
			?.pages()
			.file.tasks // filter out tasks with starting date before startMoment (keep tasks with no starting date)
			.where((task: STask) => {
				if (path) {
<<<<<<< Updated upstream
					return task.path === path;
				}
				const taskMatch = task.text.match(/🛫+ (\d{4}-\d{2}-\d{2})/u);
				if (!taskMatch) {
					return true;
				}
				return !moment(taskMatch[1]).isBefore(
					startMoment.startOf("day"),
				);
			});

		logger.log(
			"ObsidianTasksSync",
			`listTasks: queriedTasks=${queriedTasks?.values.length}`,
		);

		queriedTasks.values.forEach(async (task: STask) => {
			logger.log("Stask: ", JSON.stringify({ task }));
			let todo_details: TodoDetails | null = null;
			if (task.blockId && task.blockId.length > 0) {
				todo_details = this.deserializer.fromObsidianTodo(
					task.text,
					startMoment,
				);
=======
					return task.path === path
				}
				const taskMatch = task.text.match(/🛫+ (\d{4}-\d{2}-\d{2})/u)
				if (!taskMatch) {
					return true
				}
				return !moment(taskMatch[1]).isBefore(
					startMoment.startOf('day')
				)
			})

		logger.log(
			'ObsidianTasksSync',
			`listTasks: queriedTasks=${queriedTasks?.values.length}`
		)

		queriedTasks.values.forEach(async (task: STask) => {
			logger.log('Stask: ', JSON.stringify({ task }))
			let todo_details: TodoDetails | null = null
			if (task.blockId && task.blockId.length > 0) {
				todo_details = this.deserializer.fromObsidianTodo(
					task.text,
					startMoment
				)
>>>>>>> Stashed changes
			} else {
				const shorternTaskHash = await createTodoId(
					task,
					this.app,
<<<<<<< Updated upstream
					this.fileMutex,
				);
				todo_details = this.deserializer.fromObsidianTodo(
					`${task.text} ^${shorternTaskHash}`,
					startMoment,
				);
			}

			if (!todo_details) {
				return;
=======
					this.fileMutex
				)
				todo_details = this.deserializer.fromObsidianTodo(
					`${task.text} ^${shorternTaskHash}`,
					startMoment
				)
			}

			if (!todo_details) {
				return
>>>>>>> Stashed changes
			}

			const todo = new ObsidianTodo({
				...todo_details,
				path: task.path,
				eventStatus: task.status,
				calUId: null,
				eventId: null,
<<<<<<< Updated upstream
			});

			if (moment(todo.startDateTime).isBefore(startMoment)) {
				return;
			}
			obTodos.push(todo);
		});

		logger.log(
			"ObsidianTasksSync",
			`listTasks: listed ${obTodos.length} todos`,
		);

		return obTodos;
=======
			})

			if (moment(todo.startDateTime).isBefore(startMoment)) {
				return
			}
			obTodos.push(todo)
		})

		logger.log(
			'ObsidianTasksSync',
			`listTasks: listed ${obTodos.length} todos`
		)

		return obTodos
>>>>>>> Stashed changes
	}

	/**
	 * Updates the content of a file containing a todo item.
	 * @param todo - The todo item to update.
	 * @param updateFunc - A function that takes in the file lines and the target line prefix and returns the updated line.
	 */
	private async updateFileContent(
		todo: Todo,
<<<<<<< Updated upstream
		updateFunc: (fileLines: string[], targetLine: number) => string[],
=======
		updateFunc: (fileLines: string[], targetLine: number) => string[]
>>>>>>> Stashed changes
	): Promise<void> {
		// Check if todo has valid path and blockId
		if (!todo.path || !todo.blockId) {
			logger.log(
<<<<<<< Updated upstream
				"ObsidianTasksSync",
				`${todo.content} todo has invalid path or blockId`,
			);
			logger.log("ObsidianTasksSync", JSON.stringify(todo));
			throw Error(`${todo.content} todo has invalid path or blockId`);
		}

		// Get the file containing the todo
		const file = this.app.vault.getAbstractFileByPath(todo.path);
		if (!(file instanceof TFile)) {
			new Notice(`No file found for todo ${todo.content}.`);
			throw Error(`No file found for todo ${todo.content}`);
=======
				'ObsidianTasksSync',
				`${todo.content} todo has invalid path or blockId`
			)
			logger.log('ObsidianTasksSync', JSON.stringify(todo))
			throw Error(`${todo.content} todo has invalid path or blockId`)
		}

		// Get the file containing the todo
		const file = this.app.vault.getAbstractFileByPath(todo.path)
		if (!(file instanceof TFile)) {
			new Notice(`No file found for todo ${todo.content}.`)
			throw Error(`No file found for todo ${todo.content}`)
>>>>>>> Stashed changes
		}

		// Update the file content
		await this.fileMutex.runExclusive(async () => {
<<<<<<< Updated upstream
			const fileContent = await this.app.vault.read(file);
			const originFileLines = fileContent.split("\n");

			let targetLine: number | undefined = undefined;
			originFileLines.forEach((line, line_index) => {
				const index = line.indexOf(todo.blockId ?? "");
				if (index > -1) {
					targetLine = line_index;
				}
			});
			if (targetLine === undefined) {
				logger.log(
					"ObsidianTasksSync",
					"Cannot find line/prefix for updated todo: " + todo.content,
				);
				return;
			}

			const updatedFileLines = updateFunc(originFileLines, targetLine!);
			this.app.vault.modify(file, updatedFileLines.join("\n"));
		});
=======
			const fileContent = await this.app.vault.read(file)
			const originFileLines = fileContent.split('\n')

			let targetLine: number | undefined = undefined
			originFileLines.forEach((line, line_index) => {
				const index = line.indexOf(todo.blockId ?? '')
				if (index > -1) {
					targetLine = line_index
				}
			})
			if (targetLine === undefined) {
				logger.log(
					'ObsidianTasksSync',
					'Cannot find line/prefix for updated todo: ' + todo.content
				)
				return
			}

			const updatedFileLines = updateFunc(originFileLines, targetLine!)
			this.app.vault.modify(file, updatedFileLines.join('\n'))
		})
>>>>>>> Stashed changes
	}
}
