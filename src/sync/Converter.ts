import type { Todo } from "./Todo";

export interface Converter<T> {
    toExternalTodo(todo: Todo): T;
    toExternalTodos(todos: Todo[]): T[];
    fromExternalTodo(external: T): Todo | null;
    fromExternalTodos(external: T[]): Todo[];
}
