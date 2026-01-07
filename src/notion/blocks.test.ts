import { describe, it, expect } from 'vitest';
import { markdownToBlocks } from './blocks.js';

describe('markdownToBlocks', () => {
  describe('headings', () => {
    it('should convert heading 1', () => {
      const blocks = markdownToBlocks('# Hello World');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading_1');
      const block = blocks[0] as any;
      expect(block.heading_1.rich_text[0]).toMatchObject({
        type: 'text',
        text: { content: 'Hello World' },
      });
    });

    it('should convert heading 2', () => {
      const blocks = markdownToBlocks('## Section Title');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading_2');
    });

    it('should convert heading 3', () => {
      const blocks = markdownToBlocks('### Subsection');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading_3');
    });
  });

  describe('lists', () => {
    it('should convert unordered list with dash', () => {
      const blocks = markdownToBlocks('- Item one\n- Item two');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('bulleted_list_item');
      expect(blocks[1].type).toBe('bulleted_list_item');
    });

    it('should convert unordered list with asterisk', () => {
      const blocks = markdownToBlocks('* First\n* Second');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('bulleted_list_item');
    });

    it('should convert numbered list', () => {
      const blocks = markdownToBlocks('1. First\n2. Second\n3. Third');
      expect(blocks).toHaveLength(3);
      blocks.forEach((block) => {
        expect(block.type).toBe('numbered_list_item');
      });
    });

    it('should convert checkboxes', () => {
      const blocks = markdownToBlocks('- [ ] Unchecked\n- [x] Checked');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('to_do');
      expect(blocks[1].type).toBe('to_do');
      const block0 = blocks[0] as any;
      const block1 = blocks[1] as any;
      expect(block0.to_do.checked).toBe(false);
      expect(block1.to_do.checked).toBe(true);
    });
  });

  describe('paragraphs', () => {
    it('should convert plain text to paragraph', () => {
      const blocks = markdownToBlocks('This is plain text.');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });

    it('should skip empty lines', () => {
      const blocks = markdownToBlocks('Line one\n\nLine two');
      expect(blocks).toHaveLength(2);
      expect(blocks[0].type).toBe('paragraph');
      expect(blocks[1].type).toBe('paragraph');
    });
  });

  describe('special blocks', () => {
    it('should convert horizontal rule', () => {
      const blocks = markdownToBlocks('---');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('divider');
    });

    it('should convert quote', () => {
      const blocks = markdownToBlocks('> This is a quote');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('quote');
    });

    it('should convert code block', () => {
      const blocks = markdownToBlocks('```javascript\nconst x = 1;\n```');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('code');
      const block = blocks[0] as any;
      expect(block.code.language).toBe('javascript');
      expect(block.code.rich_text[0]).toMatchObject({
        type: 'text',
        text: { content: 'const x = 1;' },
      });
    });
  });

  describe('inline formatting', () => {
    it('should convert bold text', () => {
      const blocks = markdownToBlocks('This has **bold** text');
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
      const block = blocks[0] as any;
      const richText = block.paragraph.rich_text;
      expect(richText.length).toBeGreaterThan(1);
      const boldItem = richText.find((item: any) => item.annotations?.bold);
      expect(boldItem).toBeDefined();
      expect(boldItem?.text.content).toBe('bold');
    });

    it('should convert links', () => {
      const blocks = markdownToBlocks('Check [this link](https://example.com)');
      expect(blocks).toHaveLength(1);
      const block = blocks[0] as any;
      const richText = block.paragraph.rich_text;
      const linkItem = richText.find((item: any) => item.text.link);
      expect(linkItem).toBeDefined();
      expect(linkItem?.text.content).toBe('this link');
      expect(linkItem?.text.link?.url).toBe('https://example.com');
    });

    it('should convert inline code', () => {
      const blocks = markdownToBlocks('Use `console.log` for debugging');
      expect(blocks).toHaveLength(1);
      const block = blocks[0] as any;
      const richText = block.paragraph.rich_text;
      const codeItem = richText.find((item: any) => item.annotations?.code);
      expect(codeItem).toBeDefined();
      expect(codeItem?.text.content).toBe('console.log');
    });
  });

  describe('complex documents', () => {
    it('should handle mixed content', () => {
      const markdown = `# Daily Captures

## TODO
- [ ] Buy groceries
- [x] Send email

## 链接
- [GitHub](https://github.com)

## 想法
Just a random thought.

---

> Important quote here
`;
      const blocks = markdownToBlocks(markdown);
      expect(blocks.length).toBeGreaterThan(5);

      const types = blocks.map((b) => b.type);
      expect(types).toContain('heading_1');
      expect(types).toContain('heading_2');
      expect(types).toContain('to_do');
      expect(types).toContain('bulleted_list_item');
      expect(types).toContain('divider');
      expect(types).toContain('quote');
    });
  });
});
