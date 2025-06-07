import type { App } from "obsidian";

import type { BlockId, ObsidianTodo, Todo } from "src/sync/Todo";
import { GoogleCalendarSync } from './google-calendar/GoogleCalendarSync'
import { ObsidianTasksSync } from './obsidian/ObsidianTasksSync';
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
  }

  public async pushTodosToCalendar( startMoment: moment.Moment, clEvents: Todo[],) {
    logger.log("MainSynchronizer", `push Todos: startMoment=${startMoment}`);
    const obTasks = this.obsidianSync.listTasks(startMoment);

    const clEventCreatedFromTodo = new Map<BlockId, ObsidianTodo>();
    clEvents.forEach((event: Todo) => {
        const obTodo = event.toObsidianTodo();
        if (obTodo) {
          clEventCreatedFromTodo.set(obTodo.blockId, obTodo);
        }
    });

    obTasks.map(async (task) => {
      const event = clEventCreatedFromTodo.get(task.blockId);
      if (event) {
        if (event.eventStatus === task.eventStatus || task.eventStatus === ' ') {
          return;
        }
        this.calendarSync.patchEvent(task);
      } else {
        await this.calendarSync.insertEvent(task);
      }
    });

  }

  public async pullTodosFromCalendar(
    startMoment: moment.Moment,
    maxResults = 200): Promise<Todo[]> {

    logger.log("MainSynchronizer", `pull Todos: startMoment=${startMoment}`);
    const clEvents = await this.calendarSync.listEvents(startMoment, maxResults);
    this.pushTodosToCalendar(startMoment, clEvents);

    const obTasks = this.obsidianSync.listTasks(startMoment);

    const obBlockId2Task = new Map<string, Todo>();
    obTasks.forEach((task: Todo) => {
      if (task.blockId && task.blockId.length > 0) {
        obBlockId2Task.set(task.blockId, task);
      }
    });

    const todosCalendarCreate: Todo[] = [];
    clEvents.forEach((event: Todo) => {
      if (!event.blockId || event.blockId.length === 0) {
        todosCalendarCreate.push(event);
        return;
      }
      if (!obBlockId2Task.has(event.blockId)) {
        return;
      }

      // Calendar -[m]-> Obsidian
      const task = obBlockId2Task.get(event.blockId);

      if (!task || !task.path || !task.blockId) {
        logger.log("MainSynchronizer", `Cannot find file/blockId for updated todo: $ {event.content}`);
        throw Error(`Cannot find file/blockId for updated todo: $ {event.content}`);
      }

      // Fully updated from calendars(only exclude blockId...)
      task.updateFrom(event);
      this.obsidianSync.updateTodo(task);
    });

    const clTodos = clEvents
      .filter((todo) => {
        if (!todo.eventStatus) {
          return true;
        }
        return todo.eventStatus !== "x" && todo.eventStatus !== "X";
      });

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

    return clTodos;
  }

/**
   * Delete a todo from Google Calendar and Obsidian
   * @param todo - The todo to delete
   */
  public async deleteTodo(todo: Todo): Promise<void> {
    await this.obsidianSync.deleteTodo(todo)
      .catch((err) => { throw err; });
    await this.calendarSync.deleteEvent(todo)
      .catch((err) => { throw err; });
  }


  /**
   * Patch a todo to done in both Google Calendar and Obsidian
   * @param todo - The todo to patch
   */
  public async patchTodoToDone(todo: Todo): Promise<void> {
    todo.eventStatus = 'x';

    await this.obsidianSync.patchTodo(todo, ObsidianTasksSync.getStatusDonePatch)
      .catch((err) => { throw err; });

    await this.calendarSync.patchEvent(todo)
      .catch((err) => { throw err; });
  }

}