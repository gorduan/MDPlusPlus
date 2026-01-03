/**
 * MD++ Markdown Parser - Converts MD++ markdown to TipTap-compatible JSON
 * Handles: Frontmatter, AI Context blocks, Directives, and standard Markdown
 */

import { JSONContent } from '@tiptap/react';

interface ParseContext {
  inFrontmatter: boolean;
  inCodeBlock: boolean;
  codeBlockLang: string;
  inDirective: boolean;
  directiveStack: DirectiveInfo[];
  inAIContext: boolean;
  inTable: boolean;
  tableRows: JSONContent[];
}

interface DirectiveInfo {
  framework: string;
  component: string;
  title: string;
  attributes: Record<string, string>;
  content: JSONContent[];
}

/**
 * Parse MD++ markdown into TipTap JSON content
 */
export function parseMarkdownToTipTap(markdown: string): JSONContent {
  const lines = markdown.split('\n');
  const content: JSONContent[] = [];

  const ctx: ParseContext = {
    inFrontmatter: false,
    inCodeBlock: false,
    codeBlockLang: '',
    inDirective: false,
    directiveStack: [],
    inAIContext: false,
    inTable: false,
    tableRows: [],
  };

  let frontmatterContent = '';
  let codeBlockContent = '';
  let aiContextContent = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Frontmatter handling
    if (i === 0 && line === '---') {
      ctx.inFrontmatter = true;
      i++;
      continue;
    }

    if (ctx.inFrontmatter) {
      if (line === '---') {
        ctx.inFrontmatter = false;
        content.push({
          type: 'frontmatter',
          attrs: { content: frontmatterContent.trim() },
        });
        frontmatterContent = '';
      } else {
        frontmatterContent += line + '\n';
      }
      i++;
      continue;
    }

    // Code block handling
    const codeBlockMatch = line.match(/^```(\w*)$/);
    if (codeBlockMatch && !ctx.inCodeBlock) {
      ctx.inCodeBlock = true;
      ctx.codeBlockLang = codeBlockMatch[1] || '';
      i++;
      continue;
    }

    if (ctx.inCodeBlock) {
      if (line === '```') {
        ctx.inCodeBlock = false;
        const node: JSONContent = {
          type: 'codeBlock',
          attrs: { language: ctx.codeBlockLang },
          content: codeBlockContent ? [{ type: 'text', text: codeBlockContent.trimEnd() }] : [],
        };
        addToCurrentContext(content, ctx, node);
        codeBlockContent = '';
        ctx.codeBlockLang = '';
      } else {
        codeBlockContent += (codeBlockContent ? '\n' : '') + line;
      }
      i++;
      continue;
    }

    // AI Context block
    const aiContextMatch = line.match(/^:::ai-context(?:\s*\{([^}]*)\})?\s*$/);
    if (aiContextMatch) {
      ctx.inAIContext = true;
      i++;
      continue;
    }

    if (ctx.inAIContext) {
      if (line === ':::') {
        ctx.inAIContext = false;
        const node: JSONContent = {
          type: 'aiContextBlock',
          attrs: { visibility: 'hidden' },
          content: aiContextContent.trim() ? [{ type: 'text', text: aiContextContent.trim() }] : [],
        };
        addToCurrentContext(content, ctx, node);
        aiContextContent = '';
      } else {
        aiContextContent += (aiContextContent ? '\n' : '') + line;
      }
      i++;
      continue;
    }

    // Table handling
    const isTableRow = /^\|(.+)\|$/.test(line.trim());
    const isTableSeparator = /^\|[\s\-:|]+\|$/.test(line.trim());

    if (isTableRow || isTableSeparator) {
      if (!ctx.inTable) {
        ctx.inTable = true;
        ctx.tableRows = [];
      }

      // Skip separator rows (|---|---|)
      if (!isTableSeparator) {
        const cells = line.trim()
          .slice(1, -1) // Remove leading and trailing |
          .split('|')
          .map(cell => cell.trim());

        // Determine if this is a header row (first row in table)
        const isHeader = ctx.tableRows.length === 0;

        const rowNode: JSONContent = {
          type: 'tableRow',
          content: cells.map(cellText => ({
            type: isHeader ? 'tableHeader' : 'tableCell',
            content: [{
              type: 'paragraph',
              content: parseInlineContent(cellText),
            }],
          })),
        };

        ctx.tableRows.push(rowNode);
      }

      i++;
      continue;
    }

    // End of table (non-table line after table)
    if (ctx.inTable) {
      ctx.inTable = false;
      if (ctx.tableRows.length > 0) {
        const tableNode: JSONContent = {
          type: 'table',
          content: ctx.tableRows,
        };
        addToCurrentContext(content, ctx, tableNode);
        ctx.tableRows = [];
      }
    }

    // Container directive start: :::framework:component[title]{attrs}
    const directiveMatch = line.match(/^:::(\w+):(\w+)(?:\[([^\]]*)\])?(?:\{([^}]*)\})?\s*$/);
    if (directiveMatch) {
      const [, framework, component, title, attrsStr] = directiveMatch;
      const attributes = parseAttributes(attrsStr || '');
      ctx.directiveStack.push({
        framework,
        component,
        title: title || '',
        attributes,
        content: [],
      });
      ctx.inDirective = true;
      i++;
      continue;
    }

    // Directive end
    if (line === ':::' && ctx.directiveStack.length > 0) {
      const directive = ctx.directiveStack.pop()!;
      const node: JSONContent = {
        type: 'mdppDirective',
        attrs: {
          framework: directive.framework,
          component: directive.component,
          title: directive.title,
          attributes: directive.attributes,
        },
        content: directive.content.length > 0 ? directive.content : [{ type: 'paragraph' }],
      };

      if (ctx.directiveStack.length > 0) {
        ctx.directiveStack[ctx.directiveStack.length - 1].content.push(node);
      } else {
        content.push(node);
        ctx.inDirective = false;
      }
      i++;
      continue;
    }

    // Parse regular content
    const node = parseLineToNode(line);
    if (node) {
      addToCurrentContext(content, ctx, node);
    }

    i++;
  }

  // Handle end of document while in table
  if (ctx.inTable && ctx.tableRows.length > 0) {
    const tableNode: JSONContent = {
      type: 'table',
      content: ctx.tableRows,
    };
    addToCurrentContext(content, ctx, tableNode);
  }

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  };
}

function addToCurrentContext(content: JSONContent[], ctx: ParseContext, node: JSONContent) {
  if (ctx.directiveStack.length > 0) {
    ctx.directiveStack[ctx.directiveStack.length - 1].content.push(node);
  } else {
    content.push(node);
  }
}

function parseLineToNode(line: string): JSONContent | null {
  // Empty line
  if (!line.trim()) {
    return null;
  }

  // Headings
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
    return {
      type: 'heading',
      attrs: { level },
      content: parseInlineContent(headingMatch[2]),
    };
  }

  // Horizontal rule
  if (/^[-*_]{3,}\s*$/.test(line)) {
    return { type: 'horizontalRule' };
  }

  // Blockquote
  const quoteMatch = line.match(/^>\s*(.*)$/);
  if (quoteMatch) {
    return {
      type: 'blockquote',
      content: [{
        type: 'paragraph',
        content: parseInlineContent(quoteMatch[1]),
      }],
    };
  }

  // Unordered list item
  const ulMatch = line.match(/^[-*+]\s+(.+)$/);
  if (ulMatch) {
    return {
      type: 'bulletList',
      content: [{
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: parseInlineContent(ulMatch[1]),
        }],
      }],
    };
  }

  // Ordered list item
  const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
  if (olMatch) {
    return {
      type: 'orderedList',
      attrs: { start: parseInt(olMatch[1], 10) },
      content: [{
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: parseInlineContent(olMatch[2]),
        }],
      }],
    };
  }

  // Task list item
  const taskMatch = line.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/);
  if (taskMatch) {
    return {
      type: 'taskList',
      content: [{
        type: 'taskItem',
        attrs: { checked: taskMatch[1].toLowerCase() === 'x' },
        content: [{
          type: 'paragraph',
          content: parseInlineContent(taskMatch[2]),
        }],
      }],
    };
  }

  // Regular paragraph
  return {
    type: 'paragraph',
    content: parseInlineContent(line),
  };
}

function parseInlineContent(text: string): JSONContent[] {
  if (!text) return [];

  const result: JSONContent[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Images: ![alt](url)
    const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      result.push({
        type: 'image',
        attrs: { src: imageMatch[2], alt: imageMatch[1] },
      });
      remaining = remaining.slice(imageMatch[0].length);
      continue;
    }

    // Links: [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      result.push({
        type: 'text',
        text: linkMatch[1],
        marks: [{ type: 'link', attrs: { href: linkMatch[2] } }],
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Bold + Italic: ***text***
    const boldItalicMatch = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (boldItalicMatch) {
      result.push({
        type: 'text',
        text: boldItalicMatch[1],
        marks: [{ type: 'bold' }, { type: 'italic' }],
      });
      remaining = remaining.slice(boldItalicMatch[0].length);
      continue;
    }

    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      result.push({
        type: 'text',
        text: boldMatch[1],
        marks: [{ type: 'bold' }],
      });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      result.push({
        type: 'text',
        text: italicMatch[1],
        marks: [{ type: 'italic' }],
      });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Strikethrough: ~~text~~
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      result.push({
        type: 'text',
        text: strikeMatch[1],
        marks: [{ type: 'strike' }],
      });
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      result.push({
        type: 'text',
        text: codeMatch[1],
        marks: [{ type: 'code' }],
      });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Highlight: ==text==
    const highlightMatch = remaining.match(/^==(.+?)==/);
    if (highlightMatch) {
      result.push({
        type: 'text',
        text: highlightMatch[1],
        marks: [{ type: 'highlight' }],
      });
      remaining = remaining.slice(highlightMatch[0].length);
      continue;
    }

    // Plain text (up to next special character)
    const plainMatch = remaining.match(/^[^*_`~=\[!]+/);
    if (plainMatch) {
      result.push({
        type: 'text',
        text: plainMatch[0],
      });
      remaining = remaining.slice(plainMatch[0].length);
      continue;
    }

    // Single special character
    result.push({
      type: 'text',
      text: remaining[0],
    });
    remaining = remaining.slice(1);
  }

  return result;
}

function parseAttributes(attrStr: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!attrStr) return attrs;

  // Parse key="value" or key='value' or key=value
  const regex = /(\w+)=(?:"([^"]*)"|'([^']*)'|(\S+))/g;
  let match;
  while ((match = regex.exec(attrStr)) !== null) {
    attrs[match[1]] = match[2] ?? match[3] ?? match[4];
  }

  return attrs;
}

export default parseMarkdownToTipTap;
