import { execSync } from 'node:child_process';
import * as path from 'node:path';
import * as dotenv from 'dotenv';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Get Claude path from env, fallback to 'claude' for PATH lookup
const CLAUDE_PATH = process.env.CLAUDE_PATH || 'claude';

/**
 * Call Claude CLI with a prompt
 * Uses the `claude` command from Claude Code
 */
export async function callClaude(prompt: string): Promise<string> {
  try {
    // Use claude CLI with -p flag for prompt mode
    const result = execSync(`${CLAUDE_PATH} -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Failed to call Claude: ${error}`);
  }
}

/**
 * Call Claude CLI with stdin input
 */
export async function callClaudeWithInput(prompt: string, input: string): Promise<string> {
  try {
    const result = execSync(`echo '${input.replace(/'/g, "\\'")}' | ${CLAUDE_PATH} -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      shell: '/bin/bash',
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Failed to call Claude: ${error}`);
  }
}
