import type { Todo } from "../Todo";
import type { GoogleTodo } from "./GoogleTodo";

export function changeGoogleStatusTodo(todo: Todo): GoogleTodo {
	if (!todo.eventStatus || todo.eventStatus.trim() === "") {
		todo.eventStatus = "x";
	}

	if (["!", "?", ">", "-", " "].indexOf(todo.eventStatus) < 0) {
		todo.eventStatus = "x";
	}

	const eventDescUpdate = todo.serializeDescription();
	switch (todo.eventStatus) {
		case "-":
			return {
				summary: `Canceled: ${todo.content}`,
				description: eventDescUpdate,
			} as GoogleTodo;
		case "!":
			return {
				summary: `Important: ${todo.content}`,
				description: eventDescUpdate,
			} as GoogleTodo;
		case ">":
			return {
				summary: `Snoozed: ${todo.content}`,
				description: eventDescUpdate,
			} as GoogleTodo;
		case "?":
			return {
				summary: `Question: ${todo.content}`,
				description: eventDescUpdate,
			} as GoogleTodo;
		case "x":
		case "X":
			return {
				summary: `Done: ${todo.content}`,
				description: eventDescUpdate,
			} as GoogleTodo;
	}
	return {
		summary: `Done: ${todo.content}`,
		description: eventDescUpdate,
	} as GoogleTodo;
}
