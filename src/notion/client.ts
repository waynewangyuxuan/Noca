import { Client } from '@notionhq/client';
import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints.js';
import { loadConfig, isNotionConfigured } from '../shared/config.js';
import { getLogger } from '../shared/logger.js';
import { markdownToBlocks } from './blocks.js';

const logger = getLogger();

/**
 * Notion client wrapper for Noca
 */
export class NotionClient {
  private client: Client | null = null;
  private pageId: string = '';

  constructor() {
    const config = loadConfig();
    if (config.notion.token) {
      this.client = new Client({ auth: config.notion.token });
      this.pageId = config.notion.pageId;
    }
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return isNotionConfigured();
  }

  /**
   * Test connection to Notion API
   */
  async connect(): Promise<boolean> {
    if (!this.client || !this.pageId) {
      console.error('Notion not configured. Please set up ~/noca/config.json');
      return false;
    }

    try {
      // Try to retrieve the page to verify connection
      await this.client.pages.retrieve({ page_id: this.pageId });
      return true;
    } catch (error) {
      console.error('Failed to connect to Notion:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Append markdown content to the configured Notion page
   */
  async appendContent(markdown: string): Promise<boolean> {
    if (!this.client || !this.pageId) {
      logger.error('Notion not configured');
      return false;
    }

    try {
      const blocks = markdownToBlocks(markdown);
      logger.info(`Pushing ${blocks.length} blocks to Notion`);

      // Add date divider at the start
      const dateBlock: BlockObjectRequest = {
        object: 'block',
        type: 'divider',
        divider: {},
      };

      await this.client.blocks.children.append({
        block_id: this.pageId,
        children: [dateBlock, ...blocks],
      });

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to append content to Notion: ${errorMsg}`);
      return false;
    }
  }

  /**
   * Append blocks directly to the page
   */
  async appendBlocks(blocks: BlockObjectRequest[]): Promise<boolean> {
    if (!this.client || !this.pageId) {
      console.error('Notion not configured');
      return false;
    }

    try {
      await this.client.blocks.children.append({
        block_id: this.pageId,
        children: blocks,
      });
      return true;
    } catch (error) {
      console.error('Failed to append blocks to Notion:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string | null> {
    if (!this.client || !this.pageId) {
      return null;
    }

    try {
      const page = await this.client.pages.retrieve({ page_id: this.pageId });
      if ('properties' in page && 'title' in page.properties) {
        const titleProp = page.properties.title;
        if ('title' in titleProp && Array.isArray(titleProp.title)) {
          return titleProp.title.map((t) => ('plain_text' in t ? t.plain_text : '')).join('');
        }
      }
      return null;
    } catch {
      return null;
    }
  }
}
