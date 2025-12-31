/**
 * MD++ Editor - Main Application Component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import type { ViewMode } from '../../electron/preload';

// Welcome content shown when app starts
const WELCOME_CONTENT = `# Welcome to MD++

MD++ is an extended Markdown editor with support for standard Markdown and additional features.

## Quick Start

This is **bold** and *italic* text.

### Lists

- Item 1
- Item 2
- Item 3

### Code

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Links and Images

[Visit GitHub](https://github.com)

> This is a blockquote

## Features

- Real-time preview
- Monaco Editor with syntax highlighting
- File operations (New, Open, Save, Export)
- Multiple view modes (Editor, Preview, Split)
`;

// Empty content for new files
const NEW_FILE_CONTENT = '';

export default function App() {
  const [content, setContent] = useState(WELCOME_CONTENT);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [showAIContext, setShowAIContext] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const editorRef = useRef<{ insert: (text: string) => void; insertWrap: (wrapper: string) => void } | null>(null);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (!isModified) {
      setIsModified(true);
      window.electronAPI?.setModified(true);
    }
  }, [isModified]);

  // Set up electron IPC handlers
  useEffect(() => {
    if (!window.electronAPI) return;

    // Handle content requests from main process
    const unsubGetContent = window.electronAPI.onGetContent(() => {
      window.electronAPI.sendContent(content);
    });

    // Handle new file
    const unsubNew = window.electronAPI.onFileNew(() => {
      setContent(NEW_FILE_CONTENT);
      setFilePath(null);
      setIsModified(false);
      window.electronAPI.setModified(false);
    });

    // Handle file opened
    const unsubOpened = window.electronAPI.onFileOpened((data) => {
      setContent(data.content);
      setFilePath(data.path);
      setIsModified(false);
      window.electronAPI.setModified(false);
    });

    // Handle file saved
    const unsubSaved = window.electronAPI.onFileSaved((path) => {
      setFilePath(path);
      setIsModified(false);
      window.electronAPI.setModified(false);
    });

    // Handle view mode changes
    const unsubViewMode = window.electronAPI.onViewMode((mode) => {
      setViewMode(mode);
    });

    // Handle menu actions
    const unsubMenuAction = window.electronAPI.onMenuAction((action) => {
      if (action === 'toggle-ai-context') {
        setShowAIContext((prev) => !prev);
      }
    });

    // Handle insert actions
    const unsubInsert = window.electronAPI.onInsert((text) => {
      editorRef.current?.insert(text);
    });

    const unsubInsertWrap = window.electronAPI.onInsertWrap((wrapper) => {
      editorRef.current?.insertWrap(wrapper);
    });

    // Handle exports
    const unsubExportHTML = window.electronAPI.onExportHTML(async (exportPath) => {
      // Create full HTML document
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filePath?.split(/[\\/]/).pop() || 'MD++ Export'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    pre {
      background: #f4f4f4;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 0.2rem 0.4rem;
      border-radius: 2px;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 1rem;
      color: #666;
    }
  </style>
</head>
<body>
  ${document.querySelector('.preview-content')?.innerHTML || ''}
</body>
</html>`;
      await window.electronAPI.writeFile(exportPath, htmlContent);
    });

    const unsubExportPDF = window.electronAPI.onExportPDF(async (_exportPath) => {
      // PDF export would require additional libraries
      // For now, show a message
      console.log('PDF export not yet implemented');
    });

    return () => {
      unsubGetContent();
      unsubNew();
      unsubOpened();
      unsubSaved();
      unsubViewMode();
      unsubMenuAction();
      unsubInsert();
      unsubInsertWrap();
      unsubExportHTML();
      unsubExportPDF();
    };
  }, [content, filePath]);

  // Update modified state reference
  useEffect(() => {
    window.electronAPI?.setModified(isModified);
  }, [isModified]);

  return (
    <div className="app">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showAIContext={showAIContext}
        onToggleAIContext={() => setShowAIContext(!showAIContext)}
      />
      <div className={`main-content view-${viewMode}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-pane">
            <Editor
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              onCursorChange={setCursorPosition}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <Preview content={content} showAIContext={showAIContext} />
          </div>
        )}
      </div>
      <StatusBar
        line={cursorPosition.line}
        column={cursorPosition.column}
        filePath={filePath}
        isModified={isModified}
        viewMode={viewMode}
      />
    </div>
  );
}
