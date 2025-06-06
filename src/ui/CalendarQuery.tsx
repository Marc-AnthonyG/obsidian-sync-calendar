import React, { useState, useEffect, useMemo, useCallback } from "react";

import type SyncCalendarPlugin from "main";
import type { Query } from "src/obsidian/injector/Query";
import { Todo } from "src/TodoSerialization/Todo";
import type { MainSynchronizer } from "src/Syncs/MainSynchronizer";

import ErrorDisplay from "./ErrorDisplay";
import TaskRenderer from "./TaskRenderer";
import NoTaskDisplay from "./NoTaskDisplay";

interface CalendarQueryProps {
	plugin: SyncCalendarPlugin;
	api: MainSynchronizer;
	query: Query;
}

const CalendarQuery: React.FC<CalendarQueryProps> = ({
	plugin,
	api,
	query,
}) => {
	const [fetching, setFetching] = useState(false);
	const [eventsList, setEventsList] = useState<Todo[]>([]);
	const [errorInfo, setErrorInfo] = useState<Error | null>(null);
	const [fetchedOnce, setFetchedOnce] = useState(false);

	const filterTodos = useCallback(
		(todoList: Todo[]) => {
			if (query && query.timeMax) {
				return todoList.filter((todo: Todo) => {
					if (Todo.isDatetime(todo.startDateTime ?? "")) {
						return window
							.moment(query.timeMax)
							.isAfter(window.moment(todo.startDateTime));
					} else {
						return window
							.moment(query.timeMax)
							.isAfter(window.moment(todo.startDateTime));
					}
				});
			}
			return todoList;
		},
		[query]
	);

	const todos = useMemo(
		() => filterTodos(eventsList),
		[eventsList, filterTodos]
	);

	const eventsListTitle = useMemo(() => {
		const title = query?.name
			? query.name
			: "{numberTodos} todos in calendar";
		return title.replace("{numberTodos}", todos.length.toString());
	}, [query, todos.length]);

	const fetchEventLists = useCallback(async () => {
		const apiIsReady = await api.isReady();
		if (!apiIsReady || fetching) {
			return;
		}

		setFetching(true);

		let startMoment = window
			.moment()
			.startOf("day")
			.subtract(
				window.moment.duration(plugin.settings.fetchWeeksAgo, "weeks")
			);
		if (query && query.timeMin) {
			startMoment = window.moment(query.timeMin);
		}

		const maxEvents = query?.maxEvents
			? query.maxEvents
			: plugin.settings.fetchMaximumEvents;

		const fetchPromise = api
			.pullTodosFromCalendar(startMoment, maxEvents)
			.then((newEventsList) => {
				setEventsList(newEventsList);
				setFetchedOnce(true);
				setErrorInfo(null);
			});

		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject(
					new Error(
						"Timeout occurred when fetching from Google Calendar!\nCheck your connection and proxy settings, then restart Obsidian."
					)
				);
			}, 4000);
		});

		try {
			await Promise.race([fetchPromise, timeoutPromise]);
		} catch (err: unknown) {
			setErrorInfo(err as Error);
		} finally {
			setFetching(false);
		}
	}, [
		api,
		plugin.settings.fetchWeeksAgo,
		plugin.settings.fetchMaximumEvents,
		query,
	]);

	useEffect(() => {
		fetchEventLists();
	}, [fetchEventLists]);

	useEffect(() => {
		if (!query.refreshInterval || query.refreshInterval === -1) {
			return;
		}

		const intervalId = window.setInterval(
			fetchEventLists,
			query.refreshInterval * 1000
		);

		return () => {
			clearInterval(intervalId);
		};
	}, [query.refreshInterval, fetchEventLists]);

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
				<svg
					className={fetching ? "todo-list-refresh-spin" : ""}
					width="20px"
					height="20px"
					viewBox="0 0 20 20"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						fillRule="evenodd"
						d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{fetchedOnce && (
				<>
					{eventsList.length === 0 ? (
						<NoTaskDisplay />
					) : todos.length !== 0 ? (
						<ul className="contains-todo-list todo-list-todo-list">
							{todos.map((todo) => (
								<TaskRenderer
									key={todo.calUId}
									api={api}
									plugin={plugin}
									todo={todo}
								/>
							))}
						</ul>
					) : (
						<NoTaskDisplay />
					)}
				</>
			)}

			{errorInfo && <ErrorDisplay error={errorInfo} />}
		</div>
	);
};

export default CalendarQuery;
