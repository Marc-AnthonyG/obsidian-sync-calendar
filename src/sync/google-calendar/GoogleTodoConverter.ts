import { logger } from "main";
import { Todo } from "../Todo";
import type { GoogleTodo } from "./GoogleTodo";

/**
 * Convert a Todo object to a Google Calendar event object.
 * @param todo - The Todo object to convert.
 * @returns The Google Calendar event object.
 * @throws Error if the Todo object is invalid.
 */
export function toGoogleEvent(todo: Todo): GoogleTodo {
  const todoEvent = {
    'summary': todo.content,
    'description': todo.serializeDescription(),
    'start': {},
    'end': {},
    'reminders': {
      'useDefault': false,
      'overrides': [
        { 'method': 'popup', 'minutes': 10 },
      ],
    },
  } as GoogleTodo;

  let isValidInterval = false;
  const regDateTime = /(\d{4}-\d{2}-\d{2}T\d+:\d+)/u;
  if (todo.startDateTime?.match(regDateTime) && todo.dueDateTime?.match(regDateTime)) {
    isValidInterval = true;
  }

  let isValidEvent = false;
  if (isValidInterval) {
    if (todoEvent.start && todoEvent.end) {
      todoEvent.start.dateTime = todo.startDateTime;
      todoEvent.end.dateTime = todo.dueDateTime;
      isValidEvent = true;
    }
  } else {
    const regDate = /(\d{4}-\d{2}-\d{2})/u;
    if (todo.startDateTime) {
      const startDateMatch = todo.startDateTime.match(regDate);
      const endDateMatch = todo.dueDateTime?.match(regDate);
      if (startDateMatch) {
        if (todoEvent.start) {
          todoEvent.start.date = startDateMatch[1];
        }
        if (todoEvent.end) {
          todoEvent.end.date = endDateMatch ? endDateMatch[1] : startDateMatch[1];
        }
        isValidEvent = true;
      } else if (endDateMatch) {
        if (todoEvent.start) {
          todoEvent.start.date = endDateMatch[1];
        }
        if (todoEvent.end) {
          todoEvent.end.date = endDateMatch[1];
        }
      }
    }
  }
  if (isValidEvent) {
    if (todoEvent.start && todoEvent.end) {
      todoEvent.start.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      todoEvent.end.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  } else {
    throw Error(`Invalid todo->event ${todo.content}`);
  }
  return todoEvent;
}

/**
 * Convert a Google Calendar event object to a Todo object.
 * @param eventMeta - The Google Calendar event object to convert.
 * @returns The Todo object.
 * @throws Error if the eventMeta object is invalid.
 */
export function fromGoogleEvent(eventMeta: GoogleTodo): Todo {
  const content = eventMeta.summary;
  const calUId = eventMeta.iCalUID;
  const eventId = eventMeta.id;
  const eventHtmlLink = eventMeta.htmlLink;
  let eventStatus = "";
  let blockId = undefined;
  let priority = undefined;
  let doneDateTime= undefined;
  let startDateTime: string;
  let dueDateTime: string;
  let tags: string[] = [];
  let updated: string | undefined = undefined;

  if (eventMeta.description !== null && eventMeta.description !== undefined) {
    eventMeta.description = eventMeta.description.replace(/<\/span>/g, '');
    try {
      blockId = JSON.parse(eventMeta.description).blockId;
    } catch (e) { logger.log("Todo", `JSON parse error on ${eventMeta.description}: ${e}`); }
    try {
      priority = JSON.parse(eventMeta.description).priority;
    } catch (e) { logger.log("Todo", `JSON parse error on ${eventMeta.description}: ${e}`); }
    try {
      eventStatus = JSON.parse(eventMeta.description).eventStatus;
    } catch (e) { logger.log("Todo", `JSON parse error on ${eventMeta.description}: ${e}`); }
    try {
      tags = JSON.parse(eventMeta.description).tags;
    } catch (e) { logger.log("Todo", `JSON parse error on ${eventMeta.description}: ${e}`); }
    try {
      doneDateTime = JSON.parse(eventMeta.description).doneDateTime;
    } catch (e) { logger.log("Todo", `JSON parse error on ${eventMeta.description}: ${e}`); }
  }

  if (!eventMeta.start || !eventMeta.end) {
    throw Error("Invalid eventMeta, start/end not exist!");
  }

  if (eventMeta.start.dateTime === null || eventMeta.start.dateTime === undefined) {
    startDateTime = window.moment(eventMeta.start.date).format('YYYY-MM-DD');
  } else {
    startDateTime = window.moment(eventMeta.start.dateTime).format('YYYY-MM-DD[T]HH:mm:ssZ');
  }

  if (eventMeta.end.dateTime === null || eventMeta.end.dateTime === undefined) {
    dueDateTime = window.moment(eventMeta.end.date).format('YYYY-MM-DD');
  } else {
    dueDateTime = window.moment(eventMeta.end.dateTime).format('YYYY-MM-DD[T]HH:mm:ssZ');
  }

  if (eventMeta.updated) {
    updated = window.moment(eventMeta.updated).format('YYYY-MM-DD[T]HH:mm:ssZ');
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
    eventHtmlLink,
    eventStatus,
    updated,
    tags,
    children: [],
    path: undefined,
  });
} 