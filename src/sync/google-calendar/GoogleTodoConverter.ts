import { logger } from "src/util/Logger";
import { InternalGoogleTodo, Todo, type TodoGoogleDescription } from "../Todo";
import type { GoogleTodo } from "./GoogleTodo";
import moment, { type Moment } from "moment";

export class GoogleTodoConverter  {
  toExternalTodo(todo: Todo): GoogleTodo {
    const todoEvent = {
      'summary': todo.content,
      'description': todo.serializeDescription(),
      'start': todo.isAllDay ? {
        'date': todo.startDateTime.format('YYYY-MM-DD'),
      } : {
        'dateTime': todo.startDateTime.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      'end': todo.isAllDay ? {
        'date': (todo.dueDateTime || todo.startDateTime.clone().add(1, 'day')).format('YYYY-MM-DD'),
      } : {
        'dateTime': (todo.dueDateTime || todo.startDateTime.clone().add(1, 'hour')).toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    } as GoogleTodo;

    return todoEvent;
  }

  fromExternalTodos(events: GoogleTodo[]): InternalGoogleTodo[] {
    return events.map(event => this.fromExternalTodo(event)).filter((todo): todo is InternalGoogleTodo => todo !== null);
  }

  fromExternalTodo(eventMeta: GoogleTodo): InternalGoogleTodo | null {
    const content = eventMeta.summary;
    if (!content) {
      return null;
    }
    const calUId = eventMeta.iCalUID ?? null;
    const eventId = eventMeta.id;
    if (!eventId) {
      return null;
    }

    let eventStatus = "";
    let blockId: string | null = null;
    let doneDateTime: Moment | null = null;
    let startDateTime: Moment;
    let dueDateTime: Moment | null = null;
    let tags: string[] = [];
    let isAllDay = false;

    if (eventMeta.description) {
      try {
        // Try to parse the serialization made on Todo.serializeDescription()
        const description = JSON.parse(eventMeta.description) as TodoGoogleDescription;
        blockId = description.blockId;
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
        isAllDay = true;
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

    return new InternalGoogleTodo({
      content,
      blockId,
      startDateTime,
      dueDateTime,
      doneDateTime,
      calUId,
      eventId,
      eventStatus,
      tags,
      path: null,
      isAllDay,
    });
  }
}
