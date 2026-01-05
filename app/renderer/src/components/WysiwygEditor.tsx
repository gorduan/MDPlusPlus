/**
 * WysiwygEditor - TipTap-based WYSIWYG editor for MD++
 */

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

// MD++ Extensions
import { Frontmatter, AIContextBlock, MDPPDirective, MermaidBlock, AdmonitionBlock } from '../tiptap/extensions';
import { parseMarkdownToTipTap } from '../tiptap/utils/markdownParser';
import { serializeTipTapToMarkdown } from '../tiptap/utils/markdownSerializer';

// Toolbar and Menus
import WysiwygToolbar from './WysiwygToolbar';
import TableBubbleMenu from './TableBubbleMenu';
import { registerBuiltinToolbarItems } from '../wysiwyg';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

// Register built-in toolbar items (only once)
let toolbarInitialized = false;
if (!toolbarInitialized) {
  registerBuiltinToolbarItems();
  toolbarInitialized = true;
}

type Theme = 'dark' | 'light';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  theme?: Theme;
}

export default function WysiwygEditor({ content, onChange, theme = 'dark' }: WysiwygEditorProps) {
  const lastContentRef = useRef(content);
  const isUpdatingRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockLowlight instead
      }),
      Highlight,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'wysiwyg-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'wysiwyg-image',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'wysiwyg-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      // MD++ Extensions
      Frontmatter,
      AIContextBlock,
      MDPPDirective,
      MermaidBlock,
      AdmonitionBlock,
    ],
    content: parseMarkdownToTipTap(content),
    editorProps: {
      attributes: {
        class: `wysiwyg-content ${theme === 'dark' ? 'dark' : 'light'}`,
      },
    },
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return;

      const json = editor.getJSON();
      const markdown = serializeTipTapToMarkdown(json);
      if (markdown !== lastContentRef.current) {
        lastContentRef.current = markdown;
        onChange(markdown);
      }
    },
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      isUpdatingRef.current = true;
      lastContentRef.current = content;
      const json = parseMarkdownToTipTap(content);
      editor.commands.setContent(json);
      isUpdatingRef.current = false;
    }
  }, [content, editor]);

  // Update theme
  useEffect(() => {
    if (editor) {
      editor.view.dom.classList.remove('dark', 'light');
      editor.view.dom.classList.add(theme);
    }
  }, [editor, theme]);

  if (!editor) {
    return <div className="wysiwyg-loading">Loading editor...</div>;
  }

  return (
    <div className="wysiwyg-editor">
      {/* Dynamic Toolbar from Registry */}
      <WysiwygToolbar editor={editor} />

      {/* Table Context Menu */}
      <TableBubbleMenu editor={editor} />

      {/* Editor Content */}
      <div className="wysiwyg-content-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
