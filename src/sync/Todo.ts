export type BlockId = string;

export class Todo {
  public content: null | string | undefined;

  public priority?: null | string | undefined;
  public tags?: string[] | undefined;

  public startDateTime: null | string | undefined;
  public scheduledDateTime?: null | string | undefined;
  public dueDateTime?: null | string | undefined;
  public doneDateTime?: null | string | undefined;

  public children?: Todo[] | undefined;

  public calUId?: null | string | undefined;
  public eventId?: null | string | undefined;
  public eventStatus?: null | string | undefined;
  public eventHtmlLink?: null | string | undefined;

  public path?: string | undefined;
  public blockId?: null | BlockId | undefined;

  public updated?: null | string | undefined;

  constructor({
    content,
    priority,
    tags,
    startDateTime,
    scheduledDateTime,
    dueDateTime,
    doneDateTime,
    children,
    path,
    blockId,
    eventStatus,
    updated,
    calUId,
    eventId,
    eventHtmlLink
  }: {
    content: null | string | undefined;
    priority?: null | string | undefined;
    tags?: string[] | undefined;
    startDateTime: null | string | undefined;
    scheduledDateTime?: null | string | undefined;
    dueDateTime?: null | string | undefined;
    doneDateTime?: null | string | undefined;
    children?: Todo[] | undefined;
    path?: string | undefined;
    blockId?: null | BlockId | undefined;
    eventStatus?: null | string | undefined;
    updated?: null | string | undefined;
    calUId?: null | string | undefined;
    eventId?: null | string | undefined;
    eventHtmlLink?: null | string | undefined;
  }) {
    this.content = content;

    this.priority = priority;
    this.tags = tags;
    this.startDateTime = startDateTime;
    this.scheduledDateTime = scheduledDateTime;
    this.dueDateTime = dueDateTime;
    this.doneDateTime = doneDateTime;

    this.children = children;

    this.path = path;
    this.blockId = blockId;
    this.eventStatus = eventStatus;

    this.calUId = calUId;
    this.eventId = eventId;
    this.eventHtmlLink = eventHtmlLink;

    this.updated = updated;
  }
/**
   * Update the current Todo object with the values from another Todo object.
   * @param todo - The Todo object to update from.
   */
  public updateFrom(todo: Todo) {
    if (todo.content) { this.content = todo.content; }
    if (todo.priority) { this.priority = todo.priority; }
    if (todo.startDateTime) { this.startDateTime = todo.startDateTime; }
    if (todo.scheduledDateTime) { this.scheduledDateTime = todo.scheduledDateTime; }
    if (todo.dueDateTime) { this.dueDateTime = todo.dueDateTime; }
    if (todo.doneDateTime) { this.doneDateTime = todo.doneDateTime; }
    if (todo.tags) { this.tags = todo.tags; }
    if (todo.children) { this.children = todo.children; }
    if (todo.path) { this.path = todo.path; }
    if (todo.calUId) { this.calUId = todo.calUId; }
    if (todo.eventId) { this.eventId = todo.eventId; }
    if (todo.eventStatus) { this.eventStatus = todo.eventStatus; }
    if (todo.eventHtmlLink) { this.eventHtmlLink = todo.eventHtmlLink; }
    if (todo.updated) { this.updated = todo.updated; }
  }

  /**
   * Serialize the Todo object's description into a string.
   * @returns The serialized description string.
   */
  public serializeDescription(): string {
    return JSON.stringify({
      eventStatus: this.eventStatus ? this.eventStatus : ' ',
      blockId: this.blockId,
      priority: this.priority,
      tags: this.tags,
      doneDateTime: this.doneDateTime,
    });
  }

  static isDatetime(datatimeString: string): boolean {
    const regDateTime = /(\d{4}-\d{2}-\d{2}T)/u;
    return datatimeString.match(regDateTime) !== null;
  }

  static momentString(momentString: string, emoji: '🛫' | '⌛' | '🗓'): string {
    if (Todo.isDatetime(momentString)) {
      return `${emoji} ${window.moment(momentString).format("YYYY-MM-DD[@]HH:mm")}`;
    }
    return `${emoji} ${momentString}`;
  }

  public isOverdue(overdueRefer?: moment.Moment): boolean {
    const referMoment = overdueRefer ? overdueRefer : window.moment();

    if (this.dueDateTime) {
      if (Todo.isDatetime(this.dueDateTime)) {
        return referMoment.isAfter(this.dueDateTime);
      } else {
        return referMoment.startOf('day').isAfter(this.dueDateTime);
      }
    }
    return false;
  }
}