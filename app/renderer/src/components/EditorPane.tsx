/**
 * EditorPane - Container component with Source/WYSIWYG mode toggle
 * Wraps both Monaco Editor and TipTap WYSIWYG editor
 */

import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import Editor, { EditorRef } from './Editor';
import WysiwygEditor, { WysiwygScrollInfo } from './WysiwygEditor';
import type { editor } from 'monaco-editor';

export type EditorMode = 'source' | 'wysiwyg';

type Theme = 'dark' | 'light';

interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
  theme?: Theme;
  /** Current editor mode (source or wysiwyg) - controlled from parent */
  editorMode: EditorMode;
  /** Called when Monaco editor is scrolled */
  onScroll?: (editor: editor.IStandaloneCodeEditor) => void;
  /** Called when WYSIWYG editor is scrolled */
  onWysiwygScroll?: (scrollInfo: WysiwygScrollInfo) => void;
  /** Called when Monaco editor is mounted */
  onEditorMount?: (editor: editor.IStandaloneCodeEditor) => void;
  /** Called when WYSIWYG editor content wrapper is mounted */
  onWysiwygMount?: (element: HTMLElement | null) => void;
  /** List of enabled plugin IDs for WYSIWYG extensions */
  enabledPlugins?: string[];
}

export interface EditorPaneRef {
  insert: (text: string) => void;
  insertWrap: (wrapper: string) => void;
}

const EditorPane = forwardRef<EditorPaneRef, EditorPaneProps>(
  ({ content, onChange, onCursorChange, theme = 'dark', editorMode, onScroll, onWysiwygScroll, onEditorMount, onWysiwygMount, enabledPlugins = [] }, ref) => {
    const monacoEditorRef = useRef<EditorRef | null>(null);
    const wysiwygWrapperRef = useRef<HTMLElement | null>(null);
    const monacoInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    // Store scroll percentage to restore on mode switch
    const scrollPercentageRef = useRef<number>(0);
    const pendingScrollRestoreRef = useRef<boolean>(false);
    // Flag to prevent scroll tracking during restore
    const isRestoringScrollRef = useRef<boolean>(false);
    // Track previous mode to detect mode changes
    const prevModeRef = useRef<EditorMode>(editorMode);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      insert: (text: string) => {
        if (editorMode === 'source' && monacoEditorRef.current) {
          monacoEditorRef.current.insert(text);
        } else {
          // For WYSIWYG, we could implement TipTap insertions here
          // For now, just append to content
          onChange(content + text);
        }
      },
      insertWrap: (wrapper: string) => {
        if (editorMode === 'source' && monacoEditorRef.current) {
          monacoEditorRef.current.insertWrap(wrapper);
        }
      },
    }), [editorMode, content, onChange]);

    // Save current scroll position before mode change
    const saveScrollPosition = useCallback((currentMode: EditorMode) => {
      if (currentMode === 'source' && monacoInstanceRef.current) {
        const editor = monacoInstanceRef.current;
        const scrollTop = editor.getScrollTop();
        const scrollHeight = editor.getScrollHeight();
        const clientHeight = editor.getLayoutInfo().height;
        const maxScroll = scrollHeight - clientHeight;
        scrollPercentageRef.current = maxScroll > 0 ? scrollTop / maxScroll : 0;
      } else if (currentMode === 'wysiwyg' && wysiwygWrapperRef.current) {
        const el = wysiwygWrapperRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;
        scrollPercentageRef.current = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
      }
    }, []);

    // Handle mode changes from parent (save scroll position when mode changes)
    if (prevModeRef.current !== editorMode) {
      saveScrollPosition(prevModeRef.current);
      pendingScrollRestoreRef.current = true;
      prevModeRef.current = editorMode;
    }

    const handleContentChange = useCallback((newContent: string) => {
      onChange(newContent);
    }, [onChange]);

    // Handle Monaco editor mount - store reference and restore scroll
    const handleMonacoMount = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
      monacoInstanceRef.current = editorInstance;

      // Restore scroll position after mount
      if (pendingScrollRestoreRef.current) {
        const savedPercentage = scrollPercentageRef.current;
        isRestoringScrollRef.current = true;

        // Use multiple frames to ensure Monaco has fully rendered content
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const scrollHeight = editorInstance.getScrollHeight();
            const clientHeight = editorInstance.getLayoutInfo().height;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll > 0) {
              editorInstance.setScrollTop(savedPercentage * maxScroll);
            }
            pendingScrollRestoreRef.current = false;
            // Reset restore flag after a short delay to let scroll events settle
            setTimeout(() => {
              isRestoringScrollRef.current = false;
            }, 100);
          });
        });
      }

      // Call parent handler
      if (onEditorMount) {
        onEditorMount(editorInstance);
      }
    }, [onEditorMount]);

    // Handle WYSIWYG content mount - store reference and restore scroll
    const handleWysiwygContentMount = useCallback((element: HTMLElement | null) => {
      wysiwygWrapperRef.current = element;

      // Restore scroll position after mount
      if (element && pendingScrollRestoreRef.current) {
        const savedPercentage = scrollPercentageRef.current;
        isRestoringScrollRef.current = true;

        // Use multiple frames to ensure TipTap has fully rendered content
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const maxScroll = element.scrollHeight - element.clientHeight;
            if (maxScroll > 0) {
              element.scrollTop = savedPercentage * maxScroll;
            }
            pendingScrollRestoreRef.current = false;
            // Reset restore flag after a short delay to let scroll events settle
            setTimeout(() => {
              isRestoringScrollRef.current = false;
            }, 100);
          });
        });
      }

      // Call parent handler
      if (onWysiwygMount) {
        onWysiwygMount(element);
      }
    }, [onWysiwygMount]);

    // Track scroll position continuously for Monaco
    const handleMonacoScroll = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
      // Don't update scroll percentage while restoring position
      if (!isRestoringScrollRef.current) {
        const scrollTop = editorInstance.getScrollTop();
        const scrollHeight = editorInstance.getScrollHeight();
        const clientHeight = editorInstance.getLayoutInfo().height;
        const maxScroll = scrollHeight - clientHeight;
        scrollPercentageRef.current = maxScroll > 0 ? scrollTop / maxScroll : 0;
      }

      // Call parent handler
      if (onScroll) {
        onScroll(editorInstance);
      }
    }, [onScroll]);

    // Track scroll position continuously for WYSIWYG
    const handleWysiwygScrollInternal = useCallback((scrollInfo: WysiwygScrollInfo) => {
      // Don't update scroll percentage while restoring position
      if (!isRestoringScrollRef.current) {
        const maxScroll = scrollInfo.scrollHeight - scrollInfo.clientHeight;
        scrollPercentageRef.current = maxScroll > 0 ? scrollInfo.scrollTop / maxScroll : 0;
      }

      // Call parent handler
      if (onWysiwygScroll) {
        onWysiwygScroll(scrollInfo);
      }
    }, [onWysiwygScroll]);

    return (
      <div className="editor-pane-container">
        <div className="editor-pane-content">
          {editorMode === 'source' ? (
            <Editor
              ref={monacoEditorRef}
              content={content}
              onChange={handleContentChange}
              onCursorChange={onCursorChange}
              theme={theme}
              onScroll={handleMonacoScroll}
              onEditorMount={handleMonacoMount}
            />
          ) : (
            <WysiwygEditor
              content={content}
              onChange={handleContentChange}
              theme={theme}
              enabledPlugins={enabledPlugins}
              onScroll={handleWysiwygScrollInternal}
              onContentMount={handleWysiwygContentMount}
            />
          )}
        </div>
      </div>
    );
  }
);

EditorPane.displayName = 'EditorPane';

export default EditorPane;
