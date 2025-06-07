import moment, { type Moment } from "moment";

export type BlockId = string;


export class Todo {
  public content: string;

  public priority: string | null;
  public tags: string[] | null;

  public startDateTime: Moment;
  public dueDateTime: Moment | null;
  public doneDateTime: Moment | null;

  public calUId: string | null;
  public eventId: string | null;
  public eventStatus: string | null;
  public eventHtmlLink: string | null;

  public path: string | null;
  public blockId: BlockId | null;

  constructor({
    content,
    priority,
    tags,
    startDateTime,
    dueDateTime,
    doneDateTime,
    path,
    blockId,
    eventStatus,
    calUId,
    eventId,
  }: {
    content: string;
    priority: string | null;
    tags: string[] | null;
    startDateTime: Moment;
    dueDateTime?: Moment | null;
    doneDateTime?: Moment | null;
    path: string | null;
    blockId: BlockId | null;
    eventStatus: string | null;
    calUId: string | null;
    eventId: string | null;
  }) {
    this.content = content;
    this.startDateTime = startDateTime;

    this.priority = priority ?? null;
    this.tags = tags ?? null;
    this.dueDateTime = dueDateTime ?? null;
    this.doneDateTime = doneDateTime ?? null;
    this.path = path ?? null;
    this.blockId = blockId ?? null;
    this.eventStatus = eventStatus ?? null;
    this.calUId = calUId ?? null;
    this.eventId = eventId ?? null;
  }
/**
   * Update the current Todo object with the values from another Todo object.
   * @param todo - The Todo object to update from.
   */
  public updateFrom(todo: Todo) {
    this.content = todo.content;
    this.startDateTime = todo.startDateTime;
    if (todo.priority != null) { this.priority = todo.priority; }
    if (todo.dueDateTime != null) { this.dueDateTime = todo.dueDateTime; }
    if (todo.doneDateTime != null) { this.doneDateTime = todo.doneDateTime; }
    if (todo.tags != null) { this.tags = todo.tags; }
    if (todo.path != null) { this.path = todo.path; }
    if (todo.calUId != null) { this.calUId = todo.calUId; }
    if (todo.eventId != null) { this.eventId = todo.eventId; }
    if (todo.eventStatus != null) { this.eventStatus = todo.eventStatus; }
    if (todo.eventHtmlLink != null) { this.eventHtmlLink = todo.eventHtmlLink; }
    if (todo.blockId != null) { this.blockId = todo.blockId; }
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
      doneDateTime: this.doneDateTime ? this.doneDateTime.toISOString() : undefined,
    });
  }

  public isOverdue(overdueRefer?: Moment): boolean {
    const referMoment = overdueRefer ? overdueRefer : moment();

    if (this.dueDateTime) {
      if (this.dueDateTime) {
        return referMoment.isAfter(this.dueDateTime);
      }
    }
    return false;
  }

  public isDone(): boolean {
    return this.eventStatus === "x" || this.eventStatus === "X";
  }

  toSyncedTodo(): SyncedTodo | null {
    if (this.blockId && this.eventId) {
      return new SyncedTodo(this);
    }
    
    return null;
  }

  isNotFromObsidian(): boolean {
    return this.blockId === null || this.blockId.length === 0;
  }
}

export class ObsidianTodo extends Todo {
  public blockId: BlockId;
}

export class InternalGoogleTodo extends Todo {
  public eventId: string;
}

export class SyncedTodo extends Todo {
  public eventId: string;
  public blockId: BlockId;
}