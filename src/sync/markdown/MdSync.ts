import crypto from "crypto";
import { Mutex } from 'async-mutex';
import { App, TFile, Notice } from "obsidian";
import { DataviewApi, getAPI, isPluginEnabled, type STask } from "obsidian-dataview";

import { DEFAULT_SYMBOLS } from "./DefaultSerialization";
import { DefaultTodoSerializer, type TodoDetails } from "./DefaultSerialization";
import { Todo } from "../Todo";
import { logger } from "../../../main";
import type { Syncher, PartialTodo } from "../Syncher";

/**
 * This class is responsible for syncing tasks between Obsidian and a calendar.
 */
export class MdSync implements Syncher {
  private app: App;
  private dataviewAPI: DataviewApi;
  private deserializer: DefaultTodoSerializer;
  private readonly fileMutex: Mutex;

  constructor(app: App) {
    if (!isPluginEnabled(app)) {
      new Notice("You need to install dataview first!");
      throw new Error("dataview is not avaliable!");
    }
    this.deserializer = new DefaultTodoSerializer(DEFAULT_SYMBOLS);
    this.app = app;
    const dv = getAPI(app);
    if (!dv) {
      new Notice("Dateview API enable failed!");
      throw new Error("dataview api enable failed!");
    }
    this.dataviewAPI = dv;
    this.fileMutex = new Mutex();
  }

  async pull(destination: Todo[]): Promise<Todo[]> {
    throw new Error("Method not implemented.");
  }

  /**
   * Deletes a todo item from its file.
   * @param todo - The todo item to delete.
   */
  public async delete(todo: PartialTodo): Promise<void> {
    // This is a temporary solution. The delete operation for markdown
    // requires more than just an ID. We are assuming that the partial todo
    // has enough information to be treated as a full Todo.
    const fullTodo = todo as Todo;
    await this.updateFileContent(fullTodo, (fileLines) => {
      // Filter out the line containing the todo item's blockId to delete the todo item from its file.
      return fileLines.filter((line) => !line.includes(fullTodo.blockId ?? ''));
    });
  }

  static getStatusDonePatch(todo: Todo, line: string): string {
    // Replace "- [ ] " with "- [x] " to indicate that the task has been completed
    return line.replace(/.*(- \[.\] )/, '- [x] ');
  }

  /**
   * Marks a todo item as done in its file.
   * @param todo - The todo item to mark as done.
   * @param fields - The fields to patch.
   */
  public async patch(todo: Todo, fields: (keyof Todo)[]): Promise<Todo> {
    await this.updateFileContent(todo, (fileLines, targetLineNumber) => {
      const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /);
      if (!matchResult) {
        logger.log("MdSync", `We cannot find a line with pattern - [ ] in ${fileLines[targetLineNumber]}`);
        return fileLines;
      }

      // This is a simple implementation that only handles marking as done.
      const updatedLine = MdSync.getStatusDonePatch(todo, fileLines[targetLineNumber]);

      const updatedLines: string[] = [
        ...fileLines.slice(0, targetLineNumber),
        updatedLine,
        ...fileLines.slice(targetLineNumber + 1),
      ];
      return updatedLines;
    });
    // The todo is mutated by getStatusDonePatch, but for a real implementation,
    // we should return the updated todo from the file.
    return todo;
  }

  /**
   * Updates a todo item in its file.
   * @param todo - The todo item to update.
   */
  public async update(todo: Todo): Promise<Todo> {
    await this.updateFileContent(todo, (fileLines, targetLineNumber) => {
      const matchResult = fileLines[targetLineNumber].match(/.*- \[.\] /);
      if (!matchResult) {
        return fileLines;
      }

      const updatedLine = matchResult[0]! + this.deserializer.serialize(todo);
      const updatedLines: string[] = [
        ...fileLines.slice(0, targetLineNumber),
        updatedLine,
        ...fileLines.slice(targetLineNumber + 1),
      ];
      return updatedLines;
    });
    return todo;
  }

  async create(todo: Todo): Promise<Todo> {
    throw new Error("Method not implemented.");
  }

  /**
   * Fetches todos based on a key moment and a time window bias ahead.
   * @param startMoment - The key moment to fetch todos for.
   * @returns An array of todos.
   */
  public async fetchAll(startMoment: moment.Moment = window.moment()): Promise<Todo[]> {
    const obTodos: Todo[] = [];

    const queriedTasks = this.dataviewAPI.pages().file.tasks
      .where((task: STask) => {
        const taskMatch = task.text.match(/🛫+ (\d{4}-\d{2}-\d{2})/u);
        if (!taskMatch) { return false; }
        return !window.moment(taskMatch[1]).isBefore(startMoment.startOf('day'));
      });

    for (const task of queriedTasks.values) {
      let todo_details: TodoDetails | null = null;
      if (task.blockId && task.blockId.length > 0) {
        todo_details = this.deserializer.deserialize(task.text);
      } else {
        const hash = crypto.createHash("sha256").update(task.text).digest();
        let shorternTaskHash = parseInt(hash.toString("hex").slice(0, 16), 16).toString(36).toUpperCase();
        shorternTaskHash = shorternTaskHash.padStart(8, "0");

        await this.fileMutex.runExclusive(async () => {
          const file = this.app.vault.getAbstractFileByPath(task.path);
          if (!(file instanceof TFile)) {
            new Notice(`sync-calendar: No file found for task ${task.text}. Retrying ...`);
            return;
          }

          const fileContent = await this.app.vault.read(file);
          const fileLines = fileContent.split('\n');

          const updatedFileLines = [
            ...fileLines.slice(0, task.position.start.line),
            `${fileLines[task.position.start.line]} ^${shorternTaskHash}`,
            ...fileLines.slice(task.position.start.line + 1),
          ];

          await this.app.vault.modify(file, updatedFileLines.join('\n'));
        });
        todo_details = this.deserializer.deserialize(`${task.text} ^${shorternTaskHash}`);
      }

      const todo = new Todo({
        content: null,
        startDateTime: null,
        ...todo_details,
        path: task.path,
        eventStatus: task.status
      });

      if (window.moment(todo.startDateTime).isBefore(startMoment)) {
        continue;
      }
      obTodos.push(todo);
    }

    return obTodos;
  }


  /**
   * Updates the content of a file containing a todo item.
   * @param todo - The todo item to update.
   * @param updateFunc - A function that takes in the file lines and the target line prefix and returns the updated line.
   */
  private async updateFileContent(todo: Todo, updateFunc: (fileLines: string[], targetLine: number) => string[]): Promise<void> {
    // Check if todo has valid path and blockId
    if (!todo.path || !todo.blockId) {
      logger.log("MdSync", `${todo.content} todo has invalid path or blockId`);
      logger.log("MdSync", JSON.stringify(todo));
      throw Error(`${todo.content} todo has invalid path or blockId`);
    }

    // Get the file containing the todo
    const file = this.app.vault.getAbstractFileByPath(todo.path);
    if (!(file instanceof TFile)) {
      new Notice(`No file found for todo ${todo.content}.`);
      throw Error(`No file found for todo ${todo.content}`);
    }

    // Update the file content
    await this.fileMutex.runExclusive(async () => {
      const fileContent = await this.app.vault.read(file);
      const originFileLines = fileContent.split('\n');

      let targetLine: number | undefined = undefined;
      originFileLines.forEach((line, line_index) => {
        const index = line.indexOf(todo.blockId ?? '');
        if (index > -1) {
          targetLine = line_index;
        }
      });
      if (targetLine === undefined) {
        logger.log("MdSync", "Cannot find line/prefix for updated todo: " + todo.content);
        return;
      }

      const updatedFileLines = updateFunc(originFileLines, targetLine!);
      this.app.vault.modify(file, updatedFileLines.join('\n'));
    });
  }

}

