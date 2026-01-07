/**
 * WysiwygEditor - TipTap-based WYSIWYG editor for MD++
 *
 * Plugin extensions (MermaidBlock, AdmonitionBlock) are now loaded dynamically
 * based on which plugins are enabled in settings.
 */

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

// MD++ Core Extensions (always loaded)
import { Frontmatter, AIContextBlock, MDPPDirective } from '../tiptap/extensions';
import { parseMarkdownToTipTap } from '../tiptap/utils/markdownParser';
import { serializeTipTapToMarkdown } from '../tiptap/utils/markdownSerializer';

/**
 * Node type to fallback language mapping for plugin nodes
 * When a plugin is disabled, its nodes are converted to code blocks
 */
const PLUGIN_NODE_FALLBACKS: Record<string, string> = {
  mermaidBlock: 'mermaid',
  admonitionBlock: 'markdown',
};

// Plugin Extensions (dynamically loaded based on enabled plugins)
import { usePluginExtensions } from '../wysiwyg/usePluginExtensions';

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
  /** List of enabled plugin IDs - controls which extensions are loaded */
  enabledPlugins?: string[];
}

export default function WysiwygEditor({
  content,
  onChange,
  theme = 'dark',
  enabledPlugins = [],
}: WysiwygEditorProps) {
  const lastContentRef = useRef(content);
  const isUpdatingRef = useRef(false);

  // Get plugin extensions based on enabled plugins
  const { extensionInstances: pluginExtensions, availableNodeTypes } = usePluginExtensions(enabledPlugins);

  /**
   * Transform JSON content to replace unknown plugin nodes with code blocks
   * This prevents crashes when a plugin is disabled but the document contains its nodes
   */
  const transformContent = useCallback((json: JSONContent): JSONContent => {
    if (!json) return json;

    // Check if this node type is unknown (plugin-specific but plugin disabled)
    if (json.type && PLUGIN_NODE_FALLBACKS[json.type] && !availableNodeTypes.has(json.type)) {
      const fallbackLang = PLUGIN_NODE_FALLBACKS[json.type];

      // Extract content from the node
      let codeContent = '';
      if (json.type === 'mermaidBlock' && json.attrs?.code) {
        codeContent = json.attrs.code as string;
      } else if (json.type === 'admonitionBlock') {
        // Convert admonition to markdown format
        const admonitionType = (json.attrs?.type as string) || 'note';
        const title = (json.attrs?.title as string) || admonitionType;
        const innerContent = json.content?.map(node => {
          if (node.type === 'paragraph' && node.content) {
            return node.content.map(c => c.text || '').join('');
          }
          return '';
        }).join('\n') || '';
        codeContent = `> [!${admonitionType.toUpperCase()}] ${title}\n> ${innerContent.replace(/\n/g, '\n> ')}`;
      }

      return {
        type: 'codeBlock',
        attrs: { language: fallbackLang },
        content: codeContent ? [{ type: 'text', text: codeContent }] : [],
      };
    }

    // Recursively transform children
    if (json.content && Array.isArray(json.content)) {
      return {
        ...json,
        content: json.content.map(child => transformContent(child)),
      };
    }

    return json;
  }, [availableNodeTypes]);

  // Memoize the extensions array to prevent unnecessary re-renders
  // Note: useEditor doesn't support dynamic extension changes after initialization
  // So we use a key to force recreation of the editor when plugins change
  const extensionsKey = useMemo(() => enabledPlugins.sort().join(','), [enabledPlugins]);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockLowlight instead
        // Configure Link via StarterKit to avoid duplicate extension warning
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'wysiwyg-link',
          },
        },
      }),
      Highlight,
      Typography,
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
      // MD++ Core Extensions (always loaded)
      Frontmatter,
      AIContextBlock,
      MDPPDirective,
      // Plugin Extensions (dynamically loaded based on enabled plugins)
      ...pluginExtensions,
    ],
    [pluginExtensions]
  );

  // Parse and transform content for initial load
  const initialContent = useMemo(() => {
    const parsed = parseMarkdownToTipTap(content);
    return transformContent(parsed);
  }, [content, transformContent]);

  const editor = useEditor(
    {
      extensions,
      content: initialContent,
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
    },
    [extensionsKey] // Re-create editor when enabled plugins change
  );

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content !== lastContentRef.current) {
      isUpdatingRef.current = true;
      lastContentRef.current = content;
      const json = parseMarkdownToTipTap(content);
      const transformed = transformContent(json);
      editor.commands.setContent(transformed);
      isUpdatingRef.current = false;
    }
  }, [content, editor, transformContent]);

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
