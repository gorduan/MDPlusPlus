/**
 * MD++ Toolbar Component
 * Modern toolbar with grouped actions and visual feedback
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ViewMode } from '../../../electron/preload';

export type Theme = 'dark' | 'light';
export type EditorMode = 'source' | 'wysiwyg';

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  editorMode: EditorMode;
  onEditorModeChange: (mode: EditorMode) => void;
  showAIContext: boolean;
  onToggleAIContext: () => void;
  onOpenSettings: () => void;
  onOpenThemeEditor: () => void;
  onOpenPluginManager: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export default function Toolbar({
  viewMode,
  onViewModeChange,
  editorMode,
  onEditorModeChange,
  showAIContext,
  onToggleAIContext,
  onOpenSettings,
  onOpenThemeEditor,
  onOpenPluginManager,
  theme,
  onToggleTheme,
  onToggleSidebar,
  sidebarOpen = false,
}: ToolbarProps) {
  const { t } = useTranslation('common');
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
    <header className="toolbar">
      {/* Left Section - Menu & Logo */}
      <div className="toolbar__section toolbar__section--left">
        {onToggleSidebar && (
          <button
            className={`toolbar__btn toolbar__btn--icon ${sidebarOpen ? 'toolbar__btn--active' : ''}`}
            onClick={onToggleSidebar}
            title={sidebarOpen ? t('toolbar.closeSidebar') : t('toolbar.openSidebar')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="toolbar__brand">
          <span className="toolbar__title">MD++</span>
        </div>
      </div>

      {/* Center Section - Editor Modes and View Modes */}
      <div className="toolbar__section toolbar__section--center">
        {/* Editor Mode Toggle (Source/WYSIWYG) - only visible when editor is shown */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <>
            <div className="toolbar__group toolbar__editormodes">
              <button
                className={`toolbar__viewmode-btn ${editorMode === 'source' ? 'toolbar__viewmode-btn--active' : ''}`}
                onClick={() => onEditorModeChange('source')}
                title={t('toolbar.sourceMode')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span>{t('toolbar.source')}</span>
              </button>
              <button
                className={`toolbar__viewmode-btn ${editorMode === 'wysiwyg' ? 'toolbar__viewmode-btn--active' : ''}`}
                onClick={() => onEditorModeChange('wysiwyg')}
                title={t('toolbar.wysiwygMode')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                <span>WYSIWYG</span>
              </button>
            </div>
            <div className="toolbar__divider toolbar__divider--vertical" />
          </>
        )}

        {/* View Mode Toggle (Editor/Split/Preview) */}
        <div className="toolbar__group toolbar__viewmodes">
          <button
            className={`toolbar__viewmode-btn ${viewMode === 'editor' ? 'toolbar__viewmode-btn--active' : ''}`}
            onClick={() => onViewModeChange('editor')}
            title={`${t('toolbar.editorOnly')} (Ctrl+1)`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="7" y1="8" x2="17" y2="8" />
              <line x1="7" y1="12" x2="15" y2="12" />
              <line x1="7" y1="16" x2="13" y2="16" />
            </svg>
            <span>{t('status.editor')}</span>
          </button>
          <button
            className={`toolbar__viewmode-btn ${viewMode === 'split' ? 'toolbar__viewmode-btn--active' : ''}`}
            onClick={() => onViewModeChange('split')}
            title={`${t('toolbar.splitView')} (Ctrl+3)`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
            <span>{t('status.split')}</span>
          </button>
          <button
            className={`toolbar__viewmode-btn ${viewMode === 'preview' ? 'toolbar__viewmode-btn--active' : ''}`}
            onClick={() => onViewModeChange('preview')}
            title={`${t('toolbar.previewOnly')} (Ctrl+2)`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>{t('status.preview')}</span>
          </button>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="toolbar__section toolbar__section--right">
        {/* AI Context Toggle */}
        <button
          className={`toolbar__btn toolbar__btn--feature ${showAIContext ? 'toolbar__btn--active' : ''}`}
          onClick={onToggleAIContext}
          title={`${t('toolbar.toggleAiContext')} (Ctrl+Shift+A)`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
            <path d="M12 6a1 1 0 0 0-1 1v5a1 1 0 0 0 2 0V7a1 1 0 0 0-1-1z" />
            <circle cx="12" cy="16" r="1" />
          </svg>
          <span>AI</span>
        </button>

        {/* Divider */}
        <div className="toolbar__divider" />

        {/* Theme Toggle */}
        <button
          className="toolbar__btn toolbar__btn--icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t('toolbar.lightMode') : t('toolbar.darkMode')}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Theme Editor */}
        <button
          className="toolbar__btn toolbar__btn--icon"
          onClick={onOpenThemeEditor}
          title={t('toolbar.themeEditor')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <circle cx="15.5" cy="8.5" r="1.5" />
            <circle cx="6.5" cy="13.5" r="1.5" />
          </svg>
        </button>

        {/* Plugin Manager */}
        <button
          className="toolbar__btn toolbar__btn--icon"
          onClick={onOpenPluginManager}
          title={t('toolbar.pluginManager')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </button>

        {/* Settings */}
        <button
          className="toolbar__btn toolbar__btn--icon"
          onClick={onOpenSettings}
          title={`${t('toolbar.settings')} (Ctrl+,)`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* DevTools */}
        <button
          className={`toolbar__btn toolbar__btn--icon ${devToolsOpen ? 'toolbar__btn--active' : ''}`}
          onClick={handleToggleDevTools}
          title={`${t('toolbar.devTools')} (F12)`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
