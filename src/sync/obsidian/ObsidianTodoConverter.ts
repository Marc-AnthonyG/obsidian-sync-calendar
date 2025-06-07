import type { Todo } from "src/sync/Todo";
import type { TodoDetails } from "./MdTodo";
import moment, { type Moment } from "moment";
import { logger } from "src/util/Logger";

export interface DefaultTodoSerializerSymbols {
  readonly TodoFormatRegularExpressions: {
    blockIdRegex: RegExp;
    createdDateRegex: RegExp;
    scheduledDateRegex: RegExp;
    startDateRegex: RegExp;
    startDateTimeRegex: RegExp;
    dueDateRegex: RegExp;
    dueDateTimeRegex: RegExp;
    doneDateRegex: RegExp;
  };
}

export const DEFAULT_SYMBOLS: DefaultTodoSerializerSymbols = {
  TodoFormatRegularExpressions: {
    blockIdRegex: /\^([0-9a-zA-Z]*)$/u,
    createdDateRegex: /➕ *(\d{4}-\d{2}-\d{2})$/u,
    startDateRegex: /🛫 *(\d{4}-\d{2}-\d{2})$/u,
    startDateTimeRegex: /🛫 *(\d{4}-\d{2}-\d{2}@\d+:\d+)$/u,
    scheduledDateRegex: /[⏳⌛] *(\d{4}-\d{2}-\d{2})$/u,
    dueDateRegex: /[📅📆🗓] *(\d{4}-\d{2}-\d{2})$/u,
    dueDateTimeRegex: /[📅📆🗓] *(\d{4}-\d{2}-\d{2}@\d+:\d+)$/u,
    doneDateRegex: /✅ *(\d{4}-\d{2}-\d{2})$/u,
  },
} as const;


export class TodoRegularExpressions {
  public static readonly dateFormat = 'YYYY-MM-DD';
  public static readonly dateTimeFormat = 'YYYY-MM-DD@HH:mm';

  public static readonly indentationRegex = /^([\s\t>]*)/;

  public static readonly listMarkerRegex = /([-*]|[0-9]+\.)/;

  public static readonly checkboxRegex = /\[(.)\]/u;

  public static readonly afterCheckboxRegex = / *(.*)/u;

  public static readonly todoRegex = new RegExp(
    TodoRegularExpressions.indentationRegex.source +
    TodoRegularExpressions.listMarkerRegex.source +
    ' +' +
    TodoRegularExpressions.checkboxRegex.source +
    TodoRegularExpressions.afterCheckboxRegex.source,
    'u',
  );

  public static readonly nonTodoRegex = new RegExp(
    TodoRegularExpressions.indentationRegex.source +
    TodoRegularExpressions.listMarkerRegex.source +
    '? *(' +
    TodoRegularExpressions.checkboxRegex.source +
    ')?' +
    TodoRegularExpressions.afterCheckboxRegex.source,
    'u',
  );

  public static readonly listItemRegex = new RegExp(
    TodoRegularExpressions.indentationRegex.source + TodoRegularExpressions.listMarkerRegex.source,
  );

  public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;
  public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]*/g;
  public static readonly hashTagsFloating = new RegExp(this.hashTags.source);
  public static readonly hashTagsFromEnd = new RegExp(this.hashTags.source + '$');
}


export class DefaultTodoSerializer  {
  constructor(public readonly symbols: DefaultTodoSerializerSymbols) { }

  toExternalTodos(todos: Todo[]): string[] {
    return todos.map(todo => this.toExternalTodo(todo));
  }

  public toExternalTodo(todo: Todo): string {
    const components: string[] = [];
    if (todo.content) {
      components.push(todo.content);
    }
    
    components.push('🛫 ' + todo.getStringStartDateTime());

    components.push('🗓 ' + todo.getStringDueDateTime());

    if (todo.doneDateTime) {
      components.push('✅ ' + todo.doneDateTime);
    }

    if (todo.blockId) {
      components.push(`^${todo.blockId}`);
    }

    return components.join(' ');
  }


  public fromObsidianTodo(line: string, startMoment: moment.Moment): TodoDetails | null {
    const { TodoFormatRegularExpressions } = this.symbols;

    let matched: boolean;
    let blockId: null | string = null;
    let doneDateTime: null | Moment = null;
    let startDateTime: null | Moment = null;
    let dueDateTime: null | Moment = null;
    let isAllDay = false;

    let trailingTags = '';
    const maxRuns = 20;
    let runs = 0;
    do {
      matched = false;

      const blockIdMatch = line.match(TodoFormatRegularExpressions.blockIdRegex);
      if (blockIdMatch !== null) {
        blockId = blockIdMatch[1];
        line = line.replace(TodoFormatRegularExpressions.blockIdRegex, '').trim();
        matched = true;
      }

      const startDateMatch = line.match(TodoFormatRegularExpressions.startDateRegex);
      if (startDateMatch !== null) {
        startDateTime = moment(startDateMatch[1], TodoRegularExpressions.dateFormat);
        line = line.replace(TodoFormatRegularExpressions.startDateRegex, '').trim();
        matched = true;
        isAllDay = true;
      }

      const startDateTimeMatch = line.match(TodoFormatRegularExpressions.startDateTimeRegex);
      if (startDateTimeMatch !== null) {
        startDateTime = moment(startDateTimeMatch[1], TodoRegularExpressions.dateTimeFormat);
        line = line.replace(TodoFormatRegularExpressions.startDateTimeRegex, '').trim();
        matched = true;
      }

      const dueDateMatch = line.match(TodoFormatRegularExpressions.dueDateRegex);
      if (dueDateMatch !== null) {
        dueDateTime = moment(dueDateMatch[1], TodoRegularExpressions.dateFormat);
        line = line.replace(TodoFormatRegularExpressions.dueDateRegex, '').trim();
        matched = true;
        isAllDay = true;
      }

      const dueDateTimeMatch = line.match(TodoFormatRegularExpressions.dueDateTimeRegex);
      if (dueDateTimeMatch !== null) {
        dueDateTime = moment(dueDateTimeMatch[1], TodoRegularExpressions.dateTimeFormat);
        line = line.replace(TodoFormatRegularExpressions.dueDateTimeRegex, '').trim();
        matched = true;
      }

      const doneDateMatch = line.match(TodoFormatRegularExpressions.doneDateRegex);
      if (doneDateMatch !== null) {
        doneDateTime = moment(doneDateMatch[1], TodoRegularExpressions.dateFormat);
        line = line.replace(TodoFormatRegularExpressions.doneDateRegex, '').trim();
        matched = true;
      }

      const tagsMatch = line.match(TodoRegularExpressions.hashTagsFloating);
      if (tagsMatch != null) {
        line = line.replace(TodoRegularExpressions.hashTagsFloating, '').trim();
        matched = true;
        const tagName = tagsMatch[0].trim();
        trailingTags = trailingTags.length > 0 ? [tagName, trailingTags].join(' ') : tagName;
      }
      runs++;
    } while (matched && runs <= maxRuns);


    const tags = trailingTags.match(TodoRegularExpressions.hashTags)?.map((tag) => tag.trim()) ?? [];

    if (!startDateTime) {
      // if no start date, set it to the start of the current display 
      startDateTime = startMoment;
      dueDateTime = startMoment.clone().add(1, 'day');
      isAllDay = true;
      logger.log("DefaultTodoSerializer", `startDateTime=${startDateTime}, dueDateTime=${dueDateTime}`);
    }

    return {
      content: line,
      blockId: blockId,
      tags,
      startDateTime: startDateTime,
      dueDateTime: dueDateTime ? moment(dueDateTime) : null,
      doneDateTime: doneDateTime ? moment(doneDateTime) : null,
      isAllDay: isAllDay,
    };
  }
}
