/**
 * MDPPDirective - TipTap extension for MD++ container directives
 * Syntax: :::framework:component[title]{attributes}
 */

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';

export interface DirectiveAttributes {
  framework: string;
  component: string;
  title: string;
  attributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mdppDirective: {
      /**
       * Insert a new directive block
       */
      setDirective: (attrs: Partial<DirectiveAttributes>) => ReturnType;
      /**
       * Toggle a directive wrapper around selection
       */
      toggleDirective: (attrs: Partial<DirectiveAttributes>) => ReturnType;
      /**
       * Remove directive wrapper
       */
      unsetDirective: () => ReturnType;
    };
  }
}

export const MDPPDirective = Node.create({
  name: 'mdppDirective',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      framework: {
        default: 'vcm3',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-framework') || 'vcm3',
        renderHTML: (attributes: DirectiveAttributes) => ({ 'data-framework': attributes.framework }),
      },
      component: {
        default: 'card',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-component') || 'card',
        renderHTML: (attributes: DirectiveAttributes) => ({ 'data-component': attributes.component }),
      },
      title: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-title') || '',
        renderHTML: (attributes: DirectiveAttributes) => ({ 'data-title': attributes.title }),
      },
      attributes: {
        default: {},
        parseHTML: (element: HTMLElement) => {
          try {
            return JSON.parse(element.getAttribute('data-attributes') || '{}');
          } catch {
            return {};
          }
        },
        renderHTML: (attributes: DirectiveAttributes) => ({
          'data-attributes': JSON.stringify(attributes.attributes || {}),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-mdpp-directive]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const framework = (HTMLAttributes.framework as string) || 'vcm3';
    const component = (HTMLAttributes.component as string) || 'card';
    const title = (HTMLAttributes.title as string) || '';

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-mdpp-directive': '',
        class: `mdpp-directive mdpp-directive-${framework}-${component}`,
      }),
      [
        'div',
        { class: 'mdpp-directive-header' },
        [
          'span',
          { class: 'mdpp-directive-badge' },
          `${framework}:${component}`,
        ],
        title ? ['span', { class: 'mdpp-directive-title' }, title] : '',
      ],
      ['div', { class: 'mdpp-directive-content' }, 0],
    ];
  },

  addCommands() {
    return {
      setDirective:
        (attrs: Partial<DirectiveAttributes>) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              framework: attrs.framework || 'vcm3',
              component: attrs.component || 'card',
              title: attrs.title || '',
              attributes: attrs.attributes || {},
            },
            content: [{ type: 'paragraph' }],
          });
        },

      toggleDirective:
        (attrs: Partial<DirectiveAttributes>) =>
        ({ commands }: CommandProps) => {
          return commands.toggleWrap(this.name, {
            framework: attrs.framework || 'vcm3',
            component: attrs.component || 'card',
            title: attrs.title || '',
            attributes: attrs.attributes || {},
          });
        },

      unsetDirective:
        () =>
        ({ commands }: CommandProps) => {
          return commands.lift(this.name);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-D': () =>
        this.editor.commands.setDirective({
          framework: 'vcm3',
          component: 'card',
          title: 'New Card',
        }),
    };
  },
});

export default MDPPDirective;
