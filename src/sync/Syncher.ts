import { Todo } from "./Todo";

export type PartialTodo = {id: string, etag?: string};

export interface Syncher {
    pull(destination: Todo[]): Promise<Todo[]>;
    fetchAll(): Promise<Todo[]>;
    create(todo: Todo): Promise<Todo>;
    update(todo: Todo): Promise<Todo>;
    patch?(todo: Todo, fields: (keyof Todo)[]): Promise<Todo>;
    delete(todo: PartialTodo): Promise<void>;
} 