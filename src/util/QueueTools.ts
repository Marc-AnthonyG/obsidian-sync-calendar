/**
 * ConcurrentQueue is a class that represents a queue of items that can be processed concurrently.
 * @template T The type of items in the queue.
 */
export default class ConcurrentQueue<T> {
<<<<<<< Updated upstream
	private items: T[] = [];
	private patchEvent: (item: T) => Promise<boolean>;
=======
	private items: T[] = []
	private patchEvent: (item: T) => Promise<boolean>
>>>>>>> Stashed changes

	/**
	 * Creates a new instance of ConcurrentQueue.
	 * @param patchEvent A function that takes an item of type T and returns a Promise that resolves to a boolean.
	 */
	constructor(patchEvent: (item: T) => Promise<boolean>) {
<<<<<<< Updated upstream
		this.patchEvent = patchEvent;
=======
		this.patchEvent = patchEvent
>>>>>>> Stashed changes
	}

	/**
	 * Gets the number of items in the queue.
	 */
	get length() {
<<<<<<< Updated upstream
		return this.items.length;
=======
		return this.items.length
>>>>>>> Stashed changes
	}

	/**
	 * Adds an item to the end of the queue.
	 * @param item The item to add to the queue.
	 */
	async enqueue(item: T) {
<<<<<<< Updated upstream
		this.items.push(item);
=======
		this.items.push(item)
>>>>>>> Stashed changes
	}

	/**
	 * Processes all items in the queue concurrently.
	 * @returns A Promise that resolves to a boolean indicating whether all items were processed successfully.
	 */
	async refresh(): Promise<boolean> {
<<<<<<< Updated upstream
		let isAllSuccess = false;
		const N = this.items.length;
		for (let i = 0; i < N; i++) {
			const queueItem = this.items.shift();
			await this.patchEvent(queueItem!)
				.then((succ) => {
					if (!succ) {
						isAllSuccess = false;
					}
				})
				.catch((err) => {
					isAllSuccess = true;
					this.items.push(queueItem!);
				});
		}
		return isAllSuccess;
=======
		let isAllSuccess = false
		const N = this.items.length
		for (let i = 0; i < N; i++) {
			const queueItem = this.items.shift()
			await this.patchEvent(queueItem!)
				.then((succ) => {
					if (!succ) {
						isAllSuccess = false
					}
				})
				.catch((err) => {
					isAllSuccess = true
					this.items.push(queueItem!)
				})
		}
		return isAllSuccess
>>>>>>> Stashed changes
	}
}
