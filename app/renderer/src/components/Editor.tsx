/**
 * MD++ Monaco Editor Component
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MonacoEditor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
}

export interface EditorRef {
  insert: (text: string) => void;
  insertWrap: (wrapper: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ content, onChange, onCursorChange }, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    insert: (text: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      if (selection) {
        editor.executeEdits('insert', [{
          range: selection,
          text,
          forceMoveMarkers: true,
        }]);
      }
    },
    insertWrap: (wrapper: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      const selection = editor.getSelection();
      if (selection) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        editor.executeEdits('wrap', [{
          range: selection,
          text: `${wrapper}${selectedText}${wrapper}`,
          forceMoveMarkers: true,
        }]);
      }
    },
  }));

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register MD++ language
    monaco.languages.register({ id: 'mdplusplus' });

    // Set up MD++ tokenizer extending markdown
    monaco.languages.setMonarchTokensProvider('mdplusplus', {
      defaultToken: '',
      tokenPostfix: '.mdpp',

      // Common patterns
      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          // YAML frontmatter
          [/^---$/, { token: 'meta.embedded', next: '@frontmatter' }],

          // AI Context block
          [/^:::ai-context.*$/, { token: 'keyword.control.ai-context', next: '@aicontext' }],

          // Container directives
          [/^:::(\w+)/, { token: 'keyword.control.directive', next: '@containerDirective' }],

          // Leaf directives
          [/^::(\w+)/, 'keyword.control.directive'],

          // Text directives
          [/:(\w+)\[/, { token: 'keyword.control.directive' }],

          // Headings
          [/^#{1,6}\s/, 'keyword.heading'],

          // Code blocks
          [/^```\w*$/, { token: 'string.code', next: '@codeblock' }],

          // Inline code
          [/`[^`]+`/, 'string.code.inline'],

          // Bold
          [/\*\*[^*]+\*\*/, 'strong'],
          [/__[^_]+__/, 'strong'],

          // Italic
          [/\*[^*]+\*/, 'emphasis'],
          [/_[^_]+_/, 'emphasis'],

          // Links
          [/\[([^\]]+)\]\([^)]+\)/, 'string.link'],

          // Images
          [/!\[([^\]]*)\]\([^)]+\)/, 'string.link.image'],

          // Lists
          [/^[\*\-\+]\s/, 'keyword.list'],
          [/^\d+\.\s/, 'keyword.list.ordered'],

          // Blockquotes
          [/^>\s/, 'keyword.quote'],

          // Horizontal rules
          [/^---+$/, 'keyword.hr'],
          [/^\*\*\*+$/, 'keyword.hr'],

          // HTML
          [/<[^>]+>/, 'tag.html'],
        ],

        frontmatter: [
          [/^---$/, { token: 'meta.embedded', next: '@pop' }],
          [/.*/, 'meta.embedded.yaml'],
        ],

        aicontext: [
          [/^:::$/, { token: 'keyword.control.ai-context', next: '@pop' }],
          [/.*/, 'comment.ai-context'],
        ],

        containerDirective: [
          [/^:::$/, { token: 'keyword.control.directive', next: '@pop' }],
          [/\{[^}]*\}/, 'variable.parameter'],
          [/.*/, 'string.directive'],
        ],

        codeblock: [
          [/^```$/, { token: 'string.code', next: '@pop' }],
          [/.*/, 'string.code'],
        ],
      },
    });

    // Configure editor theme
    monaco.editor.defineTheme('mdppDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.heading', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'keyword.control.directive', foreground: 'c586c0' },
        { token: 'keyword.control.ai-context', foreground: 'dcdcaa' },
        { token: 'comment.ai-context', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'string.code', foreground: 'ce9178' },
        { token: 'string.code.inline', foreground: 'ce9178' },
        { token: 'strong', fontStyle: 'bold' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'string.link', foreground: '4ec9b0' },
        { token: 'string.link.image', foreground: '4ec9b0' },
        { token: 'keyword.list', foreground: 'd7ba7d' },
        { token: 'keyword.quote', foreground: '608b4e' },
        { token: 'variable.parameter', foreground: '9cdcfe' },
        { token: 'meta.embedded', foreground: '808080' },
        { token: 'meta.embedded.yaml', foreground: 'd4d4d4' },
        { token: 'tag.html', foreground: '808080' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorCursor.foreground': '#aeafad',
        'editor.selectionBackground': '#264f78',
      },
    });

    monaco.editor.setTheme('mdppDark');

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Set initial cursor position
    const pos = editor.getPosition();
    if (pos) {
      onCursorChange({
        line: pos.lineNumber,
        column: pos.column,
      });
    }
  };

  const handleChange: OnChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="editor-container">
      <MonacoEditor
        height="100%"
        language="mdplusplus"
        value={content}
        onChange={handleChange}
        onMount={handleEditorMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          lineNumbers: 'on',
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          renderWhitespace: 'selection',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 16 },
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';

export default Editor;
