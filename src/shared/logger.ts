import * as fs from 'node:fs';
import * as path from 'node:path';
import { getStoragePath } from './config.js';

export type LogLevel = 'INFO' | 'ERROR' | 'DEBUG';

/**
 * Simple file-based logger for Noca
 * Logs are stored in ~/noca/logs/ with one file per day
 */
export class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(getStoragePath(), 'logs');
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogPath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${date}.log`);
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  private write(level: LogLevel, message: string): void {
    const timestamp = this.formatTimestamp();
    const logLine = `[${timestamp}] ${level.padEnd(5)} ${message}\n`;

    // Write to file
    fs.appendFileSync(this.getLogPath(), logLine);

    // Also output to console for visibility
    if (level === 'ERROR') {
      console.error(logLine.trim());
    } else {
      console.log(logLine.trim());
    }
  }

  info(message: string): void {
    this.write('INFO', message);
  }

  error(message: string): void {
    this.write('ERROR', message);
  }

  debug(message: string): void {
    this.write('DEBUG', message);
  }
}

// Singleton instance
let loggerInstance: Logger | null = null;

export function getLogger(): Logger {
  if (!loggerInstance) {
    loggerInstance = new Logger();
  }
  return loggerInstance;
}
