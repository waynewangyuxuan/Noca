import { execSync } from 'node:child_process';

/**
 * Call Claude CLI with a prompt
 * Uses the `claude` command from Claude Code
 */
export async function callClaude(prompt: string): Promise<string> {
  try {
    // Use claude CLI with -p flag for prompt mode
    const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
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
    const result = execSync(`echo '${input.replace(/'/g, "\\'")}' | claude -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      shell: '/bin/bash',
    });
    return result.trim();
  } catch (error) {
    throw new Error(`Failed to call Claude: ${error}`);
  }
}
