<<<<<<< Updated upstream
import { type STask } from "obsidian-dataview";
import type { Todo } from "src/sync/Todo";

export type MdTodo = STask;
=======
import { type STask } from 'obsidian-dataview'
import type { Todo } from 'src/sync/Todo'

export type MdTodo = STask
>>>>>>> Stashed changes

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

/**
 * A subset of fields of {@link Todo} that can be parsed from the textual
 * description of that Todo.
 *
 * All fields are writeable for convenience.
 */
export type TodoDetails = Writeable<
	Pick<
		Todo,
<<<<<<< Updated upstream
		| "blockId"
		| "content"
		| "tags"
		| "startDateTime"
		| "dueDateTime"
		| "doneDateTime"
		| "isAllDay"
	>
>;
=======
		| 'blockId'
		| 'content'
		| 'tags'
		| 'startDateTime'
		| 'dueDateTime'
		| 'doneDateTime'
		| 'isAllDay'
	>
>
>>>>>>> Stashed changes
