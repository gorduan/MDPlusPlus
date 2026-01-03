/**
 * MD++ Monaco Editor Component
 * Enhanced syntax highlighting for Markdown and MD++ format
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MonacoEditor, { OnMount, OnChange, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

type Theme = 'dark' | 'light';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
  theme?: Theme;
}

export interface EditorRef {
  insert: (text: string) => void;
  insertWrap: (wrapper: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ content, onChange, onCursorChange, theme = 'dark' }, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

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

  // Switch theme when prop changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'mdppDark' : 'mdppLight');
    }
  }, [theme]);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register MD++ language
    monaco.languages.register({ id: 'mdplusplus' });

    // Enhanced MD++ tokenizer with full Markdown and MD++ support
    monaco.languages.setMonarchTokensProvider('mdplusplus', {
      defaultToken: '',
      tokenPostfix: '.mdpp',

      // Escape sequences
      escapes: /\\(?:[\\`*_\[\]{}()#+\-.!~])/,

      tokenizer: {
        root: [
          // YAML frontmatter (must be at start of document)
          [/^---$/, { token: 'meta.frontmatter.delimiter', next: '@frontmatter' }],

          // MD++ AI Context block
          [/^:::ai-context\s*$/, { token: 'keyword.ai-context', next: '@aicontext' }],
          [/^:::ai-context\s*\{/, { token: 'keyword.ai-context', next: '@aicontextWithParams' }],

          // MD++ Container directives (:::name or :::name{...})
          [/^(:::)(\w+)(\s*\{[^}]*\})?\s*$/, ['keyword.directive', 'keyword.directive.name', 'variable.directive.params']],
          [/^:::$/, 'keyword.directive'],

          // MD++ Leaf directives (::name)
          [/^(::)(\w+)(\s*\{[^}]*\})?/, ['keyword.directive', 'keyword.directive.name', 'variable.directive.params']],

          // MD++ Text directives (:name[content]{attrs})
          [/(:)(\w+)(\[)/, ['keyword.directive.inline', 'keyword.directive.name', 'bracket.directive']],

          // Tables
          [/^\|/, { token: 'keyword.table', next: '@table' }],

          // Headings (ATX style)
          [/^(#{1,6})(\s)(.*)$/, ['keyword.heading.marker', '', 'keyword.heading.text']],

          // Fenced code blocks with language
          [/^(```)(\w+)?$/, [{ token: 'string.code.fence', next: '@codeblock' }, 'string.code.language']],
          [/^(~~~)(\w+)?$/, [{ token: 'string.code.fence', next: '@codeblockTilde' }, 'string.code.language']],

          // Math blocks (display)
          [/^\$\$$/, { token: 'keyword.math.display', next: '@mathblock' }],

          // Blockquotes
          [/^(>+)(\s?)/, ['keyword.quote.marker', '']],

          // Task lists
          [/^(\s*)([-*+])(\s+)(\[[ xX]\])(\s)/, ['', 'keyword.list.marker', '', 'keyword.task.checkbox', '']],

          // Unordered lists
          [/^(\s*)([-*+])(\s+)/, ['', 'keyword.list.marker', '']],

          // Ordered lists
          [/^(\s*)(\d+\.)(\s+)/, ['', 'keyword.list.ordered.marker', '']],

          // Horizontal rules
          [/^[-*_]{3,}\s*$/, 'keyword.hr'],

          // Footnote definitions
          [/^\[\^([^\]]+)\]:/, 'keyword.footnote.definition'],

          // Include inline tokenizer
          { include: '@inline' },
        ],

        // Inline elements (used in multiple contexts)
        inline: [
          // Escaped characters
          [/\\[\\`*_\[\]{}()#+\-.!~]/, 'string.escape'],

          // Inline code (with backticks)
          [/`{3,}[^`]*`{3,}/, 'string.code.inline'],
          [/`[^`]+`/, 'string.code.inline'],

          // Math inline
          [/\$[^$]+\$/, 'keyword.math.inline'],

          // Bold + Italic combined
          [/\*\*\*[^*]+\*\*\*/, 'strong.emphasis'],
          [/___[^_]+___/, 'strong.emphasis'],

          // Bold
          [/\*\*[^*]+\*\*/, 'strong'],
          [/__[^_]+__/, 'strong'],

          // Italic
          [/\*[^*\s][^*]*\*/, 'emphasis'],
          [/_[^_\s][^_]*_/, 'emphasis'],

          // Strikethrough
          [/~~[^~]+~~/, 'strikethrough'],

          // Highlight (MD++ extension)
          [/==[^=]+==$/, 'highlight'],

          // Superscript
          [/\^[^\s^]+\^/, 'superscript'],

          // Subscript
          [/~[^\s~]+~/, 'subscript'],

          // Images (must come before links)
          [/!\[/, { token: 'string.link.image.bracket', next: '@imageAlt' }],

          // Links
          [/\[/, { token: 'string.link.bracket', next: '@linkText' }],

          // Autolinks
          [/<(https?:\/\/[^>]+)>/, 'string.link.auto'],
          [/<([^@>]+@[^>]+)>/, 'string.link.email'],

          // Footnote references
          [/\[\^([^\]]+)\]/, 'keyword.footnote.reference'],

          // HTML tags
          [/<\/?[a-zA-Z][a-zA-Z0-9]*(\s+[^>]*)?>/, 'tag.html'],

          // HTML comments
          [/<!--/, { token: 'comment.html', next: '@htmlComment' }],

          // Emoji shortcodes
          [/:[\w+-]+:/, 'keyword.emoji'],
        ],

        // YAML frontmatter
        frontmatter: [
          [/^---$/, { token: 'meta.frontmatter.delimiter', next: '@pop' }],
          [/^([a-zA-Z_][\w-]*):/, 'variable.frontmatter.key'],
          [/"[^"]*"/, 'string.frontmatter.value'],
          [/'[^']*'/, 'string.frontmatter.value'],
          [/\b(true|false|null)\b/, 'keyword.frontmatter.value'],
          [/\b\d+\b/, 'number.frontmatter.value'],
          [/.*/, 'meta.frontmatter.content'],
        ],

        // AI context block
        aicontext: [
          [/^:::$/, { token: 'keyword.ai-context', next: '@pop' }],
          [/.*/, 'comment.ai-context.content'],
        ],

        aicontextWithParams: [
          [/\}/, { token: 'keyword.ai-context', switchTo: '@aicontext' }],
          [/[^}]+/, 'variable.ai-context.params'],
        ],

        // Fenced code block (backticks)
        codeblock: [
          [/^```\s*$/, { token: 'string.code.fence', next: '@pop' }],
          [/.*/, 'string.code.content'],
        ],

        // Fenced code block (tildes)
        codeblockTilde: [
          [/^~~~\s*$/, { token: 'string.code.fence', next: '@pop' }],
          [/.*/, 'string.code.content'],
        ],

        // Math block
        mathblock: [
          [/^\$\$$/, { token: 'keyword.math.display', next: '@pop' }],
          [/.*/, 'string.math.content'],
        ],

        // Table row
        table: [
          [/\|/, 'keyword.table.separator'],
          [/:?-+:?/, 'keyword.table.alignment'],
          [/[^|]+/, 'string.table.cell'],
          [/$/, '', '@pop'],
        ],

        // Link text
        linkText: [
          [/\]/, { token: 'string.link.bracket', next: '@linkTarget' }],
          [/[^\]]+/, 'string.link.text'],
        ],

        // Link target
        linkTarget: [
          [/\(/, { token: 'string.link.bracket', next: '@linkUrl' }],
          [/\[/, { token: 'string.link.bracket', next: '@linkReference' }],
          [/./, { token: '', next: '@pop' }],
        ],

        linkUrl: [
          [/\)/, { token: 'string.link.bracket', next: '@pop' }],
          [/"[^"]*"/, 'string.link.title'],
          [/'[^']*'/, 'string.link.title'],
          [/[^)"']+/, 'string.link.url'],
        ],

        linkReference: [
          [/\]/, { token: 'string.link.bracket', next: '@pop' }],
          [/[^\]]+/, 'string.link.reference'],
        ],

        // Image alt text
        imageAlt: [
          [/\]/, { token: 'string.link.image.bracket', next: '@imageTarget' }],
          [/[^\]]+/, 'string.link.image.alt'],
        ],

        // Image target
        imageTarget: [
          [/\(/, { token: 'string.link.image.bracket', next: '@imageUrl' }],
          [/./, { token: '', next: '@pop' }],
        ],

        imageUrl: [
          [/\)/, { token: 'string.link.image.bracket', next: '@pop' }],
          [/"[^"]*"/, 'string.link.image.title'],
          [/'[^']*'/, 'string.link.image.title'],
          [/[^)"']+/, 'string.link.image.url'],
        ],

        // HTML comment
        htmlComment: [
          [/-->/, { token: 'comment.html', next: '@pop' }],
          [/[^-]+/, 'comment.html'],
          [/./, 'comment.html'],
        ],
      },
    });

    // Dark theme
    monaco.editor.defineTheme('mdppDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Headings
        { token: 'keyword.heading.marker', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'keyword.heading.text', foreground: '4fc1ff', fontStyle: 'bold' },

        // MD++ Directives
        { token: 'keyword.directive', foreground: 'c586c0' },
        { token: 'keyword.directive.name', foreground: 'dcdcaa' },
        { token: 'keyword.directive.inline', foreground: 'c586c0' },
        { token: 'variable.directive.params', foreground: '9cdcfe' },
        { token: 'bracket.directive', foreground: 'c586c0' },

        // AI Context
        { token: 'keyword.ai-context', foreground: 'dcdcaa', fontStyle: 'bold' },
        { token: 'comment.ai-context.content', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'variable.ai-context.params', foreground: '9cdcfe' },

        // Code
        { token: 'string.code.fence', foreground: '808080' },
        { token: 'string.code.language', foreground: '4ec9b0' },
        { token: 'string.code.content', foreground: 'ce9178' },
        { token: 'string.code.inline', foreground: 'ce9178', background: '3c3c3c' },

        // Math
        { token: 'keyword.math.display', foreground: 'b5cea8' },
        { token: 'keyword.math.inline', foreground: 'b5cea8' },
        { token: 'string.math.content', foreground: 'd7ba7d' },

        // Text formatting
        { token: 'strong', fontStyle: 'bold' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'strong.emphasis', fontStyle: 'bold italic' },
        { token: 'strikethrough', fontStyle: 'strikethrough', foreground: '808080' },
        { token: 'highlight', foreground: '000000', background: 'ffff00' },
        { token: 'superscript', foreground: '9cdcfe' },
        { token: 'subscript', foreground: '9cdcfe' },

        // Links and images
        { token: 'string.link.bracket', foreground: '808080' },
        { token: 'string.link.text', foreground: '4ec9b0' },
        { token: 'string.link.url', foreground: '3794ff' },
        { token: 'string.link.title', foreground: 'ce9178' },
        { token: 'string.link.reference', foreground: '9cdcfe' },
        { token: 'string.link.auto', foreground: '3794ff' },
        { token: 'string.link.email', foreground: '3794ff' },
        { token: 'string.link.image.bracket', foreground: '808080' },
        { token: 'string.link.image.alt', foreground: 'dcdcaa' },
        { token: 'string.link.image.url', foreground: '3794ff' },
        { token: 'string.link.image.title', foreground: 'ce9178' },

        // Lists
        { token: 'keyword.list.marker', foreground: 'd7ba7d' },
        { token: 'keyword.list.ordered.marker', foreground: 'd7ba7d' },
        { token: 'keyword.task.checkbox', foreground: '4ec9b0', fontStyle: 'bold' },

        // Blockquotes
        { token: 'keyword.quote.marker', foreground: '608b4e', fontStyle: 'italic' },

        // Tables
        { token: 'keyword.table', foreground: '569cd6' },
        { token: 'keyword.table.separator', foreground: '808080' },
        { token: 'keyword.table.alignment', foreground: '608b4e' },
        { token: 'string.table.cell', foreground: 'd4d4d4' },

        // Horizontal rule
        { token: 'keyword.hr', foreground: '808080' },

        // Footnotes
        { token: 'keyword.footnote.definition', foreground: 'c586c0' },
        { token: 'keyword.footnote.reference', foreground: 'c586c0' },

        // Frontmatter
        { token: 'meta.frontmatter.delimiter', foreground: '608b4e' },
        { token: 'meta.frontmatter.content', foreground: 'd4d4d4' },
        { token: 'variable.frontmatter.key', foreground: '9cdcfe' },
        { token: 'string.frontmatter.value', foreground: 'ce9178' },
        { token: 'keyword.frontmatter.value', foreground: '569cd6' },
        { token: 'number.frontmatter.value', foreground: 'b5cea8' },

        // HTML
        { token: 'tag.html', foreground: '808080' },
        { token: 'comment.html', foreground: '6a9955' },

        // Escapes and misc
        { token: 'string.escape', foreground: 'd7ba7d' },
        { token: 'keyword.emoji', foreground: 'dcdcaa' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorCursor.foreground': '#aeafad',
        'editor.selectionBackground': '#264f78',
      },
    });

    // Light theme
    monaco.editor.defineTheme('mdppLight', {
      base: 'vs',
      inherit: true,
      rules: [
        // Headings
        { token: 'keyword.heading.marker', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'keyword.heading.text', foreground: '001080', fontStyle: 'bold' },

        // MD++ Directives
        { token: 'keyword.directive', foreground: 'af00db' },
        { token: 'keyword.directive.name', foreground: '795e26' },
        { token: 'keyword.directive.inline', foreground: 'af00db' },
        { token: 'variable.directive.params', foreground: '001080' },
        { token: 'bracket.directive', foreground: 'af00db' },

        // AI Context
        { token: 'keyword.ai-context', foreground: '795e26', fontStyle: 'bold' },
        { token: 'comment.ai-context.content', foreground: '008000', fontStyle: 'italic' },
        { token: 'variable.ai-context.params', foreground: '001080' },

        // Code
        { token: 'string.code.fence', foreground: '808080' },
        { token: 'string.code.language', foreground: '267f99' },
        { token: 'string.code.content', foreground: 'a31515' },
        { token: 'string.code.inline', foreground: 'a31515', background: 'f5f5f5' },

        // Math
        { token: 'keyword.math.display', foreground: '098658' },
        { token: 'keyword.math.inline', foreground: '098658' },
        { token: 'string.math.content', foreground: '795e26' },

        // Text formatting
        { token: 'strong', fontStyle: 'bold' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'strong.emphasis', fontStyle: 'bold italic' },
        { token: 'strikethrough', fontStyle: 'strikethrough', foreground: '808080' },
        { token: 'highlight', foreground: '000000', background: 'ffff00' },
        { token: 'superscript', foreground: '001080' },
        { token: 'subscript', foreground: '001080' },

        // Links and images
        { token: 'string.link.bracket', foreground: '808080' },
        { token: 'string.link.text', foreground: '267f99' },
        { token: 'string.link.url', foreground: '0000ff' },
        { token: 'string.link.title', foreground: 'a31515' },
        { token: 'string.link.reference', foreground: '001080' },
        { token: 'string.link.auto', foreground: '0000ff' },
        { token: 'string.link.email', foreground: '0000ff' },
        { token: 'string.link.image.bracket', foreground: '808080' },
        { token: 'string.link.image.alt', foreground: '795e26' },
        { token: 'string.link.image.url', foreground: '0000ff' },
        { token: 'string.link.image.title', foreground: 'a31515' },

        // Lists
        { token: 'keyword.list.marker', foreground: '795e26' },
        { token: 'keyword.list.ordered.marker', foreground: '795e26' },
        { token: 'keyword.task.checkbox', foreground: '267f99', fontStyle: 'bold' },

        // Blockquotes
        { token: 'keyword.quote.marker', foreground: '008000', fontStyle: 'italic' },

        // Tables
        { token: 'keyword.table', foreground: '0000ff' },
        { token: 'keyword.table.separator', foreground: '808080' },
        { token: 'keyword.table.alignment', foreground: '008000' },
        { token: 'string.table.cell', foreground: '000000' },

        // Horizontal rule
        { token: 'keyword.hr', foreground: '808080' },

        // Footnotes
        { token: 'keyword.footnote.definition', foreground: 'af00db' },
        { token: 'keyword.footnote.reference', foreground: 'af00db' },

        // Frontmatter
        { token: 'meta.frontmatter.delimiter', foreground: '008000' },
        { token: 'meta.frontmatter.content', foreground: '000000' },
        { token: 'variable.frontmatter.key', foreground: '001080' },
        { token: 'string.frontmatter.value', foreground: 'a31515' },
        { token: 'keyword.frontmatter.value', foreground: '0000ff' },
        { token: 'number.frontmatter.value', foreground: '098658' },

        // HTML
        { token: 'tag.html', foreground: '800000' },
        { token: 'comment.html', foreground: '008000' },

        // Escapes and misc
        { token: 'string.escape', foreground: '795e26' },
        { token: 'keyword.emoji', foreground: '795e26' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#f5f5f5',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#add6ff',
      },
    });

    // Set initial theme
    monaco.editor.setTheme(theme === 'dark' ? 'mdppDark' : 'mdppLight');

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
