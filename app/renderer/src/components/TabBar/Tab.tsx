/**
 * Tab Component
 * Individual tab in the TabBar
 */

import React, { useRef } from 'react';
import type { TabData } from './TabBar';

interface TabProps {
  tab: TabData;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export default function Tab({ tab, isActive, onSelect, onClose }: TabProps) {
  const tabRef = useRef<HTMLDivElement>(null);

  // Handle middle-click to close
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  // Get file icon based on extension
  const getFileIcon = () => {
    if (!tab.filePath) {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }

    const ext = tab.filePath.split('.').pop()?.toLowerCase();

    // Different colors for different file types
    if (ext === 'mdsc') {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f59e0b" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M10 12l2 2 4-4" />
        </svg>
      );
    }

    if (ext === 'mdpp' || ext === 'mdplus') {
      return (
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#8b5cf6" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      );
    }

    // Default markdown icon
    return (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  };

  return (
    <div
      ref={tabRef}
      data-tab-id={tab.id}
      className={`tab ${isActive ? 'tab--active' : ''} ${tab.isModified ? 'tab--modified' : ''}`}
      onClick={onSelect}
      onMouseDown={handleMouseDown}
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
    >
      <span className="tab__icon">
        {getFileIcon()}
      </span>
      <span className="tab__title" title={tab.filePath || 'Untitled'}>
        {tab.title}
      </span>
      {tab.isModified && (
        <span className="tab__modified-indicator" aria-label="Unsaved changes">
          ●
        </span>
      )}
      <button
        className="tab__close"
        onClick={handleCloseClick}
        title="Close (Ctrl+W)"
        aria-label={`Close ${tab.title}`}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
