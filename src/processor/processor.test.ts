import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { Processor } from './processor.js';
import type { Capture } from '../shared/types.js';

describe('Processor', () => {
  let testDir: string;
  let processor: Processor;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'noca-processor-test-'));
    processor = new Processor(testDir);

    // Create captures directory and test data
    const capturesDir = path.join(testDir, 'captures');
    fs.mkdirSync(capturesDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  describe('loadCaptures', () => {
    it('should load captures for a specific date', () => {
      const testDate = '2024-01-15';
      const testCaptures: Capture[] = [
        { content: 'Test content', type: 'text', note: null, time: '10:00:00' },
        { content: 'https://example.com', type: 'url', note: 'Example site', time: '11:00:00' },
      ];

      const filePath = path.join(testDir, 'captures', `${testDate}.json`);
      fs.writeFileSync(filePath, JSON.stringify(testCaptures, null, 2));

      const loaded = processor.loadCaptures(testDate);
      expect(loaded).toHaveLength(2);
      expect(loaded[0].content).toBe('Test content');
      expect(loaded[1].type).toBe('url');
    });

    it('should return empty array for non-existent date', () => {
      const loaded = processor.loadCaptures('2024-99-99');
      expect(loaded).toEqual([]);
    });
  });

  describe('buildPrompt', () => {
    it('should build prompt with date and captures', () => {
      const testDate = '2024-01-15';
      const testCaptures: Capture[] = [
        { content: 'Buy milk', type: 'text', note: 'Grocery task', time: '10:00:00' },
        { content: 'https://github.com', type: 'url', note: null, time: '11:00:00' },
      ];

      const prompt = processor.buildPrompt(testCaptures, testDate);

      expect(prompt).toContain('2024-01-15');
      expect(prompt).toContain('Buy milk');
      expect(prompt).toContain('https://github.com');
      expect(prompt).toContain('Grocery task');
    });

    it('should include all captures in JSON format', () => {
      const testCaptures: Capture[] = [
        { content: '需要完成任务', type: 'text', note: null, time: '09:00:00' },
      ];

      const prompt = processor.buildPrompt(testCaptures, '2024-01-15');

      // Should contain JSON structure
      expect(prompt).toContain('"content"');
      expect(prompt).toContain('"type"');
      expect(prompt).toContain('"time"');
    });

    it('should handle empty captures array', () => {
      const prompt = processor.buildPrompt([], '2024-01-15');
      expect(prompt).toContain('2024-01-15');
      expect(prompt).toContain('[]');
    });
  });

  describe('getOutputPath', () => {
    it('should return correct output path for date', () => {
      const outputPath = processor.getOutputPath('2024-01-15');
      expect(outputPath).toContain('processed');
      expect(outputPath).toContain('2024-01-15.md');
    });
  });
});

describe('Processor Integration', () => {
  let testDir: string;
  let processor: Processor;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'noca-processor-int-'));
    processor = new Processor(testDir);

    // Create captures directory
    fs.mkdirSync(path.join(testDir, 'captures'), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should return message when no captures exist', async () => {
    const result = await processor.process('2024-01-15');
    expect(result).toBe('No captures for 2024-01-15');
  });
});
