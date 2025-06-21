import type { Todo } from "../Todo";

export interface TodoFieldConverterInterface {
	getTodoConvert(todo: Todo): Todo;
}
