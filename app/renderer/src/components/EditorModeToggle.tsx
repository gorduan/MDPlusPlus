/**
 * EditorModeToggle - Switch between Source and WYSIWYG editing modes
 */

import React from 'react';

export type EditorMode = 'source' | 'wysiwyg';

interface EditorModeToggleProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

export default function EditorModeToggle({ mode, onModeChange }: EditorModeToggleProps) {
  return (
    <div className="editor-mode-toggle">
      <span className="editor-mode-label">Editor</span>
      <div className="editor-mode-buttons">
        <button
          type="button"
          onClick={() => onModeChange('source')}
          className={`editor-mode-btn ${mode === 'source' ? 'active' : ''}`}
          title="Source Mode - Edit raw Markdown"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Source</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('wysiwyg')}
          className={`editor-mode-btn ${mode === 'wysiwyg' ? 'active' : ''}`}
          title="WYSIWYG Mode - Visual editing"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>WYSIWYG</span>
        </button>
      </div>
    </div>
  );
}
