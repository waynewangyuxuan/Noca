import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { Capture } from '../shared/types.js';

/**
 * Storage manager for daily captures
 * Stores captures in JSON files at ~/noca/captures/{YYYY-MM-DD}.json
 */
export class CaptureStorage {
  private readonly baseDir: string;
  private readonly capturesDir: string;

  constructor(basePath?: string) {
    this.baseDir = basePath || path.join(os.homedir(), 'noca');
    this.capturesDir = path.join(this.baseDir, 'captures');
  }

  /**
   * Get the file path for a specific date
   */
  getStoragePath(date: string): string {
    return path.join(this.capturesDir, `${date}.json`);
  }

  /**
   * Get today's date in YYYY-MM-DD format (local time, not UTC)
   */
  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Ensure the captures directory exists
   */
  private ensureDir(): void {
    if (!fs.existsSync(this.capturesDir)) {
      fs.mkdirSync(this.capturesDir, { recursive: true });
    }
  }

  /**
   * Save a capture to today's file
   */
  save(capture: Capture): void {
    this.ensureDir();
    const today = this.getToday();
    const filePath = this.getStoragePath(today);

    let captures: Capture[] = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      captures = JSON.parse(content) as Capture[];
    }

    captures.push(capture);
    fs.writeFileSync(filePath, JSON.stringify(captures, null, 2));
  }

  /**
   * Load captures for a specific date
   */
  loadByDate(date: string): Capture[] {
    const filePath = this.getStoragePath(date);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Capture[];
  }

  /**
   * Load today's captures
   */
  loadToday(): Capture[] {
    return this.loadByDate(this.getToday());
  }

  /**
   * Get base directory path
   */
  getBaseDir(): string {
    return this.baseDir;
  }
}
