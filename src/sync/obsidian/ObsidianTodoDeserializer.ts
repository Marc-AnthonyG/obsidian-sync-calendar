import type { TodoDetails } from "./MdTodo";
import moment from "moment";
import { logger } from "src/util/Logger";
import {
	DEFAULT_SYMBOLS,
	TodoRegularExpressions,
	type DefaultTodoSerializerSymbols,
} from "./ObsidianTodoSerializer";

type TodoParser = {
	regex: RegExp;
	process: (
		match: RegExpMatchArray,
		details: Partial<TodoDetails>,
		line: string,
	) => {
		updatedLine: string;
	};
};

export class ObsidianTodoDeserializer {
	constructor(
		public readonly symbols: DefaultTodoSerializerSymbols = DEFAULT_SYMBOLS,
	) {}

	// Array of parser functions
	private parsers: TodoParser[] = [
		// Block ID parser
		{
			regex: this.symbols.TodoFormatRegularExpressions.blockIdRegex,
			process: (match, details, line) => {
				details.blockId = match[1];
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.blockIdRegex,
							"",
						)
						.trim(),
				};
			},
		},

		// Start date parser (YYYY-MM-DD format)
		{
			regex: this.symbols.TodoFormatRegularExpressions.startDateRegex,
			process: (match, details, line) => {
				details.startDateTime = moment(
					match[1],
					TodoRegularExpressions.dateFormat,
				);
				details.isAllDay = true;
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.startDateRegex,
							"",
						)
						.trim(),
				};
			},
		},

		// Start date-time parser (YYYY-MM-DD@HH:mm format)
		{
			regex: this.symbols.TodoFormatRegularExpressions.startDateTimeRegex,
			process: (match, details, line) => {
				details.startDateTime = moment(
					match[1],
					TodoRegularExpressions.dateTimeFormat,
				);
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.startDateTimeRegex,
							"",
						)
						.trim(),
					matched: true,
				};
			},
		},

		// Due date parser (YYYY-MM-DD format)
		{
			regex: this.symbols.TodoFormatRegularExpressions.dueDateRegex,
			process: (match, details, line) => {
				details.dueDateTime = moment(
					match[1],
					TodoRegularExpressions.dateFormat,
				);
				details.isAllDay = true;
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.dueDateRegex,
							"",
						)
						.trim(),
					matched: true,
				};
			},
		},

		// Due date-time parser (YYYY-MM-DD@HH:mm format)
		{
			regex: this.symbols.TodoFormatRegularExpressions.dueDateTimeRegex,
			process: (match, details, line) => {
				details.dueDateTime = moment(
					match[1],
					TodoRegularExpressions.dateTimeFormat,
				);
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.dueDateTimeRegex,
							"",
						)
						.trim(),
					matched: true,
				};
			},
		},

		// Done date parser
		{
			regex: this.symbols.TodoFormatRegularExpressions.doneDateRegex,
			process: (match, details, line) => {
				details.doneDateTime = moment(
					match[1],
					TodoRegularExpressions.dateFormat,
				);
				return {
					updatedLine: line
						.replace(
							this.symbols.TodoFormatRegularExpressions
								.doneDateRegex,
							"",
						)
						.trim(),
					matched: true,
				};
			},
		},

		// Tags parser
		{
			regex: TodoRegularExpressions.hashTagsFloating,
			process: (match, details, line) => {
				if (!details.tags) {
					details.tags = [];
				}
				const tagName = match[0].trim();
				details.tags.push(tagName);
				return {
					updatedLine: line
						.replace(TodoRegularExpressions.hashTagsFloating, "")
						.trim(),
					matched: true,
				};
			},
		},

		// Legacy ISO format date parsers for backward compatibility
		{
			regex: /🛫 *([0-9T:.Z-]+)$/u, // ISO format for start date
			process: (match, details, line) => {
				try {
					details.startDateTime = moment(match[1]);
					return {
						updatedLine: line
							.replace(/🛫 *([0-9T:.Z-]+)$/u, "")
							.trim(),
						matched: true,
					};
				} catch (e) {
					return { updatedLine: line, matched: false };
				}
			},
		},
		{
			regex: /[📅📆🗓] *([0-9T:.Z-]+)$/u, // ISO format for due date
			process: (match, details, line) => {
				try {
					details.dueDateTime = moment(match[1]);
					return {
						updatedLine: line
							.replace(/[📅📆🗓] *([0-9T:.Z-]+)$/u, "")
							.trim(),
						matched: true,
					};
				} catch (e) {
					return { updatedLine: line, matched: false };
				}
			},
		},
	];

	public fromObsidianTodo(
		line: string,
		startMoment: moment.Moment,
	): TodoDetails | null {
		// Initialize empty details
		const details: Partial<TodoDetails> = {
			content: "",
			blockId: null,
			tags: [],
			startDateTime: undefined,
			dueDateTime: null,
			doneDateTime: null,
			isAllDay: false,
		};

		let currentLine = line;

		// Try each parser
		for (const parser of this.parsers) {
			const match = currentLine.match(parser.regex);
			if (match) {
				const result = parser.process(match, details, currentLine);
				currentLine = result.updatedLine;
			}
		}

		// Set content to remaining line
		details.content = currentLine;

		// Default start/due dates if not set
		if (!details.startDateTime) {
			details.startDateTime = startMoment;
			details.dueDateTime = startMoment.clone().add(1, "day");
			details.isAllDay = true;
			logger.log(
				"ObsidianTodoDeserializer",
				`startDateTime=${details.startDateTime}, dueDateTime=${details.dueDateTime}`,
			);
		}

		return details as TodoDetails;
	}
}
