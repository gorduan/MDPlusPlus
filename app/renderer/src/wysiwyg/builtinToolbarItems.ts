/**
 * Built-in Toolbar Items
 * Default toolbar items for the WYSIWYG editor
 */

import { toolbarRegistry, ToolbarItem } from './ToolbarRegistry';
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, Link,
  Image, Table, Code2, FileText, Bot, LayoutGrid, Highlighter, GitBranch,
  Info, Lightbulb, AlertTriangle, AlertCircle, CheckCircle, HelpCircle
} from 'lucide-react';

const builtinItems: ToolbarItem[] = [
  // History group
  {
    id: 'undo',
    type: 'button',
    group: 'history',
    priority: 0,
    icon: Undo,
    label: 'Undo',
    tooltip: 'Undo',
    shortcut: 'Ctrl+Z',
    isDisabled: (editor) => !editor.can().undo(),
    action: (editor) => editor.chain().focus().undo().run(),
  },
  {
    id: 'redo',
    type: 'button',
    group: 'history',
    priority: 1,
    icon: Redo,
    label: 'Redo',
    tooltip: 'Redo',
    shortcut: 'Ctrl+Shift+Z',
    isDisabled: (editor) => !editor.can().redo(),
    action: (editor) => editor.chain().focus().redo().run(),
  },

  // Format group
  {
    id: 'bold',
    type: 'button',
    group: 'format',
    priority: 0,
    icon: Bold,
    label: 'Bold',
    tooltip: 'Bold',
    shortcut: 'Ctrl+B',
    isActive: (editor) => editor.isActive('bold'),
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    id: 'italic',
    type: 'button',
    group: 'format',
    priority: 1,
    icon: Italic,
    label: 'Italic',
    tooltip: 'Italic',
    shortcut: 'Ctrl+I',
    isActive: (editor) => editor.isActive('italic'),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    id: 'strikethrough',
    type: 'button',
    group: 'format',
    priority: 2,
    icon: Strikethrough,
    label: 'Strikethrough',
    tooltip: 'Strikethrough',
    isActive: (editor) => editor.isActive('strike'),
    action: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    id: 'code',
    type: 'button',
    group: 'format',
    priority: 3,
    icon: Code,
    label: 'Code',
    tooltip: 'Inline Code',
    shortcut: 'Ctrl+E',
    isActive: (editor) => editor.isActive('code'),
    action: (editor) => editor.chain().focus().toggleCode().run(),
  },
  {
    id: 'highlight',
    type: 'button',
    group: 'format',
    priority: 4,
    icon: Highlighter,
    label: 'Highlight',
    tooltip: 'Highlight',
    isActive: (editor) => editor.isActive('highlight'),
    action: (editor) => editor.chain().focus().toggleHighlight().run(),
  },

  // Heading group
  {
    id: 'heading1',
    type: 'button',
    group: 'heading',
    priority: 0,
    icon: Heading1,
    label: 'H1',
    tooltip: 'Heading 1',
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'heading2',
    type: 'button',
    group: 'heading',
    priority: 1,
    icon: Heading2,
    label: 'H2',
    tooltip: 'Heading 2',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading3',
    type: 'button',
    group: 'heading',
    priority: 2,
    icon: Heading3,
    label: 'H3',
    tooltip: 'Heading 3',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },

  // List group
  {
    id: 'bulletList',
    type: 'button',
    group: 'list',
    priority: 0,
    icon: List,
    label: 'Bullet List',
    tooltip: 'Bullet List',
    isActive: (editor) => editor.isActive('bulletList'),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'orderedList',
    type: 'button',
    group: 'list',
    priority: 1,
    icon: ListOrdered,
    label: 'Numbered List',
    tooltip: 'Numbered List',
    isActive: (editor) => editor.isActive('orderedList'),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    type: 'button',
    group: 'list',
    priority: 2,
    icon: Quote,
    label: 'Blockquote',
    tooltip: 'Blockquote',
    isActive: (editor) => editor.isActive('blockquote'),
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'codeBlock',
    type: 'button',
    group: 'list',
    priority: 3,
    icon: Code2,
    label: 'Code Block',
    tooltip: 'Code Block',
    isActive: (editor) => editor.isActive('codeBlock'),
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },

  // Insert group
  {
    id: 'link',
    type: 'button',
    group: 'insert',
    priority: 0,
    icon: Link,
    label: 'Link',
    tooltip: 'Add Link',
    isActive: (editor) => editor.isActive('link'),
    action: (editor) => {
      const url = window.prompt('Enter URL:');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    },
  },
  {
    id: 'image',
    type: 'button',
    group: 'insert',
    priority: 1,
    icon: Image,
    label: 'Image',
    tooltip: 'Add Image',
    action: (editor) => {
      const url = window.prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    id: 'table',
    type: 'button',
    group: 'insert',
    priority: 2,
    icon: Table,
    label: 'Table',
    tooltip: 'Insert Table',
    action: (editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    id: 'horizontalRule',
    type: 'button',
    group: 'insert',
    priority: 3,
    icon: Minus,
    label: 'Horizontal Rule',
    tooltip: 'Horizontal Rule',
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'mermaid',
    type: 'button',
    group: 'insert',
    priority: 4,
    icon: GitBranch,
    label: 'Diagram',
    tooltip: 'Insert Mermaid Diagram (Ctrl+Shift+M)',
    shortcut: 'Ctrl+Shift+M',
    action: (editor) => editor.chain().focus().setMermaid().run(),
  },

  // MD++ group
  {
    id: 'frontmatter',
    type: 'button',
    group: 'mdpp',
    priority: 0,
    icon: FileText,
    label: 'Frontmatter',
    tooltip: 'Insert Frontmatter (YAML)',
    action: (editor) => {
      const yaml = window.prompt('Enter YAML frontmatter:', 'title: My Document\nauthor: ');
      if (yaml) {
        editor.chain().focus().setFrontmatter(yaml).run();
      }
    },
  },
  {
    id: 'aiContext',
    type: 'button',
    group: 'mdpp',
    priority: 1,
    icon: Bot,
    label: 'AI Context',
    tooltip: 'Insert AI Context (Ctrl+Shift+A)',
    shortcut: 'Ctrl+Shift+A',
    action: (editor) => {
      editor.chain().focus().insertAIContext('hidden').run();
    },
  },
  {
    id: 'directive',
    type: 'button',
    group: 'mdpp',
    priority: 2,
    icon: LayoutGrid,
    label: 'Directive',
    tooltip: 'Insert Directive (Ctrl+Shift+D)',
    shortcut: 'Ctrl+Shift+D',
    action: (editor) => {
      const framework = window.prompt('Framework:', 'vcm3');
      const component = window.prompt('Component:', 'card');
      const title = window.prompt('Title (optional):', '');
      if (framework && component) {
        editor.chain().focus().setDirective({
          framework,
          component,
          title: title || '',
          attributes: {},
        }).run();
      }
    },
  },

  // Callout/Admonition group
  {
    id: 'callout-note',
    type: 'button',
    group: 'callout',
    priority: 0,
    icon: Info,
    label: 'Note',
    tooltip: 'Insert Note Callout (Ctrl+Shift+N)',
    shortcut: 'Ctrl+Shift+N',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'note';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('note').run(),
  },
  {
    id: 'callout-tip',
    type: 'button',
    group: 'callout',
    priority: 1,
    icon: Lightbulb,
    label: 'Tip',
    tooltip: 'Insert Tip Callout',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'tip';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('tip').run(),
  },
  {
    id: 'callout-warning',
    type: 'button',
    group: 'callout',
    priority: 2,
    icon: AlertTriangle,
    label: 'Warning',
    tooltip: 'Insert Warning Callout',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'warning';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('warning').run(),
  },
  {
    id: 'callout-danger',
    type: 'button',
    group: 'callout',
    priority: 3,
    icon: AlertCircle,
    label: 'Danger',
    tooltip: 'Insert Danger Callout',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'danger';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('danger').run(),
  },
  {
    id: 'callout-success',
    type: 'button',
    group: 'callout',
    priority: 4,
    icon: CheckCircle,
    label: 'Success',
    tooltip: 'Insert Success Callout',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'success';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('success').run(),
  },
  {
    id: 'callout-question',
    type: 'button',
    group: 'callout',
    priority: 5,
    icon: HelpCircle,
    label: 'Question',
    tooltip: 'Insert Question Callout',
    isActive: (editor) => {
      const { selection } = editor.state;
      const node = editor.state.doc.nodeAt(selection.from);
      return node?.type.name === 'admonitionBlock' && node.attrs.type === 'question';
    },
    action: (editor) => editor.chain().focus().toggleAdmonition('question').run(),
  },
];

/**
 * Register all built-in toolbar items
 */
export function registerBuiltinToolbarItems(): void {
  toolbarRegistry.registerMany(builtinItems);
}

export default registerBuiltinToolbarItems;
