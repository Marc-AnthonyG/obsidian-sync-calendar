import type { Todo } from "src/sync/Todo";

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

export class ObsidianTodoSerializer {
  constructor(public readonly symbols: DefaultTodoSerializerSymbols = DEFAULT_SYMBOLS) { }

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
}