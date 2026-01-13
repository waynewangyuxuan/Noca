import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { Capture } from '../shared/types.js';
import { getLogger } from '../shared/logger.js';
import { CaptureStorage } from '../storage/storage.js';
import { callClaudeWithInput } from './claude.js';

const logger = getLogger();

/**
 * AI Processor for organizing daily captures
 */
export class Processor {
  private storage: CaptureStorage;
  private promptPath: string;
  private outputDir: string;

  constructor(basePath?: string) {
    const base = basePath || path.join(os.homedir(), 'noca');
    this.storage = new CaptureStorage(base);
    this.promptPath = path.join(process.cwd(), 'config', 'prompt.md');
    this.outputDir = path.join(base, 'processed');
  }

  /**
   * Load captures for a specific date
   */
  loadCaptures(date: string): Capture[] {
    return this.storage.loadByDate(date);
  }

  /**
   * Get today's date in YYYY-MM-DD format (local time, not UTC)
   */
  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  /**
   * Load the prompt template
   */
  private loadPrompt(): string {
    if (!fs.existsSync(this.promptPath)) {
      throw new Error(`Prompt file not found: ${this.promptPath}`);
    }
    return fs.readFileSync(this.promptPath, 'utf-8');
  }

  /**
   * Build the full prompt with captures
   */
  buildPrompt(captures: Capture[], date: string): string {
    const basePrompt = this.loadPrompt();
    const capturesJson = JSON.stringify(captures, null, 2);

    return `${basePrompt}

日期: ${date}

内容:
${capturesJson}`;
  }

  /**
   * Process captures for a specific date
   */
  async process(date?: string): Promise<string> {
    const targetDate = date || this.getToday();
    logger.info(`Processing date: ${targetDate}`);

    const captures = this.loadCaptures(targetDate);

    if (captures.length === 0) {
      logger.info(`No captures found for ${targetDate}`);
      return `No captures for ${targetDate}`;
    }

    logger.info(`Loaded ${captures.length} captures`);

    const prompt = this.buildPrompt(captures, targetDate);
    const capturesJson = JSON.stringify(captures, null, 2);

    // Call Claude with the prompt and captures
    logger.info('Calling Claude AI for processing...');
    const result = await callClaudeWithInput(prompt, capturesJson);
    logger.info('AI processing completed');

    // Save the result
    this.ensureOutputDir();
    const outputPath = path.join(this.outputDir, `${targetDate}.md`);
    fs.writeFileSync(outputPath, result);

    logger.info(`Saved to: ${outputPath}`);
    return result;
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Get output file path for a date
   */
  getOutputPath(date: string): string {
    return path.join(this.outputDir, `${date}.md`);
  }
}
