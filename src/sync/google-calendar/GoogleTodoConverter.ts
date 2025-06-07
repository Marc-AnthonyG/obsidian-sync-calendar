import { logger } from "src/util/Logger";
import { Todo } from "../Todo";
import type { GoogleTodo } from "./GoogleTodo";
import moment, { type Moment } from "moment";

export class GoogleTodoConverter  {
  toExternalTodo(todo: Todo): GoogleTodo {
    const todoEvent = {
      'summary': todo.content,
      'description': todo.serializeDescription(),
      'start': {
        dateTime: todo.startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      'end': {
        dateTime: (todo.dueDateTime || todo.startDateTime.clone().add(1, 'hour')).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    } as GoogleTodo;

    return todoEvent;
  }

  fromExternalTodos(events: GoogleTodo[]): Todo[] {
    return events.map(event => this.fromExternalTodo(event)).filter((todo): todo is Todo => todo !== null);
  }

  fromExternalTodo(eventMeta: GoogleTodo): Todo | null {
    const content = eventMeta.summary;
    if (!content) {
      return null;
    }
    const calUId = eventMeta.iCalUID ?? null;
    const eventId = eventMeta.id ?? null;
    let eventStatus = "";
    let blockId: string | null = null;
    let priority: string | null = null;
    let doneDateTime: Moment | null = null;
    let startDateTime: Moment;
    let dueDateTime: Moment | null = null;
    let tags: string[] = [];

    if (eventMeta.description) {
      logger.log("GoogleTodoConverter", `eventMeta.description: ${eventMeta.description}`);
      eventMeta.description = eventMeta.description.replace(/<\/span>/g, '');
      logger.log("GoogleTodoConverter", `eventMeta.description: ${eventMeta.description}`);
      try {
        const description = JSON.parse(eventMeta.description);
        blockId = description.blockId;
        priority = description.priority;
        eventStatus = description.eventStatus;
        tags = description.tags;
        if (description.doneDateTime) {
            doneDateTime = moment(description.doneDateTime);
        }
      } catch (e) {
        logger.log("GoogleTodoConverter", `Failed to parse description for event: ${content}`, e)
      }
    }

    if (!eventMeta.start) {
      return null;
    }

    if (eventMeta.start.dateTime) {
      startDateTime = moment(eventMeta.start.dateTime);
    } else if (eventMeta.start.date) {
        startDateTime = moment(eventMeta.start.date);
    } else {
        return null;
    }

    if (eventMeta.end) {
        if (eventMeta.end.dateTime) {
          dueDateTime = moment(eventMeta.end.dateTime);
        } else if (eventMeta.end.date) {
          dueDateTime = moment(eventMeta.end.date);
        }
    }

    return new Todo({
      content,
      priority,
      blockId,
      startDateTime,
      dueDateTime,
      doneDateTime,
      calUId,
      eventId,
      eventStatus,
      tags,
      path: null,
    });
  }
}
