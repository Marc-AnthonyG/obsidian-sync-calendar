import React, { useState, useEffect } from "react";
import { Menu } from "obsidian";
import MarkdownRenderer from "./MarkdownRenderer";

import type SyncCalendarPlugin from "../../main";
import { contentStore } from "./ContentStore";

import { Todo } from "../TodoSerialization/Todo";
import type { MainSynchronizer } from "../Syncs/MainSynchronizer";

interface TaskRendererProps {
	api: MainSynchronizer;
	plugin: SyncCalendarPlugin;
	todo: Todo;
}

const TaskRenderer: React.FC<TaskRendererProps> = ({ api, plugin, todo }) => {
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		if (todo.eventId) {
			contentStore.set(todo.eventId, getTodoContent(todo));
		}
	}, [todo]);

	function getTodoContent(todo: Todo): string {
		if (todo.content) {
			return todo.content;
		}
		return "Invalid Todo Title";
	}

	function getPriorityClass(priority: null | undefined | string): string {
		if (priority === null || priority === undefined || priority === " ") {
			return "todo-list-p4";
		}
		if (priority === "🔽") {
			return "todo-list-p3";
		}
		if (priority === "🔼") {
			return "todo-list-p2";
		}
		if (priority === "⏫") {
			return "todo-list-p1";
		}
		return "todo-list-p4";
	}

	async function onClickTask(todo: Todo) {
		api.patchTodoToDone(todo);
	}

	function onClickTaskContainer(evt: React.MouseEvent) {
		evt.stopPropagation();
		evt.preventDefault();

		const menu = new Menu();

		menu.addItem((menuItem) =>
			menuItem
				.setTitle("Delete todo")
				.setIcon("popup-open")
				.onClick(() => {
					api.deleteTodo(todo);
				})
		);

		menu.showAtPosition({
			x: evt.pageX,
			y: evt.pageY,
		});
	}

	return (
		<li
			onContextMenu={onClickTaskContainer}
			className={`
        todo-list-item
        has-time
        ${getPriorityClass(todo.priority)} 
        ${todo.isOverdue() ? "todo-overdue" : ""}
      `}
		>
			<div>
				<input
					disabled={disabled}
					className="todo-list-item-checkbox"
					type="checkbox"
					onClick={async () => {
						setDisabled(true);
						await onClickTask(todo);
					}}
				/>
				<MarkdownRenderer
					className="todo-list-todo-content"
					eventId={todo.eventId ?? ""}
				/>
			</div>
			<div className="todo-metadata">
				{plugin.settings.renderDate && todo.startDateTime && (
					<div
						className={`todo-date ${
							todo.isOverdue() ? "todo-overdue" : ""
						}`}
					>
						<svg
							className="todo-calendar-icon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
								clipRule="evenodd"
							/>
						</svg>
						{Todo.momentString(todo.startDateTime, "🛫")}
					</div>
				)}
				{plugin.settings.renderTags &&
					todo.tags &&
					todo.tags.length > 0 && (
						<div className="todo-labels">
							<svg
								className="todo-labels-icon"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
									clipRule="evenodd"
								/>
							</svg>
							{todo.tags.map((tag, i) => (
								<React.Fragment key={tag}>
									<a
										href={`tag:${tag}`}
										className="tag"
										target="_blank"
										rel="noopener noreferrer"
									>
										{tag}
									</a>
									{i !== (todo.tags?.length ?? 0) - 1 && (
										<span>,</span>
									)}
								</React.Fragment>
							))}
						</div>
					)}
			</div>
		</li>
	);
};

export default TaskRenderer;
