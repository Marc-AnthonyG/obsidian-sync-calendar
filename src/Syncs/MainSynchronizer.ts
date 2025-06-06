import type { App } from "obsidian";

import type { Todo } from "src/TodoSerialization/Todo";
import { logger } from 'main';
import { GoogleCalendarSync } from './GoogleCalendarSync'
import { ObsidianTasksSync } from './ObsidianTasksSync';

/**
 * MainSynchronizer class for syncing tasks between Obsidian and Google Calendar
 */
export class MainSynchronizer {
  // Create a member variable called "app" of type "App" and initialize it in the constructor
  private app: App;
  private calendarSync: GoogleCalendarSync;
  private obsidianSync: ObsidianTasksSync;

  /**
   * Constructor for MainSynchronizer class
   * @param app - The Obsidian App object
   */
  constructor(app: App) {
    this.app = app;
    this.calendarSync = new GoogleCalendarSync(this.app);
    this.obsidianSync = new ObsidianTasksSync(this.app);
  }

  /**
   * Check if the synchronizer is ready
   * @returns A promise that resolves to a boolean indicating if the synchronizer is ready
   */
  public isReady(): Promise<boolean> {
    return this.calendarSync.isReady();
  }

  /**
   * Push todos to Google Calendar
   * @param startMoment - The start moment for the sync
   * @param maxResults - The maximum number of results to retrieve
   * @param triggeredBy - The trigger for the sync
   */
  public async pushTodosToCalendar(
    startMoment: moment.Moment,
    maxResults = 200,
    triggeredBy: 'auto' | 'mannual' = 'auto'
  ) {
    logger.log(`push Todos: startMoment=${startMoment}`);

    // 1. list all tasks in Obsidian
    const obTasks = this.obsidianSync.listTasks(startMoment, triggeredBy);

    // 2. list events in Calendar
    const clEvents = await this.calendarSync.listEvents(startMoment, maxResults);

    // 3. push new events to Calendar
    const clBlockId2Event = new Map<string, Todo>();
    clEvents.forEach((event: Todo) => {
      if (event.blockId && event.blockId.length > 0) {
        clBlockId2Event.set(event.blockId, event);
      }
    });

    obTasks.map(async (task) => {
      if (!task.blockId || task.blockId.length === 0) {
        logger.log(`Error in construct obBlockId2Todo, ${task.content} does not have a blockId`);
        return;
      }
      if (clBlockId2Event.has(task.blockId)) {
        const event = clBlockId2Event.get(task.blockId);
        if (!event || event.eventStatus === task.eventStatus || task.eventStatus === ' ') {
          return;
        }
        // Obsidian --{m}-> Calendar 
        // patch events
        this.calendarSync.patchEvent(task, GoogleCalendarSync.getEventDonePatch);
      } else {
        // Obsidian --{+}-> Calendar
        // insert events
        await this.calendarSync.insertEvent(task);
      }
    });

  }

  /**
   * Pull todos from Google Calendar
   * @param startMoment - The start moment for the sync
   * @param maxResults - The maximum number of results to retrieve
   * @returns A promise that resolves to an array of todos
   */
  public async pullTodosFromCalendar(
    startMoment: moment.Moment,
    maxResults = 200): Promise<Todo[]> {

    const clEvents = await this.calendarSync.listEvents(startMoment, maxResults);

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
        logger.log(`Cannot find file/blockId for updated todo: $ {event.content}`);
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
   * Insert a todo to Google Calendar
   * @param todo - The todo to insert
   */
  public async insertTodo(todo: Todo): Promise<void> {
    await this.calendarSync.insertEvent(todo)
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

    await this.calendarSync.patchEvent(todo, GoogleCalendarSync.getEventDonePatch)
      .catch((err) => { throw err; });
  }

}