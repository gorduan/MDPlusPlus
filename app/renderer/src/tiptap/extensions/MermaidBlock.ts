/**
 * MermaidBlock - TipTap extension for Mermaid diagrams
 * Renders Mermaid diagrams with live preview and editing
 */

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MermaidNodeView from '../nodeviews/MermaidNodeView';

export interface MermaidBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidBlock: {
      /**
       * Insert a mermaid diagram
       */
      setMermaid: (code?: string) => ReturnType;
      /**
       * Update mermaid diagram code
       */
      updateMermaid: (code: string) => ReturnType;
    };
  }
}

export const MermaidBlock = Node.create<MermaidBlockOptions>({
  name: 'mermaidBlock',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      code: {
        default: 'graph TD\n  A[Start] --> B[End]',
        parseHTML: (element) => element.getAttribute('data-code') || element.textContent,
        renderHTML: (attributes) => ({
          'data-code': attributes.code,
        }),
      },
      viewMode: {
        default: 'preview', // 'preview' | 'code' | 'visual'
        parseHTML: (element) => element.getAttribute('data-view-mode') || 'preview',
        renderHTML: (attributes) => ({
          'data-view-mode': attributes.viewMode,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid-block"]',
      },
      {
        tag: 'pre.mermaid',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          return {
            code: element.textContent || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'mermaid-block',
        class: 'mermaid-block',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNodeView);
  },

  addCommands() {
    return {
      setMermaid:
        (code = 'graph TD\n  A[Start] --> B[End]') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { code },
          });
        },
      updateMermaid:
        (code: string) =>
        ({ commands, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          if (node?.type.name === this.name) {
            return commands.updateAttributes(this.name, { code });
          }
          return false;
        },
    };
  },

  addInputRules() {
    const mermaidBacktickRule = new InputRule({
      find: /^```mermaid\s$/,
      handler: ({ state, range, commands }) => {
        // Don't convert to mermaid if inside a code block
        const $from = state.selection.$from;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === 'codeBlock') {
            return null; // Inside a code block, don't convert
          }
        }
        commands.deleteRange(range);
        commands.setMermaid();
      },
    });

    const mermaidColonRule = new InputRule({
      find: /^:::mermaid\s$/,
      handler: ({ state, range, commands }) => {
        // Don't convert to mermaid if inside a code block
        const $from = state.selection.$from;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === 'codeBlock') {
            return null; // Inside a code block, don't convert
          }
        }
        commands.deleteRange(range);
        commands.setMermaid();
      },
    });

    return [mermaidBacktickRule, mermaidColonRule];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-M': () => this.editor.commands.setMermaid(),
    };
  },
});

export default MermaidBlock;
