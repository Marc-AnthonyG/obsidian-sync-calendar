import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { type SyncCalendarPluginSettings } from 'main'
import type { Query } from 'src/obsidian/injector/Query'
import { type InternalGoogleTodo } from 'src/sync/Todo'
import type { MainSynchronizer } from 'src/sync/MainSynchronizer'

import ErrorDisplay from './ErrorDisplay'
import TaskRenderer from './TaskRenderer'
import NoTaskDisplay from './NoTaskDisplay'
import { logger } from 'src/util/Logger'
import moment from 'moment'
import { RefreshSpinner } from './icon/RefreshSpinner'

interface CalendarQueryProps {
	settings: SyncCalendarPluginSettings
	api: MainSynchronizer
	query: Query
	path: string
}

const CalendarQuery: React.FC<CalendarQueryProps> = ({
	settings,
	api,
	query,
	path,
}) => {
	const [fetching, setFetching] = useState(false)
	const [todos, setTodos] = useState<InternalGoogleTodo[]>([])
	const [errorInfo, setErrorInfo] = useState<Error | null>(null)
	const [fetchedOnce, setFetchedOnce] = useState(false)

	const eventsListTitle = useMemo(() => {
		const title = query?.name
			? query.name
			: '{numberTodos} todos in calendar'
		return title.replace('{numberTodos}', todos.length.toString())
	}, [query, todos.length])

	const fetchEventLists = useCallback(async () => {
		logger.log('CalendarQuery', 'fetchEventLists')
		const apiIsReady = await api.isReady()
		if (!apiIsReady || fetching) {
			return
		}

		setFetching(true)

		let startMoment = moment()
			.startOf('day')
			.subtract(moment.duration(settings.fetchWeeksAgo, 'weeks'))

		if (query && query.timeMin) {
			startMoment = moment(query.timeMin)
		}

		let endMoment = moment()
			.endOf('day')
			.add(moment.duration(settings.fetchWeeksAgo, 'weeks'))

		if (query && query.timeMax) {
			endMoment = moment(query.timeMax)
		}

		logger.log(
<<<<<<< Updated upstream
			"CalendarQuery",
			`fetchEventLists: startMoment=${startMoment}, endMoment=${endMoment}`,
		);
=======
			'CalendarQuery',
			`fetchEventLists: startMoment=${startMoment}, endMoment=${endMoment}`
		)
>>>>>>> Stashed changes
		try {
			const timeoutPromise = new Promise<never>((_, reject) =>
				setTimeout(
					() =>
						reject(
							new Error(
<<<<<<< Updated upstream
								"Timeout occurred when fetching from Google Calendar!\nCheck your connection and proxy settings, then restart Obsidian.",
							),
						),
					10000,
				),
			);
=======
								'Timeout occurred when fetching from Google Calendar!\nCheck your connection and proxy settings, then restart Obsidian.'
							)
						),
					10000
				)
			)
>>>>>>> Stashed changes

			const newTodos = await Promise.race([
				api.pullTodosFromCalendar(
					startMoment,
					endMoment,
					settings.fetchMaximumEvents,
					path,
				),
				timeoutPromise,
			])

			setTodos(newTodos)
			setFetchedOnce(true)
			setErrorInfo(null)
			logger.log(
<<<<<<< Updated upstream
				"CalendarQuery",
				`fetchEventLists: newTodos=${JSON.stringify(newTodos)}`,
			);
=======
				'CalendarQuery',
				`fetchEventLists: newTodos=${JSON.stringify(newTodos)}`
			)
>>>>>>> Stashed changes
		} catch (err: unknown) {
			logger.log('CalendarQuery', 'fetchEventLists: error', err)
			setErrorInfo(err as Error)
		} finally {
			setFetching(false)
		}
	}, [api, path, query, settings])

	useEffect(() => {
		fetchEventLists()
	}, [fetchEventLists])

	return (
		<div>
			{eventsListTitle.length > 0 && (
				<h4 className="todo-list-query-title">{eventsListTitle}</h4>
			)}
			<button
				className="todo-list-refresh-button"
				onClick={fetchEventLists}
				disabled={fetching}
			>
				<RefreshSpinner fetching={fetching} />
			</button>

			{fetchedOnce && (
				<>
					{todos.length === 0 ? (
						<NoTaskDisplay />
					) : (
						<ul className="contains-todo-list todo-list-todo-list">
							{todos.map((todo) => (
								<TaskRenderer
									key={todo.calUId}
									settings={settings}
									todo={todo}
									patchTodoToDone={api.patchTodoToDone}
								/>
							))}
						</ul>
					)}
				</>
			)}

			{errorInfo && <ErrorDisplay error={errorInfo} />}
		</div>
	)
}

export default CalendarQuery
