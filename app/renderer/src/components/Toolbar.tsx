/**
 * MD++ Toolbar Component
 */

import React, { useState, useEffect } from 'react';
import type { ViewMode } from '../../../electron/preload';

export type Theme = 'dark' | 'light';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showAIContext: boolean;
  onToggleAIContext: () => void;
  onOpenSettings: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export default function Toolbar({
  viewMode,
  onViewModeChange,
  showAIContext,
  onToggleAIContext,
  onOpenSettings,
  theme,
  onToggleTheme,
}: ToolbarProps) {
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  // Listen for DevTools state changes (e.g., manual close)
  useEffect(() => {
    if (!window.electronAPI) return;
    const unsubscribe = window.electronAPI.onDevToolsState((isOpen) => {
      setDevToolsOpen(isOpen);
    });
    return () => {
      unsubscribe();
    };
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
        <button
          className="theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            // Sun icon for switching to light mode
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            // Moon icon for switching to dark mode
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
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
          className="toolbar-btn"
          onClick={onOpenSettings}
          title="Settings (Ctrl+,)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
          </svg>
          <span>Settings</span>
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
