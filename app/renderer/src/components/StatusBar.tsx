/**
 * MD++ Status Bar Component
 */

import React from 'react';
import type { ViewMode } from '../../../electron/preload';

interface StatusBarProps {
  line: number;
  column: number;
  filePath: string | null;
  isModified: boolean;
  viewMode: ViewMode;
}

export default function StatusBar({
  line,
  column,
  filePath,
  isModified,
  viewMode,
}: StatusBarProps) {
  const fileName = filePath ? filePath.split(/[\\/]/).pop() : 'Untitled';

  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item file-name">
          {isModified && <span className="modified-indicator">*</span>}
          {fileName}
        </span>
        {filePath && (
          <span className="status-item file-path" title={filePath}>
            {filePath}
          </span>
        )}
      </div>

      <div className="status-right">
        <span className="status-item view-mode">
          {viewMode === 'editor' && 'Editor'}
          {viewMode === 'preview' && 'Preview'}
          {viewMode === 'split' && 'Split View'}
        </span>
        <span className="status-item cursor-position">
          Ln {line}, Col {column}
        </span>
        <span className="status-item language">MD++</span>
      </div>
    </div>
  );
}
