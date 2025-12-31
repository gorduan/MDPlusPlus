/**
 * MD++ Toolbar Component
 */

import React, { useState, useEffect } from 'react';
import type { ViewMode } from '../../../electron/preload';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showAIContext: boolean;
  onToggleAIContext: () => void;
}

export default function Toolbar({
  viewMode,
  onViewModeChange,
  showAIContext,
  onToggleAIContext,
}: ToolbarProps) {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // Listen for DevTools state changes (e.g., manual close)
  useEffect(() => {
    if (!window.electronAPI) return;
    const unsubscribe = window.electronAPI.onDevToolsState((isOpen) => {
      setDevToolsOpen(isOpen);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleDevTools = async () => {
    if (window.electronAPI) {
      const isOpen = await window.electronAPI.toggleDevTools();
      setDevToolsOpen(isOpen);
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section toolbar-left">
        <span className="toolbar-title">MD++</span>
      </div>

      <div className="toolbar-section toolbar-center">
        <div className="view-mode-buttons">
          <button
            className={`toolbar-btn ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => onViewModeChange('editor')}
            title="Editor Only (Ctrl+1)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 14V2h12v12H2z"/>
              <path d="M4 4h8v1H4zM4 6h8v1H4zM4 8h6v1H4z"/>
            </svg>
            <span>Editor</span>
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => onViewModeChange('split')}
            title="Split View (Ctrl+3)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 14V2h5v12H2zm6 0V2h6v12H8z"/>
            </svg>
            <span>Split</span>
          </button>
          <button
            className={`toolbar-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => onViewModeChange('preview')}
            title="Preview Only (Ctrl+2)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3C4.5 3 1.5 5.5 1 8c.5 2.5 3.5 5 7 5s6.5-2.5 7-5c-.5-2.5-3.5-5-7-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
              <circle cx="8" cy="8" r="1.5"/>
            </svg>
            <span>Preview</span>
          </button>
        </div>
      </div>

      <div className="toolbar-section toolbar-right">
        <button
          className={`toolbar-btn ${showAIContext ? 'active' : ''}`}
          onClick={onToggleAIContext}
          title="Toggle AI Context Visibility (Ctrl+Shift+A)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
            <path d="M8 4a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V5a1 1 0 0 0-1-1zM8 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
          </svg>
          <span>AI</span>
        </button>
        <button
          className={`toolbar-btn ${devToolsOpen ? 'active' : ''}`}
          onClick={handleToggleDevTools}
          title="Toggle Developer Tools (F12)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 11.5 2h-7zM3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7z"/>
            <path d="M5.5 6l2 2-2 2-.7-.7L6.1 8 4.8 6.7l.7-.7zM8 10h3v1H8v-1z"/>
          </svg>
          <span>DevTools</span>
        </button>
      </div>
    </div>
  );
}
