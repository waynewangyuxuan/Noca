import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { CaptureStorage } from './storage.js';
import type { Capture } from '../shared/types.js';

describe('CaptureStorage', () => {
  let storage: CaptureStorage;
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = path.join(os.tmpdir(), `noca-test-${Date.now()}`);
    storage = new CaptureStorage(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getStoragePath', () => {
    it('should return correct path for a date', () => {
      const result = storage.getStoragePath('2026-01-07');
      expect(result).toBe(path.join(testDir, 'captures', '2026-01-07.json'));
    });
  });

  describe('save', () => {
    it('should save capture to JSON file', () => {
      const capture: Capture = {
        content: 'https://example.com',
        type: 'url',
        note: 'Test note',
        time: '10:30:00',
      };

      storage.save(capture);

      const today = new Date().toISOString().split('T')[0];
      const filePath = storage.getStoragePath(today);
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      const captures = JSON.parse(content) as Capture[];
      expect(captures).toHaveLength(1);
      expect(captures[0]).toEqual(capture);
    });

    it('should append to existing captures', () => {
      const capture1: Capture = {
        content: 'First capture',
        type: 'text',
        note: null,
        time: '09:00:00',
      };
      const capture2: Capture = {
        content: 'Second capture',
        type: 'text',
        note: 'Note',
        time: '10:00:00',
      };

      storage.save(capture1);
      storage.save(capture2);

      const today = new Date().toISOString().split('T')[0];
      const captures = storage.loadByDate(today);
      expect(captures).toHaveLength(2);
      expect(captures[0]).toEqual(capture1);
      expect(captures[1]).toEqual(capture2);
    });
  });

  describe('loadByDate', () => {
    it('should load captures for a specific date', () => {
      const capture: Capture = {
        content: 'Test content',
        type: 'text',
        note: null,
        time: '12:00:00',
      };

      storage.save(capture);

      const today = new Date().toISOString().split('T')[0];
      const result = storage.loadByDate(today);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(capture);
    });

    it('should return empty array for non-existent date', () => {
      const result = storage.loadByDate('1999-01-01');
      expect(result).toEqual([]);
    });
  });

  describe('loadToday', () => {
    it('should load today\'s captures', () => {
      const capture: Capture = {
        content: 'Today\'s capture',
        type: 'text',
        note: null,
        time: '14:00:00',
      };

      storage.save(capture);

      const result = storage.loadToday();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(capture);
    });

    it('should return empty array if no captures today', () => {
      const result = storage.loadToday();
      expect(result).toEqual([]);
    });
  });
});
