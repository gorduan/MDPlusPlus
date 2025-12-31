/**
 * MD++ Editor - Main Application Component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import SettingsDialog, { ParserSettings, DEFAULT_SETTINGS } from './components/SettingsDialog';
import type { ViewMode } from '../../electron/preload';

// Welcome content shown when app starts
const WELCOME_CONTENT = `# MD++ Syntax Reference

MD++ supports **GitHub Flavored Markdown** plus powerful extensions.

---

## Basic Formatting

| Syntax | Result |
|--------|--------|
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`~~strikethrough~~\` | ~~strikethrough~~ |
| \`\\\`code\\\`\` | \`code\` |

---

## Headings

\`\`\`markdown
# Heading 1
## Heading 2
### Heading 3
\`\`\`

All headings get automatic anchor links for navigation.

---

## Lists

### Unordered
- Item 1
- Item 2
  - Nested item

### Ordered
1. First
2. Second
3. Third

### Task Lists
- [x] Completed task
- [ ] Incomplete task

---

## Links & Images

\`\`\`markdown
[Link Text](https://example.com)
![Alt Text](image.png)
\`\`\`

**Autolinks:** URLs are automatically linked: https://github.com

---

## Tables

| Column A | Column B | Column C |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| Data     | Data     | Data     |

---

## Code Blocks

\`\`\`javascript
function hello() {
  console.log("Hello, MD++!");
}
\`\`\`

Supports syntax highlighting for all major languages.

---

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

---

## Callouts (GitHub/Obsidian Style)

> [!NOTE]
> This is a note callout.

> [!TIP]
> Helpful tips go here.

> [!WARNING]
> Important warnings.

> [!DANGER]
> Critical information!

---

## Math (LaTeX/KaTeX)

**Inline:** The formula $E = mc^2$ is famous.

**Display:**
$$
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

---

## Mermaid Diagrams

\`\`\`mermaid
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[OK]
    B -->|No| D[End]
\`\`\`

---

## Footnotes

Here is a footnote reference[^1].

[^1]: This is the footnote content.

---

## Component Directives (MD++ Extension)

\`\`\`markdown
:::bootstrap:alert{variant="info"}
Bootstrap alert component
:::

:::bootstrap:card
### Card Title
Card content here
:::
\`\`\`

---

## AI Context Blocks (MD++ Extension)

\`\`\`markdown
:::ai-context{visibility=visible}
Context visible to humans and AI.
:::

:::ai-context{visibility=hidden}
Context only visible to AI tools.
:::
\`\`\`

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New File | Ctrl+N |
| Open File | Ctrl+O |
| Save | Ctrl+S |
| Save As | Ctrl+Shift+S |
| Toggle Preview | Ctrl+Shift+P |
| Toggle AI Context | Ctrl+Shift+A |

---

*Open Settings (Ctrl+,) to configure plugins and features.*
`;

// Empty content for new files
const NEW_FILE_CONTENT = '';

// Available plugins list
const AVAILABLE_PLUGINS = ['bootstrap', 'admonitions', 'katex', 'mermaid'];

export default function App() {
  const [content, setContent] = useState(WELCOME_CONTENT);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [showAIContext, setShowAIContext] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ParserSettings>(DEFAULT_SETTINGS);
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

  // Keyboard shortcut for settings (Ctrl+,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showAIContext={showAIContext}
        onToggleAIContext={() => setShowAIContext(!showAIContext)}
        onOpenSettings={() => setSettingsOpen(true)}
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
            <Preview content={content} showAIContext={showAIContext} settings={settings} />
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
      <SettingsDialog
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        availablePlugins={AVAILABLE_PLUGINS}
      />
    </div>
  );
}
