/**
 * MD++ Markdown Serializer - Converts TipTap JSON to MD++ markdown
 * Handles: Frontmatter, AI Context blocks, Directives, and standard Markdown
 */

import { JSONContent } from '@tiptap/react';

interface SerializerState {
  output: string;
  listDepth: number;
  orderedListCounters: number[];
}

/**
 * Serialize TipTap JSON content to MD++ markdown
 */
export function serializeTipTapToMarkdown(doc: JSONContent): string {
  const state: SerializerState = {
    output: '',
    listDepth: 0,
    orderedListCounters: [],
  };

  if (doc.content) {
    for (const node of doc.content) {
      serializeNode(node, state);
    }
  }

  return state.output.trim();
}

function serializeNode(node: JSONContent, state: SerializerState): void {
  const handlers: Record<string, (node: JSONContent, state: SerializerState) => void> = {
    // Document types
    doc: (node, state) => {
      if (node.content) {
        for (const child of node.content) {
          serializeNode(child, state);
        }
      }
    },

    // Frontmatter
    frontmatter: (node, state) => {
      const content = node.attrs?.content || '';
      state.output += '---\n' + content + '\n---\n\n';
    },

    // AI Context block
    aiContextBlock: (node, state) => {
      const visibility = node.attrs?.visibility || 'hidden';
      state.output += `:::ai-context\n`;
      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'text') {
            state.output += child.text || '';
          }
        }
      }
      state.output += '\n:::\n\n';
    },

    // MD++ Directive
    mdppDirective: (node, state) => {
      const { framework, component, title, attributes } = node.attrs || {};
      let directive = `:::${framework}:${component}`;
      if (title) {
        directive += `[${title}]`;
      }
      if (attributes && Object.keys(attributes).length > 0) {
        const attrStr = Object.entries(attributes)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        directive += `{${attrStr}}`;
      }
      state.output += directive + '\n';

      if (node.content) {
        for (const child of node.content) {
          serializeNode(child, state);
        }
      }

      state.output += ':::\n\n';
    },

    // Admonition/Callout block
    admonitionBlock: (node, state) => {
      const type = (node.attrs?.type || 'note').toUpperCase();
      state.output += `> [!${type}]\n`;

      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'paragraph') {
            state.output += '> ';
            serializeInlineContent(child.content || [], state);
            state.output += '\n';
          } else {
            // For other content types, serialize and prefix with >
            const tempState: SerializerState = { output: '', listDepth: 0, orderedListCounters: [] };
            serializeNode(child, tempState);
            const lines = tempState.output.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                state.output += '> ' + line + '\n';
              }
            }
          }
        }
      }
      state.output += '\n';
    },

    // Mermaid diagram block
    mermaidBlock: (node, state) => {
      const code = node.attrs?.code || 'graph TD\n  A[Start] --> B[End]';
      state.output += '```mermaid\n';
      state.output += code;
      if (!code.endsWith('\n')) {
        state.output += '\n';
      }
      state.output += '```\n\n';
    },

    // Headings
    heading: (node, state) => {
      const level = node.attrs?.level || 1;
      state.output += '#'.repeat(level) + ' ';
      serializeInlineContent(node.content || [], state);
      state.output += '\n\n';
    },

    // Paragraph
    paragraph: (node, state) => {
      serializeInlineContent(node.content || [], state);
      state.output += '\n\n';
    },

    // Code block
    codeBlock: (node, state) => {
      const language = node.attrs?.language || '';
      state.output += '```' + language + '\n';
      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'text') {
            state.output += child.text || '';
          }
        }
      }
      state.output += '\n```\n\n';
    },

    // Blockquote
    blockquote: (node, state) => {
      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'paragraph') {
            state.output += '> ';
            serializeInlineContent(child.content || [], state);
            state.output += '\n';
          } else {
            // For nested content, prefix each line with >
            const tempState: SerializerState = { output: '', listDepth: 0, orderedListCounters: [] };
            serializeNode(child, tempState);
            const lines = tempState.output.split('\n');
            for (const line of lines) {
              if (line) {
                state.output += '> ' + line + '\n';
              }
            }
          }
        }
      }
      state.output += '\n';
    },

    // Bullet list
    bulletList: (node, state) => {
      if (node.content) {
        for (const child of node.content) {
          serializeNode(child, state);
        }
      }
      if (state.listDepth === 0) {
        state.output += '\n';
      }
    },

    // Ordered list
    orderedList: (node, state) => {
      const start = node.attrs?.start || 1;
      state.orderedListCounters[state.listDepth] = start;
      if (node.content) {
        for (const child of node.content) {
          serializeNode(child, state);
        }
      }
      if (state.listDepth === 0) {
        state.output += '\n';
      }
    },

    // List item
    listItem: (node, state) => {
      const indent = '  '.repeat(state.listDepth);
      const isOrdered = state.orderedListCounters[state.listDepth] !== undefined;

      if (isOrdered) {
        const num = state.orderedListCounters[state.listDepth]++;
        state.output += indent + num + '. ';
      } else {
        state.output += indent + '- ';
      }

      state.listDepth++;
      if (node.content) {
        let first = true;
        for (const child of node.content) {
          if (child.type === 'paragraph') {
            serializeInlineContent(child.content || [], state);
            state.output += '\n';
          } else if (child.type === 'bulletList' || child.type === 'orderedList') {
            if (first) state.output += '\n';
            serializeNode(child, state);
          } else {
            serializeNode(child, state);
          }
          first = false;
        }
      }
      state.listDepth--;
    },

    // Task list
    taskList: (node, state) => {
      if (node.content) {
        for (const child of node.content) {
          serializeNode(child, state);
        }
      }
      state.output += '\n';
    },

    // Task item
    taskItem: (node, state) => {
      const checked = node.attrs?.checked ? 'x' : ' ';
      state.output += `- [${checked}] `;
      if (node.content) {
        for (const child of node.content) {
          if (child.type === 'paragraph') {
            serializeInlineContent(child.content || [], state);
          }
        }
      }
      state.output += '\n';
    },

    // Horizontal rule
    horizontalRule: (node, state) => {
      state.output += '---\n\n';
    },

    // Hard break
    hardBreak: (node, state) => {
      state.output += '  \n';
    },

    // Image
    image: (node, state) => {
      const alt = node.attrs?.alt || '';
      const src = node.attrs?.src || '';
      const title = node.attrs?.title;
      if (title) {
        state.output += `![${alt}](${src} "${title}")\n\n`;
      } else {
        state.output += `![${alt}](${src})\n\n`;
      }
    },

    // Table
    table: (node, state) => {
      if (node.content) {
        let isFirstRow = true;
        for (const row of node.content) {
          if (row.type === 'tableRow') {
            state.output += '|';
            const cells = row.content || [];
            for (const cell of cells) {
              state.output += ' ';
              if (cell.content) {
                for (const child of cell.content) {
                  if (child.type === 'paragraph') {
                    serializeInlineContent(child.content || [], state);
                  }
                }
              }
              state.output += ' |';
            }
            state.output += '\n';

            // Add separator after header row
            if (isFirstRow) {
              state.output += '|';
              for (let i = 0; i < cells.length; i++) {
                state.output += ' --- |';
              }
              state.output += '\n';
              isFirstRow = false;
            }
          }
        }
      }
      state.output += '\n';
    },

    // Text node (should be handled by serializeInlineContent)
    text: (node, state) => {
      state.output += serializeTextNode(node);
    },
  };

  const handler = handlers[node.type || 'paragraph'];
  if (handler) {
    handler(node, state);
  } else {
    // Fallback: try to serialize content
    if (node.content) {
      for (const child of node.content) {
        serializeNode(child, state);
      }
    }
  }
}

function serializeInlineContent(content: JSONContent[], state: SerializerState): void {
  for (const node of content) {
    if (node.type === 'text') {
      state.output += serializeTextNode(node);
    } else if (node.type === 'image') {
      const alt = node.attrs?.alt || '';
      const src = node.attrs?.src || '';
      state.output += `![${alt}](${src})`;
    } else if (node.type === 'hardBreak') {
      state.output += '  \n';
    }
  }
}

function serializeTextNode(node: JSONContent): string {
  let text = node.text || '';

  if (!node.marks || node.marks.length === 0) {
    return text;
  }

  // Apply marks in correct order
  const marks = node.marks || [];

  // Check for link
  const linkMark = marks.find(m => m.type === 'link');
  if (linkMark) {
    const href = linkMark.attrs?.href || '';
    text = `[${text}](${href})`;
    // Don't apply other marks to links
    return text;
  }

  // Apply inline marks
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        text = `**${text}**`;
        break;
      case 'italic':
        text = `*${text}*`;
        break;
      case 'strike':
        text = `~~${text}~~`;
        break;
      case 'code':
        text = `\`${text}\``;
        break;
      case 'highlight':
        text = `==${text}==`;
        break;
    }
  }

  return text;
}

export default serializeTipTapToMarkdown;
