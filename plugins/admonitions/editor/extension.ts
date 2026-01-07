/**
 * AdmonitionBlock - TipTap extension for callouts/admonitions
 * Supports GitHub-style callouts: > [!NOTE], > [!TIP], > [!WARNING], etc.
 *
 * This extension is contributed by the Admonitions plugin.
 */

import { Node, mergeAttributes } from '@tiptap/core';

export type AdmonitionType =
  | 'note' | 'info' | 'tip' | 'hint'
  | 'important' | 'warning' | 'caution'
  | 'danger' | 'error' | 'success'
  | 'question' | 'quote' | 'example'
  | 'abstract' | 'bug';

export interface AdmonitionBlockOptions {
  HTMLAttributes: Record<string, unknown>;
  types: AdmonitionType[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    admonitionBlock: {
      /**
       * Set an admonition block
       */
      setAdmonition: (type: AdmonitionType, title?: string) => ReturnType;
      /**
       * Toggle admonition block
       */
      toggleAdmonition: (type: AdmonitionType) => ReturnType;
      /**
       * Remove admonition wrapper
       */
      unsetAdmonition: () => ReturnType;
    };
  }
}

// Icons for each admonition type (FontAwesome names)
export const ADMONITION_ICONS: Record<AdmonitionType, string> = {
  note: 'info-circle',
  info: 'info-circle',
  tip: 'lightbulb',
  hint: 'lightbulb',
  important: 'exclamation-circle',
  warning: 'exclamation-triangle',
  caution: 'exclamation-triangle',
  danger: 'times-circle',
  error: 'times-circle',
  success: 'check-circle',
  question: 'question-circle',
  quote: 'quote-left',
  example: 'list',
  abstract: 'clipboard-list',
  bug: 'bug',
};

// Default titles for each type
export const ADMONITION_TITLES: Record<AdmonitionType, string> = {
  note: 'Note',
  info: 'Info',
  tip: 'Tip',
  hint: 'Hint',
  important: 'Important',
  warning: 'Warning',
  caution: 'Caution',
  danger: 'Danger',
  error: 'Error',
  success: 'Success',
  question: 'Question',
  quote: 'Quote',
  example: 'Example',
  abstract: 'Abstract',
  bug: 'Bug',
};

export const AdmonitionBlock = Node.create<AdmonitionBlockOptions>({
  name: 'admonitionBlock',

  group: 'block',

  content: 'block+',

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      types: [
        'note', 'info', 'tip', 'hint',
        'important', 'warning', 'caution',
        'danger', 'error', 'success',
        'question', 'quote', 'example',
        'abstract', 'bug',
      ],
    };
  },

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (element) => {
          // Check for admonition type in class
          for (const type of this.options.types) {
            if (element.classList.contains(`admonition-${type}`) ||
                element.classList.contains(`callout-${type}`)) {
              return type;
            }
          }
          return element.getAttribute('data-type') || 'note';
        },
        renderHTML: (attributes) => ({
          'data-type': attributes.type,
        }),
      },
      title: {
        default: '',
        parseHTML: (element) => {
          const titleEl = element.querySelector('.admonition-title, .callout-title');
          return titleEl?.textContent || element.getAttribute('data-title') || '';
        },
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="admonition"]',
      },
      {
        tag: 'div.admonition',
      },
      {
        tag: 'div.callout',
      },
      // GitHub-style callout parsing
      {
        tag: 'blockquote',
        getAttrs: (node) => {
          const element = node as HTMLElement;
          const firstP = element.querySelector('p');
          if (firstP) {
            const text = firstP.textContent || '';
            const match = text.match(/^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT|DANGER)\]/i);
            if (match) {
              return {
                type: match[1].toLowerCase() as AdmonitionType,
              };
            }
          }
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const type = node.attrs.type as AdmonitionType;
    const title = node.attrs.title || ADMONITION_TITLES[type] || 'Note';

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'admonition',
        class: `admonition admonition-${type}`,
      }),
      [
        'div',
        { class: 'admonition-title' },
        [
          'span',
          { class: `admonition-icon admonition-icon-${type}` },
        ],
        title,
      ],
      [
        'div',
        { class: 'admonition-content' },
        0, // Content hole
      ],
    ];
  },

  addCommands() {
    return {
      setAdmonition:
        (type: AdmonitionType, title?: string) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, {
            type,
            title: title || ADMONITION_TITLES[type]
          });
        },
      toggleAdmonition:
        (type: AdmonitionType) =>
        ({ commands, state }) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);

          // If already in an admonition, unwrap
          if (node?.type.name === this.name ||
              state.doc.resolve(selection.from).parent.type.name === this.name) {
            return commands.lift(this.name);
          }

          // Otherwise wrap selection
          return commands.wrapIn(this.name, {
            type,
            title: ADMONITION_TITLES[type]
          });
        },
      unsetAdmonition:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Ctrl+Shift+N for Note
      'Mod-Shift-N': () => this.editor.commands.toggleAdmonition('note'),
    };
  },
});

export default AdmonitionBlock;
