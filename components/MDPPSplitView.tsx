/**
 * MD++ Split View Component
 *
 * A combined editor and preview component with split view functionality.
 * Perfect for embedding a complete MD++ editing experience in any React application.
 *
 * @example
 * ```tsx
 * import { MDPPSplitView } from '@gorduan/mdplusplus/components';
 *
 * function MyApp() {
 *   const [content, setContent] = useState('# Hello MD++');
 *   return (
 *     <MDPPSplitView
 *       value={content}
 *       onChange={setContent}
 *       height="600px"
 *     />
 *   );
 * }
 * ```
 */

import React, { useState, useRef, useCallback } from 'react';
import { MDPPEditor, MDPPEditorRef } from './MDPPEditor';
import { MDPPPreview } from './MDPPPreview';
import type { PluginDefinition, RenderResult } from '../src/types';

export type ViewMode = 'split' | 'editor' | 'preview';

export interface MDPPSplitViewProps {
  /** The markdown content */
  value: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Initial view mode (default: 'split') */
  defaultViewMode?: ViewMode;
  /** Component height (default: '500px') */
  height?: string | number;
  /** Enable dark mode (default: true) */
  darkMode?: boolean;
  /** Show AI context blocks in preview (default: false) */
  showAIContext?: boolean;
  /** Custom plugins for the preview */
  plugins?: PluginDefinition[];
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Show toolbar (default: true) */
  showToolbar?: boolean;
  /** Editor options */
  editorOptions?: {
    fontSize?: number;
    fontFamily?: string;
    lineNumbers?: boolean;
    wordWrap?: boolean;
    minimap?: boolean;
  };
  /** Callback when render completes */
  onRender?: (result: RenderResult) => void;
  /** Read-only mode */
  readOnly?: boolean;
}

export function MDPPSplitView({
  value,
  onChange,
  defaultViewMode = 'split',
  height = '500px',
  darkMode = true,
  showAIContext = false,
  plugins = [],
  className,
  style,
  showToolbar = true,
  editorOptions = {},
  onRender,
  readOnly = false,
}: MDPPSplitViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [aiContextVisible, setAiContextVisible] = useState(showAIContext);
  const editorRef = useRef<MDPPEditorRef>(null);

  const handleChange = useCallback((newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  const toolbarHeight = showToolbar ? 36 : 0;
  const contentHeight = `calc(${containerHeight} - ${toolbarHeight}px)`;

  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${darkMode ? '#3c3c3c' : '#e1e4e8'}`,
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
    ...style,
  };

  const toolbarStyle: React.CSSProperties = {
    height: `${toolbarHeight}px`,
    backgroundColor: darkMode ? '#252526' : '#f6f8fa',
    borderBottom: `1px solid ${darkMode ? '#3c3c3c' : '#e1e4e8'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: active ? (darkMode ? '#0e639c' : '#0366d6') : 'transparent',
    color: active ? 'white' : (darkMode ? '#cccccc' : '#24292e'),
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'background-color 0.15s, color 0.15s',
  });

  const contentStyle: React.CSSProperties = {
    height: contentHeight,
    display: 'flex',
    overflow: 'hidden',
  };

  const paneStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'hidden',
    minWidth: 0,
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    backgroundColor: darkMode ? '#3c3c3c' : '#e1e4e8',
  };

  return (
    <div className={`mdpp-split-view ${className || ''}`} style={containerStyle}>
      {showToolbar && (
        <div className="mdpp-split-view-toolbar" style={toolbarStyle}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              style={buttonStyle(viewMode === 'editor')}
              onClick={() => setViewMode('editor')}
              title="Editor only"
            >
              Editor
            </button>
            <button
              style={buttonStyle(viewMode === 'split')}
              onClick={() => setViewMode('split')}
              title="Split view"
            >
              Split
            </button>
            <button
              style={buttonStyle(viewMode === 'preview')}
              onClick={() => setViewMode('preview')}
              title="Preview only"
            >
              Preview
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              style={buttonStyle(aiContextVisible)}
              onClick={() => setAiContextVisible(!aiContextVisible)}
              title="Toggle AI context visibility"
            >
              AI Context
            </button>
          </div>
        </div>
      )}

      <div className="mdpp-split-view-content" style={contentStyle}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div style={paneStyle}>
            <MDPPEditor
              ref={editorRef}
              value={value}
              onChange={handleChange}
              height="100%"
              darkMode={darkMode}
              readOnly={readOnly}
              {...editorOptions}
            />
          </div>
        )}

        {viewMode === 'split' && <div style={dividerStyle} />}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div style={paneStyle}>
            <MDPPPreview
              value={value}
              height="100%"
              darkMode={darkMode}
              showAIContext={aiContextVisible}
              plugins={plugins}
              onRender={onRender}
            />
          </div>
        )}
      </div>
    </div>
  );
}
