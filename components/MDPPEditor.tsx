/**
 * MD++ Embeddable Editor Component
 *
 * A Monaco-based editor with MD++ syntax highlighting.
 * Can be embedded in any React application.
 *
 * @example
 * ```tsx
 * import { MDPPEditor } from '@gorduan/mdplusplus/components';
 *
 * function MyApp() {
 *   const [content, setContent] = useState('# Hello MD++');
 *   return <MDPPEditor value={content} onChange={setContent} />;
 * }
 * ```
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

// Dynamic import for Monaco to avoid SSR issues
let MonacoEditor: any = null;
if (typeof window !== 'undefined') {
  MonacoEditor = require('@monaco-editor/react').default;
}

export interface MDPPEditorProps {
  /** The markdown content */
  value: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Editor height (default: '400px') */
  height?: string | number;
  /** Enable dark theme (default: true) */
  darkMode?: boolean;
  /** Show line numbers (default: true) */
  lineNumbers?: boolean;
  /** Enable word wrap (default: true) */
  wordWrap?: boolean;
  /** Font size in pixels (default: 14) */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Show minimap (default: false) */
  minimap?: boolean;
  /** Read-only mode (default: false) */
  readOnly?: boolean;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Callback when editor is mounted */
  onMount?: (editor: any, monaco: any) => void;
  /** Callback when cursor position changes */
  onCursorChange?: (position: { line: number; column: number }) => void;
}

export interface MDPPEditorRef {
  /** Insert text at cursor position */
  insert: (text: string) => void;
  /** Wrap selected text with given string */
  insertWrap: (wrapper: string) => void;
  /** Get the editor instance */
  getEditor: () => any;
  /** Focus the editor */
  focus: () => void;
  /** Get current selection */
  getSelection: () => string;
  /** Set cursor position */
  setCursorPosition: (line: number, column: number) => void;
}

export const MDPPEditor = forwardRef<MDPPEditorRef, MDPPEditorProps>(({
  value,
  onChange,
  height = '400px',
  darkMode = true,
  lineNumbers = true,
  wordWrap = true,
  fontSize = 14,
  fontFamily = "'Fira Code', 'Cascadia Code', Consolas, monospace",
  minimap = false,
  readOnly = false,
  placeholder,
  className,
  style,
  onMount,
  onCursorChange,
}, ref) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

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
    getEditor: () => editorRef.current,
    focus: () => editorRef.current?.focus(),
    getSelection: () => {
      const editor = editorRef.current;
      if (!editor) return '';
      const selection = editor.getSelection();
      return selection ? editor.getModel()?.getValueInRange(selection) || '' : '';
    },
    setCursorPosition: (line: number, column: number) => {
      editorRef.current?.setPosition({ lineNumber: line, column });
    },
  }));

  const handleMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Register MD++ language if not exists
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'mdplusplus')) {
      monaco.languages.register({ id: 'mdplusplus' });

      monaco.languages.setMonarchTokensProvider('mdplusplus', {
        defaultToken: '',
        tokenPostfix: '.mdpp',
        tokenizer: {
          root: [
            [/^---$/, { token: 'meta.embedded', next: '@frontmatter' }],
            [/^:::ai-context.*$/, { token: 'keyword.control.ai-context', next: '@aicontext' }],
            [/^:::(\w+)/, { token: 'keyword.control.directive', next: '@containerDirective' }],
            [/^::(\w+)/, 'keyword.control.directive'],
            [/:(\w+)\[/, 'keyword.control.directive'],
            [/^#{1,6}\s/, 'keyword.heading'],
            [/^```\w*$/, { token: 'string.code', next: '@codeblock' }],
            [/`[^`]+`/, 'string.code.inline'],
            [/\*\*[^*]+\*\*/, 'strong'],
            [/__[^_]+__/, 'strong'],
            [/\*[^*]+\*/, 'emphasis'],
            [/_[^_]+_/, 'emphasis'],
            [/\[([^\]]+)\]\([^)]+\)/, 'string.link'],
            [/!\[([^\]]*)\]\([^)]+\)/, 'string.link.image'],
            [/^[\*\-\+]\s/, 'keyword.list'],
            [/^\d+\.\s/, 'keyword.list.ordered'],
            [/^>\s/, 'keyword.quote'],
            [/^---+$/, 'keyword.hr'],
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
    }

    // Define themes
    monaco.editor.defineTheme('mdppDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword.heading', foreground: '569cd6', fontStyle: 'bold' },
        { token: 'keyword.control.directive', foreground: 'c586c0' },
        { token: 'keyword.control.ai-context', foreground: 'dcdcaa' },
        { token: 'comment.ai-context', foreground: '6a9955', fontStyle: 'italic' },
        { token: 'string.code', foreground: 'ce9178' },
        { token: 'strong', fontStyle: 'bold' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'string.link', foreground: '4ec9b0' },
        { token: 'variable.parameter', foreground: '9cdcfe' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
      },
    });

    monaco.editor.defineTheme('mdppLight', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword.heading', foreground: '0000ff', fontStyle: 'bold' },
        { token: 'keyword.control.directive', foreground: 'af00db' },
        { token: 'keyword.control.ai-context', foreground: '795e26' },
        { token: 'comment.ai-context', foreground: '008000', fontStyle: 'italic' },
        { token: 'string.code', foreground: 'a31515' },
        { token: 'strong', fontStyle: 'bold' },
        { token: 'emphasis', fontStyle: 'italic' },
        { token: 'string.link', foreground: '267f99' },
        { token: 'variable.parameter', foreground: '001080' },
      ],
      colors: {},
    });

    monaco.editor.setTheme(darkMode ? 'mdppDark' : 'mdppLight');

    // Track cursor position
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e: any) => {
        onCursorChange({
          line: e.position.lineNumber,
          column: e.position.column,
        });
      });
    }

    // Call user's onMount callback
    if (onMount) {
      onMount(editor, monaco);
    }
  }, [darkMode, onMount, onCursorChange]);

  const handleChange = useCallback((newValue: string | undefined) => {
    if (onChange && newValue !== undefined) {
      onChange(newValue);
    }
  }, [onChange]);

  // Handle theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(darkMode ? 'mdppDark' : 'mdppLight');
    }
  }, [darkMode]);

  // SSR check
  if (!MonacoEditor) {
    return (
      <div className={className} style={{ height, ...style }}>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ width: '100%', height: '100%', fontFamily, fontSize }}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <MonacoEditor
        height={height}
        language="mdplusplus"
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          minimap: { enabled: minimap },
          fontSize,
          fontFamily,
          lineNumbers: lineNumbers ? 'on' : 'off',
          wordWrap: wordWrap ? 'on' : 'off',
          readOnly,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 8 },
        }}
      />
    </div>
  );
});

MDPPEditor.displayName = 'MDPPEditor';
