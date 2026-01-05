/**
 * MD++ Sidebar Component
 * Modern collapsible sidebar with file actions and quick tools
 */

import React, { useState, useCallback } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  filePath: string | null;
  isModified: boolean;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onSaveAs: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onInsertTable: () => void;
  onInsert?: (text: string) => void;
  recentFiles?: string[];
  onOpenRecentFile?: (path: string) => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  filePath,
  isModified,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onSaveAs,
  onOpenSettings,
  onOpenHelp,
  onInsertTable,
  onInsert,
  recentFiles = [],
  onOpenRecentFile,
}: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('file');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'Untitled';
  const fileExt = fileName?.split('.').pop()?.toLowerCase() || 'md';

  // Detect file format
  const getFileFormatBadge = () => {
    switch (fileExt) {
      case 'mdsc':
        return { label: 'MDSC', color: 'var(--accent)', desc: 'MarkdownScript' };
      case 'mdplus':
      case 'mdpp':
        return { label: 'MD++', color: 'var(--color-info)', desc: 'MD++ Enhanced' };
      default:
        return { label: 'MD', color: 'var(--text-secondary)', desc: 'Markdown' };
    }
  };

  const formatBadge = getFileFormatBadge();

  return (
    <>
      {/* Sidebar Toggle Button (visible when collapsed) */}
      {!isOpen && (
        <button className="sidebar-toggle sidebar-toggle--collapsed" onClick={onToggle} title="Open Sidebar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Main Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <span className="sidebar__logo-icon">M++</span>
            <span className="sidebar__logo-text">MD++</span>
          </div>
          <button className="sidebar__close" onClick={onToggle} title="Close Sidebar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        {/* Current File Info */}
        <div className="sidebar__file-info">
          <div className="sidebar__file-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="sidebar__file-details">
            <span className="sidebar__file-name">
              {isModified && <span className="sidebar__modified-dot" />}
              {fileName}
            </span>
            <span
              className="sidebar__file-format"
              style={{ '--format-color': formatBadge.color } as React.CSSProperties}
              title={formatBadge.desc}
            >
              {formatBadge.label}
            </span>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="sidebar__content">
          {/* File Section */}
          <div className="sidebar__section">
            <button
              className={`sidebar__section-header ${expandedSection === 'file' ? 'expanded' : ''}`}
              onClick={() => toggleSection('file')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>File</span>
              <svg className="sidebar__section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSection === 'file' && (
              <div className="sidebar__section-content">
                <button className="sidebar__action" onClick={onNewFile}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <span>New File</span>
                  <kbd>Ctrl+N</kbd>
                </button>
                <button className="sidebar__action" onClick={onOpenFile}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Open...</span>
                  <kbd>Ctrl+O</kbd>
                </button>
                <button className="sidebar__action" onClick={onSaveFile}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Save</span>
                  <kbd>Ctrl+S</kbd>
                </button>
                <button className="sidebar__action" onClick={onSaveAs}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                    <path d="M12 11v6" />
                    <path d="M9 14l3 3 3-3" />
                  </svg>
                  <span>Save As...</span>
                  <kbd>Ctrl+Shift+S</kbd>
                </button>
              </div>
            )}
          </div>

          {/* Insert Section */}
          <div className="sidebar__section">
            <button
              className={`sidebar__section-header ${expandedSection === 'insert' ? 'expanded' : ''}`}
              onClick={() => toggleSection('insert')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Insert</span>
              <svg className="sidebar__section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expandedSection === 'insert' && (
              <div className="sidebar__section-content">
                <button className="sidebar__action" onClick={onInsertTable}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                    <line x1="15" y1="3" x2="15" y2="21" />
                  </svg>
                  <span>Table</span>
                </button>
                <button className="sidebar__action" onClick={() => onInsert?.('```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <span>Mermaid Diagram</span>
                </button>
                <button className="sidebar__action" onClick={() => onInsert?.('$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$\n')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4z" />
                    <path d="M17 14v8M14 17h6" />
                  </svg>
                  <span>Math Block</span>
                </button>
                <button className="sidebar__action" onClick={() => onInsert?.('```javascript\n// Your code here\n```\n')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <span>Code Block</span>
                </button>
                <button className="sidebar__action" onClick={() => onInsert?.(':::ai-context{visibility=visible}\nContext for AI here.\n:::\n')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>AI Context</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Files Section */}
          {recentFiles.length > 0 && (
            <div className="sidebar__section">
              <button
                className={`sidebar__section-header ${expandedSection === 'recent' ? 'expanded' : ''}`}
                onClick={() => toggleSection('recent')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Recent</span>
                <svg className="sidebar__section-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {expandedSection === 'recent' && (
                <div className="sidebar__section-content">
                  {recentFiles.slice(0, 5).map((file, index) => (
                    <button
                      key={index}
                      className="sidebar__action sidebar__action--file"
                      onClick={() => onOpenRecentFile?.(file)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="sidebar__file-name-truncate">{file.split(/[\\/]/).pop()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar__footer">
          <button className="sidebar__footer-action" onClick={onOpenSettings} title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button className="sidebar__footer-action" onClick={onOpenHelp} title="Help (F1)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar__backdrop" onClick={onToggle} />}
    </>
  );
}
