import { App } from "obsidian";
import { GoogleSync } from "./google-calendar/GoogleSync";
import { MdSync } from "./markdown/MdSync";
import type { PartialTodo, Syncher } from "./Syncher";
import { logger } from "../../main";
import type { Todo } from "./Todo";

export class MainSync implements Syncher {
    private source: Syncher;
    private destination: Syncher;

    constructor(app: App) {
        this.source = new GoogleSync(app);
        this.destination = new MdSync(app);
    }
    pull(destination: Todo[]): Promise<Todo[]> {
        throw new Error("Method not implemented.");
    }
    fetchAll(): Promise<Todo[]> {
        throw new Error("Method not implemented.");
    }
    create(todo: Todo): Promise<Todo> {
        throw new Error("Method not implemented.");
    }
    update(todo: Todo): Promise<Todo> {
        throw new Error("Method not implemented.");
    }
    patch?(todo: Todo, fields: (keyof Todo)[]): Promise<Todo> {
        throw new Error("Method not implemented.");
    }
    delete(todo: PartialTodo): Promise<void> {
        throw new Error("Method not implemented.");
    }

    async sync() {
        logger.log("MainSync", "Starting sync...");

        const sourceTodos = await this.source.fetchAll();
        const destTodos = await this.destination.fetchAll();

        const sourceTodosMap = new Map(sourceTodos.map(t => [t.id, t]));
        const destTodosMap = new Map(destTodos.map(t => [t.id, t]));

        // Sync from source to destination
        for (const sourceTodo of sourceTodos) {
            const destTodo = destTodosMap.get(sourceTodo.id);
            if (!destTodo) {
                // New todo in source, create in destination
                logger.log("MainSync", `Creating in destination: ${sourceTodo.content}`);
                await this.destination.create(sourceTodo);
            } else {
                // Todo exists in both, check for updates
                // This simple sync logic uses 'etag' for updates.
                // A more robust implementation would compare timestamps and handle conflicts.
                if (sourceTodo.etag && destTodo.etag && sourceTodo.etag > destTodo.etag) {
                    logger.log("MainSync", `Updating in destination: ${sourceTodo.content}`);
                    await this.destination.update(sourceTodo);
                }
            }
        }

        // Sync from destination to source
        for (const destTodo of destTodos) {
            const sourceTodo = sourceTodosMap.get(destTodo.id);
            if (!sourceTodo) {
                // New todo in destination, create in source
                logger.log("MainSync", `Creating in source: ${destTodo.content}`);
                await this.source.create(destTodo);
            } else {
                // Todo exists in both, check for updates
                if (destTodo.etag && sourceTodo.etag && destTodo.etag > sourceTodo.etag) {
                    logger.log("MainSync", `Updating in source: ${destTodo.content}`);
                    await this.source.update(destTodo);
                }
            }
        }

        // Note: This simple sync logic does not handle deletions.
        // A more robust implementation would require tracking synced items
        // to detect deletions.

        logger.log("MainSync", "Sync finished.");
    }
}