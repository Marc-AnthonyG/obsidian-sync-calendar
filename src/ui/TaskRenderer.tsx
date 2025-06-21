import React, { useState, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

import { contentStore } from './ContentStore'

import { InternalGoogleTodo, Todo } from '../sync/Todo'
import type { SyncCalendarPluginSettings } from '../../main'
import { logger } from 'src/util/Logger'
import moment from 'moment'
import { CalendarIcon } from './icon/CalendarIcon'

interface TaskRendererProps {
	settings: SyncCalendarPluginSettings
	todo: InternalGoogleTodo
	patchTodoToDone: (todo: InternalGoogleTodo) => void
}

const TaskRenderer: React.FC<TaskRendererProps> = ({
	settings,
	todo,
	patchTodoToDone,
}) => {
	logger.log('TaskRenderer', `todo=${todo}`)
	const [disabled, setDisabled] = useState(false)

	useEffect(() => {
		contentStore.set(todo.eventId, todo.content)
	}, [todo])

	function getPriorityClass(priority: null | undefined | string): string {
		if (priority === null || priority === undefined || priority === ' ') {
			return 'todo-list-p4'
		}
		if (priority === '🔽') {
			return 'todo-list-p3'
		}
		if (priority === '🔼') {
			return 'todo-list-p2'
		}
		if (priority === '⏫') {
			return 'todo-list-p1'
		}
		return 'todo-list-p4'
	}

	async function onClickTask(todo: InternalGoogleTodo) {
		patchTodoToDone(todo)
	}

	return (
		<li
			className={`
        todo-list-item
        has-time
        ${todo.isOverdue() ? 'todo-overdue' : ''}
      `}
		>
			<div>
				<input
					disabled={disabled}
					className="todo-list-item-checkbox"
					type="checkbox"
					onClick={async () => {
						setDisabled(true)
						await onClickTask(todo)
					}}
				/>
				<MarkdownRenderer
					className="todo-list-todo-content"
					eventId={todo.eventId ?? ''}
				/>
			</div>
			<div className="todo-metadata">
				<div
					className={`todo-date ${
						todo.isOverdue() ? 'todo-overdue' : ''
					}`}
				>
					<CalendarIcon />
					{todo.isAllDay
						? moment(todo.startDateTime).format('YYYY-MM-DD')
						: moment(todo.startDateTime).format('YYYY-MM-DD HH:mm')}
				</div>
				{todo.tags && todo.tags.length > 0 && (
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
	)
}

export default TaskRenderer
