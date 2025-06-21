<<<<<<< Updated upstream
import * as fs from "fs";
import * as path from "path";

class Logger {
	private logFilePath: string;

	constructor(basePath: string) {
		this.logFilePath = path.join(basePath, "log.log");
		// Clear the log file on startup
		try {
			fs.writeFileSync(this.logFilePath, "");
		} catch (err) {
			console.error("Error clearing log file:", err);
=======
import * as fs from 'fs'
import * as path from 'path'

class Logger {
	private logFilePath: string

	constructor(basePath: string) {
		this.logFilePath = path.join(basePath, 'log.log')
		// Clear the log file on startup
		try {
			fs.writeFileSync(this.logFilePath, '')
		} catch (err) {
			console.error('Error clearing log file:', err)
>>>>>>> Stashed changes
		}
	}

	log(from: string, message: string, ...optionalParams: any[]): void {
<<<<<<< Updated upstream
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] [${from}] ${message} ${optionalParams.map((p) => JSON.stringify(p, null, 2)).join(" ")}\n`;

		try {
			fs.appendFileSync(this.logFilePath, logMessage);
		} catch (err) {
			console.error("Error writing to log file:", err);
=======
		const timestamp = new Date().toISOString()
		const logMessage = `[${timestamp}] [${from}] ${message} ${optionalParams.map((p) => JSON.stringify(p, null, 2)).join(' ')}\n`

		try {
			fs.appendFileSync(this.logFilePath, logMessage)
		} catch (err) {
			console.error('Error writing to log file:', err)
>>>>>>> Stashed changes
		}
	}

	error(from: string, message: string, ...optionalParams: any[]): void {
<<<<<<< Updated upstream
		this.log(from, message, ...optionalParams);
=======
		this.log(from, message, ...optionalParams)
>>>>>>> Stashed changes
	}
}

export const logger = new Logger(
<<<<<<< Updated upstream
	"/Users/marc-anthonygirard/repository/obsidian-sync-calendar",
);
=======
	'/Users/marc-anthonygirard/repository/obsidian-sync-calendar'
)
>>>>>>> Stashed changes
