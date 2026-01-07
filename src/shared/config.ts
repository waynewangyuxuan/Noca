import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface NotionConfig {
  token: string;
  pageId: string;
}

export interface StorageConfig {
  path: string;
}

export interface NocaConfig {
  notion: NotionConfig;
  storage: StorageConfig;
}

const DEFAULT_CONFIG: NocaConfig = {
  notion: {
    token: '',
    pageId: '',
  },
  storage: {
    path: '~/noca',
  },
};

/**
 * Expand ~ to home directory
 */
function expandPath(p: string): string {
  if (p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

/**
 * Get the config file path
 */
export function getConfigPath(): string {
  return path.join(os.homedir(), 'noca', 'config.json');
}

/**
 * Load configuration from ~/noca/config.json
 */
export function loadConfig(): NocaConfig {
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content) as Partial<NocaConfig>;

    return {
      notion: {
        token: config.notion?.token || DEFAULT_CONFIG.notion.token,
        pageId: config.notion?.pageId || DEFAULT_CONFIG.notion.pageId,
      },
      storage: {
        path: expandPath(config.storage?.path || DEFAULT_CONFIG.storage.path),
      },
    };
  } catch {
    console.error('Error loading config, using defaults');
    return DEFAULT_CONFIG;
  }
}

/**
 * Check if Notion is configured
 */
export function isNotionConfigured(): boolean {
  const config = loadConfig();
  return !!config.notion.token && !!config.notion.pageId;
}

/**
 * Get storage path from config
 */
export function getStoragePath(): string {
  const config = loadConfig();
  return expandPath(config.storage.path);
}
