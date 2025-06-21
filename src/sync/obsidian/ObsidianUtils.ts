import type { STask } from "obsidian-dataview";
import crypto from "crypto";
import { App, Notice, TFile } from "obsidian";
import { Mutex } from "async-mutex";

export async function createTodoId(
	task: STask,
	app: App,
	fileMutex: Mutex,
): Promise<string> {
	const hash = crypto.createHash("sha256").update(task.text).digest();
	let shorternTaskHash = parseInt(hash.toString("hex").slice(0, 16), 16)
		.toString(36)
		.toUpperCase();
	shorternTaskHash = shorternTaskHash.padStart(8, "0");

	await fileMutex.runExclusive(async () => {
		const file = app.vault.getAbstractFileByPath(task.path);
		if (!(file instanceof TFile)) {
			new Notice(
				`sync-calendar: No file found for task ${task.text}. Retrying ...`,
			);
			return;
		}

		const fileContent = await app.vault.read(file);
		const fileLines = fileContent.split("\n");

		const updatedFileLines = [
			...fileLines.slice(0, task.position.start.line),
			`${fileLines[task.position.start.line]} ^${shorternTaskHash}`,
			...fileLines.slice(task.position.start.line + 1),
		];

		await app.vault.modify(file, updatedFileLines.join("\n"));
	});
	return shorternTaskHash;
}
