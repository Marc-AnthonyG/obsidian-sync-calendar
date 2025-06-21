type Listener = (content: string) => void

class ContentStore {
<<<<<<< Updated upstream
	private store = new Map<string, string>();
	private listeners = new Map<string, Set<Listener>>();

	get(eventId: string): string | undefined {
		return this.store.get(eventId);
	}

	set(eventId: string, content: string): void {
		this.store.set(eventId, content);
		this.notify(eventId);
	}

	has(eventId: string): boolean {
		return this.store.has(eventId);
=======
	private store = new Map<string, string>()
	private listeners = new Map<string, Set<Listener>>()

	get(eventId: string): string | undefined {
		return this.store.get(eventId)
	}

	set(eventId: string, content: string): void {
		this.store.set(eventId, content)
		this.notify(eventId)
	}

	has(eventId: string): boolean {
		return this.store.has(eventId)
>>>>>>> Stashed changes
	}

	subscribe(eventId: string, listener: Listener): () => void {
		if (!this.listeners.has(eventId)) {
<<<<<<< Updated upstream
			this.listeners.set(eventId, new Set());
		}
		this.listeners.get(eventId)?.add(listener);

		// Unsubscribe function
		return () => {
			this.listeners.get(eventId)?.delete(listener);
		};
	}

	private notify(eventId: string): void {
		const content = this.store.get(eventId);
		if (content === undefined) return;

		this.listeners.get(eventId)?.forEach((listener) => {
			listener(content);
		});
	}
}

export const contentStore = new ContentStore();
=======
			this.listeners.set(eventId, new Set())
		}
		this.listeners.get(eventId)?.add(listener)

		// Unsubscribe function
		return () => {
			this.listeners.get(eventId)?.delete(listener)
		}
	}

	private notify(eventId: string): void {
		const content = this.store.get(eventId)
		if (content === undefined) return

		this.listeners.get(eventId)?.forEach((listener) => {
			listener(content)
		})
	}
}

export const contentStore = new ContentStore()
>>>>>>> Stashed changes
