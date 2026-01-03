/**
 * AIContextBlock - TipTap extension for MD++ AI context blocks
 * Syntax: :::ai-context ... :::
 */

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';

export interface AIContextAttributes {
  visibility: 'hidden' | 'visible';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiContextBlock: {
      /**
       * Insert an AI context block
       */
      insertAIContext: (visibility?: 'hidden' | 'visible') => ReturnType;
      /**
       * Toggle AI context visibility
       */
      toggleAIContextVisibility: () => ReturnType;
    };
  }
}

export const AIContextBlock = Node.create({
  name: 'aiContextBlock',

  group: 'block',

  content: 'text*',

  marks: '',

  code: true,

  defining: true,

  addAttributes() {
    return {
      visibility: {
        default: 'hidden',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-visibility') || 'hidden',
        renderHTML: (attributes: AIContextAttributes) => ({ 'data-visibility': attributes.visibility }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-ai-context]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-ai-context': '',
        class: 'ai-context-block',
      }),
      [
        'div',
        { class: 'ai-context-header' },
        [
          'span',
          { class: 'ai-context-icon' },
          '🤖',
        ],
        [
          'span',
          { class: 'ai-context-label' },
          'AI Context',
        ],
        [
          'span',
          { class: 'ai-context-visibility' },
          HTMLAttributes.visibility === 'visible' ? '(visible)' : '(hidden)',
        ],
      ],
      ['div', { class: 'ai-context-content' }, 0],
    ];
  },

  addCommands() {
    return {
      insertAIContext:
        (visibility = 'hidden') =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: { visibility },
            content: [{ type: 'text', text: 'AI context information here...' }],
          });
        },

      toggleAIContextVisibility:
        () =>
        ({ tr, state, dispatch }: CommandProps) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);

          if (node?.type.name === this.name) {
            const newVisibility = node.attrs.visibility === 'hidden' ? 'visible' : 'hidden';
            if (dispatch) {
              tr.setNodeMarkup(selection.from, undefined, {
                ...node.attrs,
                visibility: newVisibility,
              });
              dispatch(tr);
            }
            return true;
          }

          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-A': () => this.editor.commands.insertAIContext(),
    };
  },
});

export default AIContextBlock;
