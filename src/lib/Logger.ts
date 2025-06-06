import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private logFilePath: string;

  constructor(basePath: string) {
    this.logFilePath = path.join(basePath, 'log.log');
    // Clear the log file on startup
    try {
      fs.writeFileSync(this.logFilePath, '');
    } catch (err) {
      console.error('Error clearing log file:', err);
    }
  }

  log(message: string, ...optionalParams: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message} ${optionalParams.map(p => JSON.stringify(p, null, 2)).join(' ')}\n`;

    try {
      fs.appendFileSync(this.logFilePath, logMessage);
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  }
} 