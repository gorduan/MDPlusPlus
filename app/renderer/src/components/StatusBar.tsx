/**
 * MD++ Status Bar Component
 * Enhanced status bar with file format, word count, and more
 */

import React, { useMemo } from 'react';
import type { ViewMode } from '../../../electron/preload';

type AutoSaveStatus = 'idle' | 'saving' | 'saved';

interface StatusBarProps {
  line: number;
  column: number;
  filePath: string | null;
  isModified: boolean;
  viewMode: ViewMode;
  content?: string;
  autoSaveStatus?: AutoSaveStatus;
}

export default function StatusBar({
  line,
  column,
  filePath,
  isModified,
  viewMode,
  content = '',
  autoSaveStatus = 'idle',
}: StatusBarProps) {
  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'Untitled';
  const fileExt = fileName?.split('.').pop()?.toLowerCase() || 'md';

  // Detect file format
  const fileFormat = useMemo(() => {
    switch (fileExt) {
      case 'mdsc':
        return { label: 'MarkdownScript', short: 'MDSC', color: 'accent' };
      case 'mdplus':
      case 'mdpp':
        return { label: 'MD++ Enhanced', short: 'MD++', color: 'info' };
      default:
        return { label: 'Markdown', short: 'MD', color: 'default' };
    }
  }, [fileExt]);

  // Calculate word and character count
  const stats = useMemo(() => {
    const text = content.trim();
    if (!text) return { words: 0, chars: 0, lines: 0 };

    const words = text.split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    const lines = text.split('\n').length;

    return { words, chars, lines };
  }, [content]);

  // Format numbers with K suffix for large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        {/* File Name with Modified Indicator */}
        <div className={`status-bar__item status-bar__file ${isModified ? 'status-bar__file--modified' : ''}`}>
          {isModified && (
            <span className="status-bar__modified-dot" title="Unsaved changes" />
          )}
          <span className="status-bar__filename" title={filePath || 'No file open'}>
            {fileName}
          </span>
        </div>

        {/* Auto-save Status */}
        {autoSaveStatus !== 'idle' && (
          <div className={`status-bar__item status-bar__autosave status-bar__autosave--${autoSaveStatus}`}>
            {autoSaveStatus === 'saving' && (
              <>
                <svg className="status-bar__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                <span>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Saved</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="status-bar__center">
        {/* View Mode */}
        <div className="status-bar__item status-bar__viewmode">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {viewMode === 'editor' && <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />}
            {viewMode === 'preview' && <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />}
            {viewMode === 'split' && <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="3" x2="12" y2="21" /></>}
          </svg>
          <span>
            {viewMode === 'editor' && 'Editor'}
            {viewMode === 'preview' && 'Preview'}
            {viewMode === 'split' && 'Split'}
          </span>
        </div>
      </div>

      <div className="status-bar__right">
        {/* Word Count */}
        <div className="status-bar__item status-bar__stats" title={`${stats.words} words, ${stats.chars} characters, ${stats.lines} lines`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h10M4 17h16" />
          </svg>
          <span>{formatNumber(stats.words)} words</span>
        </div>

        {/* Cursor Position */}
        <div className="status-bar__item status-bar__cursor">
          <span>Ln {line}</span>
          <span className="status-bar__separator">:</span>
          <span>Col {column}</span>
        </div>

        {/* File Format */}
        <div
          className={`status-bar__item status-bar__format status-bar__format--${fileFormat.color}`}
          title={fileFormat.label}
        >
          {fileFormat.short}
        </div>
      </div>
    </div>
  );
}
