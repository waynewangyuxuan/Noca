import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints.js';

// Simple rich text item type for internal use
// Using 'any' cast when passing to Notion to avoid complex type compatibility issues
interface RichTextItem {
  type: 'text';
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
  };
}

/**
 * Parse inline markdown elements (bold, italic, code, links)
 */
function parseInlineMarkdown(text: string): RichTextItem[] {
  const items: RichTextItem[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Match link: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      items.push({
        type: 'text',
        text: { content: linkMatch[1], link: { url: linkMatch[2] } },
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Match bold: **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      items.push({
        type: 'text',
        text: { content: boldMatch[1] },
        annotations: { bold: true },
      });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Match italic: *text* or _text_
    const italicMatch = remaining.match(/^(\*|_)([^*_]+)\1/);
    if (italicMatch) {
      items.push({
        type: 'text',
        text: { content: italicMatch[2] },
        annotations: { italic: true },
      });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Match inline code: `text`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      items.push({
        type: 'text',
        text: { content: codeMatch[1] },
        annotations: { code: true },
      });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Find next special character or take all remaining
    const nextSpecial = remaining.search(/[\[*_`]/);
    if (nextSpecial === -1) {
      items.push({ type: 'text', text: { content: remaining } });
      break;
    } else if (nextSpecial === 0) {
      // Special character at start but not matched above, treat as plain text
      items.push({ type: 'text', text: { content: remaining[0] } });
      remaining = remaining.slice(1);
    } else {
      items.push({ type: 'text', text: { content: remaining.slice(0, nextSpecial) } });
      remaining = remaining.slice(nextSpecial);
    }
  }

  return items.length > 0 ? items : [{ type: 'text', text: { content: '' } }];
}

/**
 * Convert markdown text to Notion blocks
 */
export function markdownToBlocks(markdown: string): BlockObjectRequest[] {
  const blocks: BlockObjectRequest[] = [];
  const lines = markdown.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line -> skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Heading 1: # text
    if (line.startsWith('# ')) {
      blocks.push({
        object: 'block',
        type: 'heading_1',
        heading_1: {
          rich_text: parseInlineMarkdown(line.slice(2)) as any,
        },
      });
      i++;
      continue;
    }

    // Heading 2: ## text
    if (line.startsWith('## ')) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: parseInlineMarkdown(line.slice(3)) as any,
        },
      });
      i++;
      continue;
    }

    // Heading 3: ### text
    if (line.startsWith('### ')) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: parseInlineMarkdown(line.slice(4)) as any,
        },
      });
      i++;
      continue;
    }

    // Checkbox: - [ ] or - [x] (must check before unordered list)
    const checkboxMatch = line.match(/^- \[([ x])\] (.+)/);
    if (checkboxMatch) {
      blocks.push({
        object: 'block',
        type: 'to_do',
        to_do: {
          rich_text: parseInlineMarkdown(checkboxMatch[2]) as any,
          checked: checkboxMatch[1] === 'x',
        },
      });
      i++;
      continue;
    }

    // Unordered list: - text or * text
    if (line.match(/^[-*] /)) {
      blocks.push({
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: parseInlineMarkdown(line.slice(2)) as any,
        },
      });
      i++;
      continue;
    }

    // Numbered list: 1. text
    if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '');
      blocks.push({
        object: 'block',
        type: 'numbered_list_item',
        numbered_list_item: {
          rich_text: parseInlineMarkdown(content) as any,
        },
      });
      i++;
      continue;
    }

    // Horizontal rule: ---
    if (line.match(/^-{3,}$/)) {
      blocks.push({
        object: 'block',
        type: 'divider',
        divider: {},
      });
      i++;
      continue;
    }

    // Code block: ```
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || 'plain text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        object: 'block',
        type: 'code',
        code: {
          rich_text: [{ type: 'text', text: { content: codeLines.join('\n') } }],
          language: language as 'plain text',
        },
      });
      i++; // Skip closing ```
      continue;
    }

    // Quote: > text
    if (line.startsWith('> ')) {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: parseInlineMarkdown(line.slice(2)) as any,
        },
      });
      i++;
      continue;
    }

    // Toggle/Details block: <details><summary>title</summary>content</details>
    if (line.includes('<details>') || line.includes('<summary>')) {
      // Find the summary text
      let summaryText = '';
      let contentLines: string[] = [];
      let foundDetails = false;
      let foundSummary = false;
      let foundEndDetails = false;

      // Parse multi-line details block
      while (i < lines.length && !foundEndDetails) {
        const currentLine = lines[i];

        if (currentLine.includes('<details>')) {
          foundDetails = true;
        }

        // Extract summary
        const summaryMatch = currentLine.match(/<summary>(.+?)<\/summary>/);
        if (summaryMatch) {
          summaryText = summaryMatch[1];
          foundSummary = true;
          // Check if there's content after </summary> on the same line
          const afterSummary = currentLine.split('</summary>')[1];
          if (afterSummary && !afterSummary.includes('</details>')) {
            contentLines.push(afterSummary.trim());
          }
        } else if (foundSummary && !currentLine.includes('</details>')) {
          // Content lines between summary and end
          if (!currentLine.includes('<details>') && !currentLine.includes('<summary>')) {
            contentLines.push(currentLine);
          }
        }

        if (currentLine.includes('</details>')) {
          foundEndDetails = true;
          // Check if there's content before </details> on the same line
          const beforeEnd = currentLine.split('</details>')[0];
          if (beforeEnd && !beforeEnd.includes('<summary>') && !beforeEnd.includes('<details>')) {
            contentLines.push(beforeEnd.trim());
          }
        }

        i++;
      }

      // Create toggle block with children
      const childBlocks: BlockObjectRequest[] = [];
      for (const contentLine of contentLines) {
        if (contentLine.trim()) {
          childBlocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: parseInlineMarkdown(contentLine.trim()) as any,
            },
          });
        }
      }

      blocks.push({
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: parseInlineMarkdown(summaryText || 'Details') as any,
          children: childBlocks.length > 0 ? childBlocks : [{
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ type: 'text', text: { content: '' } }] },
          }],
        },
      } as BlockObjectRequest);

      continue;
    }

    // Default: paragraph
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: parseInlineMarkdown(line) as any,
      },
    });
    i++;
  }

  return blocks;
}

// Export type for testing
export type { RichTextItem };
