/**
 * EditorPane - Container component with Source/WYSIWYG mode toggle
 * Wraps both Monaco Editor and TipTap WYSIWYG editor
 */

import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import Editor, { EditorRef } from './Editor';
import WysiwygEditor from './WysiwygEditor';
import EditorModeToggle, { EditorMode } from './EditorModeToggle';

type Theme = 'dark' | 'light';

interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
  theme?: Theme;
}

export interface EditorPaneRef {
  insert: (text: string) => void;
  insertWrap: (wrapper: string) => void;
  getMode: () => EditorMode;
  setMode: (mode: EditorMode) => void;
}

const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(
  ({ content, onChange, onCursorChange, theme = 'dark' }, ref) => {
    const [mode, setMode] = useState<EditorMode>('source');
    const monacoEditorRef = useRef<EditorRef | null>(null);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      insert: (text: string) => {
        if (mode === 'source' && monacoEditorRef.current) {
          monacoEditorRef.current.insert(text);
        } else {
          // For WYSIWYG, we could implement TipTap insertions here
          // For now, just append to content
          onChange(content + text);
        }
      },
      insertWrap: (wrapper: string) => {
        if (mode === 'source' && monacoEditorRef.current) {
          monacoEditorRef.current.insertWrap(wrapper);
        }
      },
      getMode: () => mode,
      setMode: (newMode: EditorMode) => setMode(newMode),
    }), [mode, content, onChange]);

    const handleModeChange = useCallback((newMode: EditorMode) => {
      setMode(newMode);
    }, []);

    const handleContentChange = useCallback((newContent: string) => {
      onChange(newContent);
    }, [onChange]);

    return (
      <div className="editor-pane-container">
        <EditorModeToggle mode={mode} onModeChange={handleModeChange} />

        <div className="editor-pane-content">
          {mode === 'source' ? (
            <Editor
              ref={monacoEditorRef}
              content={content}
              onChange={handleContentChange}
              onCursorChange={onCursorChange}
              theme={theme}
            />
          ) : (
            <WysiwygEditor
              content={content}
              onChange={handleContentChange}
              theme={theme}
            />
          )}
        </div>
      </div>
    );
  }
);

EditorPane.displayName = 'EditorPane';

export default EditorPane;
