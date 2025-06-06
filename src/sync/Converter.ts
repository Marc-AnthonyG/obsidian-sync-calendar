import type { Todo } from "./Todo";

export interface Converter<T> {
    toExternalTodo(todo: Todo): T;
    fromExternalTodo(external: T): Todo;
}
