/**
 * An array of available sorting options.
 */
<<<<<<< Updated upstream
export const sortingOptions = ["date", "dateDESC", "priority", "priorityDESC"];
=======
export const sortingOptions = ['date', 'dateDESC', 'priority', 'priorityDESC']
>>>>>>> Stashed changes

/**
 * A type representing a sorting option.
 */
<<<<<<< Updated upstream
export type SortingOption = (typeof sortingOptions)[number];
=======
export type SortingOption = (typeof sortingOptions)[number]
>>>>>>> Stashed changes

/**
 * A type guard to check if a value is a valid sorting option.
 * @param value The value to check.
 * @returns True if the value is a valid sorting option, false otherwise.
 */
export function isSortingOption(value: string): value is SortingOption
export function isSortingOption(value: any) {
<<<<<<< Updated upstream
	return sortingOptions.includes(value);
=======
	return sortingOptions.includes(value)
>>>>>>> Stashed changes
}

/**
 * An interface representing a query.
 */
export type Query = {
<<<<<<< Updated upstream
	name?: string;
	timeMin?: string;
	timeMax?: string;
};
=======
	name?: string
	timeMin?: string
	timeMax?: string
}
>>>>>>> Stashed changes
