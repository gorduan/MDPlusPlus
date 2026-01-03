/**
 * Frontmatter - TipTap extension for YAML frontmatter blocks
 * Syntax: ---\nyaml content\n---
 */

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    frontmatter: {
      /**
       * Insert or update frontmatter
       */
      setFrontmatter: (content: string) => ReturnType;
      /**
       * Remove frontmatter
       */
      removeFrontmatter: () => ReturnType;
    };
  }
}

export const Frontmatter = Node.create({
  name: 'frontmatter',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: (element: HTMLElement) => element.textContent || '',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-frontmatter]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-frontmatter': '',
        class: 'frontmatter-block',
      }),
      [
        'div',
        { class: 'frontmatter-header' },
        [
          'span',
          { class: 'frontmatter-icon' },
          '📋',
        ],
        [
          'span',
          { class: 'frontmatter-label' },
          'Frontmatter (YAML)',
        ],
      ],
      ['pre', { class: 'frontmatter-content' }, ['code', 0]],
    ];
  },

  addCommands() {
    return {
      setFrontmatter:
        (content: string) =>
        ({ commands, state }: CommandProps) => {
          // Check if frontmatter already exists at the beginning
          const firstNode = state.doc.firstChild;
          if (firstNode?.type.name === this.name) {
            // Update existing frontmatter
            return commands.command(({ tr, dispatch }) => {
              if (dispatch) {
                tr.setNodeMarkup(0, undefined, { content });
              }
              return true;
            });
          }

          // Insert new frontmatter at the beginning
          return commands.insertContentAt(0, {
            type: this.name,
            content: content ? [{ type: 'text', text: content }] : [],
          });
        },

      removeFrontmatter:
        () =>
        ({ commands, state }: CommandProps) => {
          const firstNode = state.doc.firstChild;
          if (firstNode?.type.name === this.name) {
            return commands.deleteRange({
              from: 0,
              to: firstNode.nodeSize,
            });
          }
          return false;
        },
    };
  },
});

export default Frontmatter;
