import moment from 'moment'
import { isSortingOption, sortingOptions } from './Query'
import type { Query } from './Query'
import YAML from 'yaml'
import { logger } from 'src/util/Logger'

/**
 * Custom error class for parsing errors
 */
export class ParsingError extends Error {
<<<<<<< Updated upstream
	inner: Error | undefined;

	constructor(msg: string, inner: Error | undefined = undefined) {
		super(msg);
		this.inner = inner;
=======
	inner: Error | undefined

	constructor(msg: string, inner: Error | undefined = undefined) {
		super(msg)
		this.inner = inner
>>>>>>> Stashed changes
	}

	public toString(): string {
		if (this.inner) {
<<<<<<< Updated upstream
			return `${this.message}: '${this.inner}'`;
		}

		return super.toString();
=======
			return `${this.message}: '${this.inner}'`
		}

		return super.toString()
>>>>>>> Stashed changes
	}
}

/**
 * Parses a raw string into a Query object
 * @param raw - the raw string to parse
 * @returns the parsed Query object
 * @throws ParsingError if the raw string cannot be parsed
 */
export function parseQuery(raw: string): Query {
<<<<<<< Updated upstream
	const query = parseObject(YAML.parse(raw));
	logger.log("Parser", `parseQuery: query=${JSON.stringify(query)}`);
	return query;
=======
	const query = parseObject(YAML.parse(raw))
	logger.log('Parser', `parseQuery: query=${JSON.stringify(query)}`)
	return query
>>>>>>> Stashed changes
}

/**
 * Parses a generic object into a Query object
 * @param query - the object to parse
 * @returns the parsed Query object
 * @throws ParsingError if the object is not a valid Query object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseObject(query: any): Query {
<<<<<<< Updated upstream
	if (query.hasOwnProperty("name") && typeof query.name !== "string") {
		throw new ParsingError("'name' field must be a string");
	}

	if (query.hasOwnProperty("filter") && typeof query.filter !== "string") {
		throw new ParsingError("'filter' field must be a string");
	}

	if (query.hasOwnProperty("timeMin")) {
		if (typeof query.timeMin !== "string") {
			throw new ParsingError("'timeMin' field must be a string");
		}
		if (!moment(query.timeMin).isValid()) {
			throw new ParsingError(
				"'timeMin' field must be a valid moment string",
			);
		}
	}

	if (query.hasOwnProperty("timeMax")) {
		if (typeof query.timeMax !== "string") {
			throw new ParsingError("'timeMax' field must be a string");
		}
		if (!moment(query.timeMax).isValid()) {
			throw new ParsingError(
				"'timeMax' field must be a valid moment string",
			);
=======
	if (query.hasOwnProperty('name') && typeof query.name !== 'string') {
		throw new ParsingError("'name' field must be a string")
	}

	if (query.hasOwnProperty('filter') && typeof query.filter !== 'string') {
		throw new ParsingError("'filter' field must be a string")
	}

	if (query.hasOwnProperty('timeMin')) {
		if (typeof query.timeMin !== 'string') {
			throw new ParsingError("'timeMin' field must be a string")
		}
		if (!moment(query.timeMin).isValid()) {
			throw new ParsingError(
				"'timeMin' field must be a valid moment string"
			)
		}
	}

	if (query.hasOwnProperty('timeMax')) {
		if (typeof query.timeMax !== 'string') {
			throw new ParsingError("'timeMax' field must be a string")
		}
		if (!moment(query.timeMax).isValid()) {
			throw new ParsingError(
				"'timeMax' field must be a valid moment string"
			)
>>>>>>> Stashed changes
		}
	}

	if (
<<<<<<< Updated upstream
		query.hasOwnProperty("maxEvents") &&
		typeof query.maxEvents !== "number"
	) {
		throw new ParsingError("'maxEvents' field must be a number");
	}

	if (query.hasOwnProperty("group") && typeof query.group != "boolean") {
		throw new ParsingError("'group' field must be a boolean.");
	}

	if (query.hasOwnProperty("sorting")) {
		if (!Array.isArray(query.sorting)) {
			throw new ParsingError(
				`'sorting' field must be an array of strings within the set [${formatSortingOpts()}].`,
			);
		}

		const sorting = query.sorting as any[];

		for (const element of sorting) {
			if (!(typeof element == "string") || !isSortingOption(element)) {
				throw new ParsingError(
					`'sorting' field must be an array of strings within the set [${formatSortingOpts()}].`,
				);
=======
		query.hasOwnProperty('maxEvents') &&
		typeof query.maxEvents !== 'number'
	) {
		throw new ParsingError("'maxEvents' field must be a number")
	}

	if (query.hasOwnProperty('group') && typeof query.group != 'boolean') {
		throw new ParsingError("'group' field must be a boolean.")
	}

	if (query.hasOwnProperty('sorting')) {
		if (!Array.isArray(query.sorting)) {
			throw new ParsingError(
				`'sorting' field must be an array of strings within the set [${formatSortingOpts()}].`
			)
		}

		const sorting = query.sorting as any[]

		for (const element of sorting) {
			if (!(typeof element == 'string') || !isSortingOption(element)) {
				throw new ParsingError(
					`'sorting' field must be an array of strings within the set [${formatSortingOpts()}].`
				)
>>>>>>> Stashed changes
			}
		}
	}

<<<<<<< Updated upstream
	return query as Query;
=======
	return query as Query
>>>>>>> Stashed changes
}

/**
 * Formats the sorting options as a string
 * @returns the formatted string of sorting options
 */
function formatSortingOpts(): string {
<<<<<<< Updated upstream
	return sortingOptions.map((e) => `'${e}'`).join(", ");
=======
	return sortingOptions.map((e) => `'${e}'`).join(', ')
>>>>>>> Stashed changes
}
