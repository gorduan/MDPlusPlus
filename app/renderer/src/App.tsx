/**
 * MD++ Editor - Main Application Component
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import EditorPane, { EditorPaneRef } from './components/EditorPane';
import Preview from './components/Preview';
import Toolbar, { Theme } from './components/Toolbar';
import StatusBar from './components/StatusBar';
import SettingsDialog, { ParserSettings, DEFAULT_SETTINGS } from './components/SettingsDialog';
import SearchReplace from './components/SearchReplace';
import HelpDialog from './components/HelpDialog';
import TableEditor from './components/TableEditor';
import type { ViewMode } from '../../electron/preload';

// Welcome content shown when app starts
const WELCOME_CONTENT = `# Willkommen bei MD++

**MD++ (Markdown Plus Plus)** ist ein erweiterter Markdown-Editor mit Live-Vorschau.

| Feature | Beschreibung |
|---------|--------------|
| **AI Context Blocks** | Kontextinformationen für KI-Assistenten einbetten |
| **Component Directives** | Framework-unabhängige UI-Komponenten |
| **Plugin-System** | Erweiterbar durch Bootstrap, Admonitions, etc. |
| **Live-Vorschau** | Änderungen sofort sehen |

> **Tipp:** Einstellungen öffnen mit \`Ctrl+,\` · Neue Datei mit \`Ctrl+N\`

---

# Kern-Markdown
*Immer verfügbar*

---

## Fett & Kursiv

**Syntax:**
\`\`\`markdown
**fetter Text**
*kursiver Text*
***fett und kursiv***
\`\`\`

**Ausgabe:**

**fetter Text**

*kursiver Text*

***fett und kursiv***

---

## Inline-Code

**Syntax:**
\`\`\`markdown
Nutze \\\`console.log()\\\` zum Debuggen.
\`\`\`

**Ausgabe:**

Nutze \`console.log()\` zum Debuggen.

---

## Überschriften

**Syntax:**
\`\`\`markdown
# Überschrift 1
## Überschrift 2
### Überschrift 3
\`\`\`

**Ausgabe:**

### Überschrift 3 (Beispiel)

---

## Listen

**Syntax:**
\`\`\`markdown
- Punkt A
- Punkt B
  - Verschachtelt

1. Erster
2. Zweiter
\`\`\`

**Ausgabe:**

- Punkt A
- Punkt B
  - Verschachtelt

1. Erster
2. Zweiter

---

## Links

**Syntax:**
\`\`\`markdown
[GitHub](https://github.com)
\`\`\`

**Ausgabe:**

[GitHub](https://github.com)

---

## Blockquotes

**Syntax:**
\`\`\`markdown
> Dies ist ein Zitat.
> Über mehrere Zeilen.
\`\`\`

**Ausgabe:**

> Dies ist ein Zitat.
> Über mehrere Zeilen.

---

## Code-Blöcke

**Syntax:**
\`\`\`\`markdown
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`
\`\`\`\`

**Ausgabe:**

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

---

# GitHub Flavored Markdown
*Feature: \`enableGfm\` · Standard: Aktiv*

---

## Tabellen
*Feature: \`enableTables\`*

**Syntax:**
\`\`\`markdown
| Links | Zentriert | Rechts |
|:------|:---------:|-------:|
| A     | B         | C      |
\`\`\`

**Ausgabe:**

| Links | Zentriert | Rechts |
|:------|:---------:|-------:|
| A     | B         | C      |

---

## Task-Listen
*Feature: \`enableTaskLists\`*

**Syntax:**
\`\`\`markdown
- [x] Erledigt
- [ ] Offen
\`\`\`

**Ausgabe:**

- [x] Erledigt
- [ ] Offen

---

## Durchstreichen
*Feature: \`enableStrikethrough\`*

**Syntax:**
\`\`\`markdown
~~durchgestrichen~~
\`\`\`

**Ausgabe:**

~~durchgestrichen~~

---

## Fußnoten
*Feature: \`enableFootnotes\`*

**Syntax:**
\`\`\`markdown
Text mit Fußnote[^1].

[^1]: Fußnoteninhalt hier.
\`\`\`

**Ausgabe:**

Text mit Fußnote[^1].

[^1]: Fußnoteninhalt hier.

---

# Erweiterungen
*Standard: Aktiv*

---

## Mathematische Formeln
*Feature: \`enableMath\`*

**Syntax (Inline):**
\`\`\`markdown
Die Formel $E = mc^2$ ist berühmt.
\`\`\`

**Ausgabe:**

Die Formel $E = mc^2$ ist berühmt.

**Syntax (Block):**
\`\`\`markdown
$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$
\`\`\`

**Ausgabe:**

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

---

## Callouts / Hinweisboxen
*Feature: \`enableCallouts\`*

**Syntax:**
\`\`\`markdown
> [!NOTE]
> Eine Notiz.

> [!TIP]
> Ein Tipp.

> [!WARNING]
> Eine Warnung.

> [!DANGER]
> Gefahr!
\`\`\`

**Ausgabe:**

> [!NOTE]
> Eine Notiz.

> [!TIP]
> Ein Tipp.

> [!WARNING]
> Eine Warnung.

> [!DANGER]
> Gefahr!

---

## Mermaid-Diagramme
*Feature: \`enableMermaid\`*

**Syntax:**
\`\`\`\`markdown
\`\`\`mermaid
graph LR
    A[Start] --> B{Frage}
    B -->|Ja| C[Aktion]
    B -->|Nein| D[Ende]
\`\`\`
\`\`\`\`

**Ausgabe:**

\`\`\`mermaid
graph LR
    A[Start] --> B{Frage}
    B -->|Ja| C[Aktion]
    B -->|Nein| D[Ende]
\`\`\`

---

# MD++ Exklusiv

---

## AI Context Blocks
*Feature: \`enableAIContext\` · Standard: Aktiv*

Kontext für KI-Assistenten, optional versteckbar.

**Syntax (sichtbar):**
\`\`\`markdown
:::ai-context{visibility=visible}
Dieser Kontext ist für Menschen und KI sichtbar.
:::
\`\`\`

**Ausgabe:**

:::ai-context{visibility=visible}
Dieser Kontext ist für Menschen und KI sichtbar.
:::

**Syntax (versteckt):**
\`\`\`markdown
:::ai-context{visibility=hidden}
Nur für KI sichtbar. Toggle mit Ctrl+Shift+A.
:::
\`\`\`

**Ausgabe:** *(Versteckt - aktiviere mit Ctrl+Shift+A)*

:::ai-context{visibility=hidden}
Nur für KI sichtbar. Du siehst dies, weil AI-Context aktiv ist.
:::

---

## Component Directives
*Feature: \`enableDirectives\` · Standard: Aktiv*

UI-Komponenten aus Plugins verwenden.

**Syntax:**
\`\`\`markdown
:::plugin:component{attribut="wert"}
Inhalt hier
:::
\`\`\`

---

# Plugin: Bootstrap
*Plugin: \`bootstrap\` · Standard: Aktiv*

---

## Alert

**Syntax:**
\`\`\`markdown
:::bootstrap:alert{variant="info"}
Info-Nachricht
:::
\`\`\`

**Ausgabe:**

:::bootstrap:alert{variant="info"}
Info-Nachricht
:::

**Varianten:** \`primary\`, \`secondary\`, \`success\`, \`danger\`, \`warning\`, \`info\`

:::bootstrap:alert{variant="success"}
Erfolg!
:::

:::bootstrap:alert{variant="warning"}
Warnung!
:::

:::bootstrap:alert{variant="danger"}
Fehler!
:::

---

## Card

**Syntax:**
\`\`\`markdown
:::bootstrap:card
### Titel
Inhalt mit **Markdown**.
:::
\`\`\`

**Ausgabe:**

:::bootstrap:card
### Karten-Titel
Inhalt mit **Markdown** und Listen:
- Punkt 1
- Punkt 2
:::

---

# Plugin: Admonitions
*Plugin: \`admonitions\` · Standard: Aktiv*

---

## Note

**Syntax:**
\`\`\`markdown
:::admonition{type="note" title="Hinweis"}
Inhalt der Notiz.
:::
\`\`\`

**Ausgabe:**

:::admonition{type="note" title="Hinweis"}
Inhalt der Notiz.
:::

---

## Tip

**Syntax:**
\`\`\`markdown
:::admonition{type="tip" title="Tipp"}
Best Practice hier.
:::
\`\`\`

**Ausgabe:**

:::admonition{type="tip" title="Tipp"}
Best Practice hier.
:::

---

## Warning

**Syntax:**
\`\`\`markdown
:::admonition{type="warning" title="Achtung"}
Wichtige Warnung.
:::
\`\`\`

**Ausgabe:**

:::admonition{type="warning" title="Achtung"}
Wichtige Warnung.
:::

---

## Danger

**Syntax:**
\`\`\`markdown
:::admonition{type="danger" title="Gefahr"}
Kritischer Hinweis!
:::
\`\`\`

**Ausgabe:**

:::admonition{type="danger" title="Gefahr"}
Kritischer Hinweis!
:::

---

# Optionale Plugins
*In Einstellungen (Ctrl+,) aktivieren*

| Plugin | Beschreibung |
|--------|--------------|
| \`katex\` | Erweitertes LaTeX-Rendering |
| \`mermaid\` | Zusätzliche Diagramm-Typen |

---

# Tastenkürzel

| Aktion | Kürzel |
|--------|--------|
| Neue Datei | Ctrl+N |
| Öffnen | Ctrl+O |
| Speichern | Ctrl+S |
| Speichern unter | Ctrl+Shift+S |
| Einstellungen | Ctrl+, |
| AI-Kontext Toggle | Ctrl+Shift+A |
| Nur Editor | Ctrl+1 |
| Nur Vorschau | Ctrl+2 |
| Split-Ansicht | Ctrl+3 |
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
  const [theme, setTheme] = useState<Theme>('dark');
  const editorRef = useRef<EditorPaneRef | null>(null);

  // New feature states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<'find' | 'replace'>('find');
  const [helpOpen, setHelpOpen] = useState(false);
  const [tableEditorOpen, setTableEditorOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (isModified && filePath) {
      // Clear any existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set up auto-save after 3 seconds of inactivity
      autoSaveTimeoutRef.current = setTimeout(async () => {
        setAutoSaveStatus('saving');
        try {
          await window.electronAPI?.writeFile(filePath, content);
          setIsModified(false);
          window.electronAPI?.setModified(false);
          setAutoSaveStatus('saved');
          // Reset status after 2 seconds
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('Auto-save failed:', error);
          setAutoSaveStatus('idle');
        }
      }, 3000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, isModified, filePath]);

  // Drag & drop handlers
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if leaving the window
      if (e.relatedTarget === null) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.name.match(/\.(md|mdpp|markdown|txt)$/i)) {
          // The main process will handle opening via will-navigate
          // We just need to allow the default behavior
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

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
      } else if (action === 'find') {
        setSearchMode('find');
        setSearchOpen(true);
      } else if (action === 'replace') {
        setSearchMode('replace');
        setSearchOpen(true);
      } else if (action === 'insert-table') {
        setTableEditorOpen(true);
      } else if (action === 'show-help') {
        setHelpOpen(true);
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
    const unsubExportHTML = window.electronAPI.onExportHTML(async ({ filePath: exportPath, theme: exportTheme }) => {
      // Use the theme selected by user in the dialog
      const isDark = exportTheme === 'dark';

      // MD++ Export CSS - Theme-aware
      const exportCSS = `
/* MD++ Export Styles - ${isDark ? 'Dark' : 'Light'} Theme */
:root {
  ${isDark ? `
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-card: #334155;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --accent: #7C3AED;
  --accent-hover: #6D28D9;
  --accent-light: #A78BFA;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --border: #475569;
  --code-bg: #1E293B;
  --code-text: #E2E8F0;
  --inline-code-bg: #334155;
  --inline-code-text: #A78BFA;
  ` : `
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --bg-card: #F1F5F9;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --accent: #7C3AED;
  --accent-hover: #6D28D9;
  --accent-light: #6D28D9;
  --success: #059669;
  --warning: #D97706;
  --error: #DC2626;
  --border: #E2E8F0;
  --code-bg: #F8FAFC;
  --code-text: #1E293B;
  --inline-code-bg: #F1F5F9;
  --inline-code-text: #6D28D9;
  `}
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.7;
}

/* Headings */
h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--accent);
  color: var(--text-primary);
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
}

h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--accent-light);
}

h4, h5, h6 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

p {
  margin: 0.75rem 0;
}

/* Links */
a {
  color: var(--accent-light);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}

a:hover {
  border-bottom-color: var(--accent-light);
}

strong {
  font-weight: 600;
  color: var(--text-primary);
}

em {
  font-style: italic;
  color: var(--text-secondary);
}

/* Lists */
ul, ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

li {
  margin-bottom: 0.375rem;
}

li::marker {
  color: var(--accent);
}

/* Code */
code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  background-color: var(--inline-code-bg);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  color: var(--inline-code-text);
}

pre {
  background-color: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--code-text);
}

/* Blockquotes */
blockquote {
  border-left: 4px solid var(--accent);
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 0 0.5rem 0.5rem 0;
  color: var(--text-secondary);
}

blockquote p {
  margin: 0;
}

/* Horizontal Rule */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

th, td {
  border: 1px solid var(--border);
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: var(--bg-secondary);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: rgba(51, 65, 85, 0.3);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

/* AI Context Blocks */
.mdpp-ai-context {
  background-color: rgba(124, 58, 237, 0.15);
  border: 2px dashed var(--accent);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
  position: relative;
}

.mdpp-ai-context::before {
  content: 'AI Context';
  position: absolute;
  top: -0.75rem;
  left: 1rem;
  background-color: var(--bg-primary);
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
}

/* Card & Alert Components */
[class*="card"] {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin: 1rem 0;
}

[class*="alert"] {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-left: 4px solid #3B82F6;
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 1rem;
  margin: 1rem 0;
  color: #93C5FD;
}

[class*="alert-success"], .alert-success {
  border-left-color: var(--success);
  background-color: rgba(16, 185, 129, 0.1);
  color: #6EE7B7;
}

[class*="alert-warning"], .alert-warning {
  border-left-color: var(--warning);
  background-color: rgba(245, 158, 11, 0.1);
  color: #FCD34D;
}

[class*="alert-danger"], .alert-danger, [class*="alert-error"], .alert-error {
  border-left-color: var(--error);
  background-color: rgba(239, 68, 68, 0.1);
  color: #FCA5A5;
}

/* Callout Styles (GitHub/Obsidian) */
.callout, .admonition {
  padding: 1rem;
  margin: 1rem 0;
  border-left: 4px solid;
  border-radius: 0 0.5rem 0.5rem 0;
  background-color: rgba(51, 65, 85, 0.5);
}

.callout-note, .admonition-note {
  border-color: #3B82F6;
  background-color: rgba(59, 130, 246, 0.1);
}

.callout-tip, .admonition-tip, .callout-hint, .admonition-hint {
  border-color: #10B981;
  background-color: rgba(16, 185, 129, 0.1);
}

.callout-warning, .admonition-warning, .callout-caution, .admonition-caution {
  border-color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.callout-danger, .admonition-danger, .callout-error, .admonition-error {
  border-color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.callout-important, .admonition-important {
  border-color: #8B5CF6;
  background-color: rgba(139, 92, 246, 0.1);
}

.callout-title, .admonition-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Math Styles */
.math {
  font-family: 'KaTeX_Math', 'Times New Roman', serif;
}

.math-display {
  display: block;
  text-align: center;
  margin: 1rem 0;
  overflow-x: auto;
}

.math-inline {
  display: inline;
}

/* Mermaid Diagrams */
.mermaid {
  background-color: var(--bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem 0;
  text-align: center;
}

/* Task List Checkboxes */
input[type="checkbox"] {
  margin-right: 0.5rem;
  accent-color: var(--accent);
}

/* Strikethrough */
del {
  color: var(--text-secondary);
  text-decoration: line-through;
}

/* Footnotes */
.footnotes {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footnote-ref {
  color: var(--accent);
  text-decoration: none;
  vertical-align: super;
  font-size: 0.75em;
}

.footnote-backref {
  color: var(--accent-light);
  text-decoration: none;
  margin-left: 0.25rem;
}

/* Selection */
::selection {
  background-color: var(--accent);
  color: white;
}
`;

      // Create full HTML document with Mermaid support
      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filePath?.split(/[\\/]/).pop() || 'MD++ Export'}</title>
  <style>${exportCSS}</style>
  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/${isDark ? 'atom-one-dark' : 'atom-one-light'}.min.css">
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11/lib/common.min.js"></script>
</head>
<body>
${document.querySelector('.preview-content')?.innerHTML || ''}
<script>
  // Initialize Mermaid with ${isDark ? 'dark' : 'default'} theme
  mermaid.initialize({
    startOnLoad: false,
    theme: '${isDark ? 'dark' : 'default'}',
    securityLevel: 'loose'
  });

  // Re-render Mermaid diagrams and KaTeX math
  document.addEventListener('DOMContentLoaded', async () => {
    // Mermaid diagrams
    const mermaidElements = document.querySelectorAll('.mermaid');
    if (mermaidElements.length > 0) {
      mermaidElements.forEach((el, index) => {
        el.removeAttribute('data-processed');
        el.id = 'mermaid-export-' + index;
      });
      await mermaid.run({ nodes: mermaidElements });
    }

    // KaTeX math
    const mathElements = document.querySelectorAll('.math');
    mathElements.forEach((el) => {
      const isDisplay = el.classList.contains('math-display');
      const mathContent = el.textContent || '';
      if (!el.querySelector('.katex')) {
        try {
          katex.render(mathContent, el, {
            displayMode: isDisplay,
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX error:', e);
        }
      }
    });

    // Syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('hljs') && !block.closest('.mermaid')) {
        hljs.highlightElement(block);
      }
    });
  });
</script>
</body>
</html>`;
      await window.electronAPI.writeFile(exportPath, htmlContent);
    });

    const unsubExportPDF = window.electronAPI.onExportPDF(async ({ filePath: exportPath, theme: exportTheme }) => {
      // Use the theme selected by user in the dialog
      const isDark = exportTheme === 'dark';

      // PDF Export CSS - Theme-aware (similar to HTML but optimized for print)
      const exportCSS = `
/* MD++ PDF Export Styles - ${isDark ? 'Dark' : 'Light'} Theme */
:root {
  ${isDark ? `
  --bg-primary: #0F172A;
  --bg-secondary: #1E293B;
  --bg-card: #334155;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --accent: #7C3AED;
  --accent-hover: #6D28D9;
  --accent-light: #A78BFA;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --border: #475569;
  --code-bg: #1E293B;
  --code-text: #E2E8F0;
  --inline-code-bg: #334155;
  --inline-code-text: #A78BFA;
  ` : `
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --bg-card: #F1F5F9;
  --text-primary: #1E293B;
  --text-secondary: #64748B;
  --accent: #7C3AED;
  --accent-hover: #6D28D9;
  --accent-light: #6D28D9;
  --success: #059669;
  --warning: #D97706;
  --error: #DC2626;
  --border: #E2E8F0;
  --code-bg: #F8FAFC;
  --code-text: #1E293B;
  --inline-code-bg: #F1F5F9;
  --inline-code-text: #6D28D9;
  `}
}

@media print {
  @page {
    margin: 1.5cm;
  }
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  max-width: 100%;
  padding: 0;
  line-height: 1.7;
  font-size: 11pt;
}

/* Headings */
h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.75rem;
  padding-bottom: 0.375rem;
  border-bottom: 2px solid var(--accent);
  color: var(--text-primary);
  page-break-after: avoid;
}

h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  page-break-after: avoid;
}

h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.375rem;
  color: var(--accent-light);
  page-break-after: avoid;
}

h4, h5, h6 {
  margin-top: 0.75rem;
  margin-bottom: 0.375rem;
  color: var(--text-primary);
  page-break-after: avoid;
}

p {
  margin: 0.5rem 0;
}

/* Links */
a {
  color: var(--accent-light);
  text-decoration: none;
}

strong {
  font-weight: 600;
  color: var(--text-primary);
}

em {
  font-style: italic;
  color: var(--text-secondary);
}

/* Lists */
ul, ol {
  margin: 0.5rem 0;
  padding-left: 1.25rem;
}

li {
  margin-bottom: 0.25rem;
}

li::marker {
  color: var(--accent);
}

/* Code */
code {
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  background-color: var(--inline-code-bg);
  padding: 0.1rem 0.3rem;
  border-radius: 0.2rem;
  font-size: 0.85em;
  color: var(--inline-code-text);
}

pre {
  background-color: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  overflow-x: auto;
  margin: 0.75rem 0;
  page-break-inside: avoid;
}

pre code {
  background: none;
  padding: 0;
  font-size: 0.8rem;
  color: var(--code-text);
}

/* Blockquotes */
blockquote {
  border-left: 3px solid var(--accent);
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem;
  background-color: rgba(124, 58, 237, 0.1);
  border-radius: 0 0.375rem 0.375rem 0;
  color: var(--text-secondary);
  page-break-inside: avoid;
}

blockquote p {
  margin: 0;
}

/* Horizontal Rule */
hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5rem 0;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.9em;
  page-break-inside: avoid;
}

th, td {
  border: 1px solid var(--border);
  padding: 0.5rem;
  text-align: left;
}

th {
  background-color: var(--bg-secondary);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: rgba(51, 65, 85, 0.2);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: 0.375rem;
  margin: 0.75rem 0;
}

/* AI Context Blocks */
.mdpp-ai-context {
  background-color: rgba(124, 58, 237, 0.15);
  border: 2px dashed var(--accent);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.75rem 0;
  position: relative;
  page-break-inside: avoid;
}

.mdpp-ai-context::before {
  content: 'AI Context';
  position: absolute;
  top: -0.625rem;
  left: 0.75rem;
  background-color: var(--bg-primary);
  padding: 0 0.375rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--accent);
}

/* Card & Alert Components */
[class*="card"] {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin: 0.75rem 0;
  page-break-inside: avoid;
}

[class*="alert"] {
  background-color: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-left: 3px solid #3B82F6;
  border-radius: 0 0.375rem 0.375rem 0;
  padding: 0.75rem;
  margin: 0.75rem 0;
  color: #93C5FD;
  page-break-inside: avoid;
}

[class*="alert-success"], .alert-success {
  border-left-color: var(--success);
  background-color: rgba(16, 185, 129, 0.1);
  color: #6EE7B7;
}

[class*="alert-warning"], .alert-warning {
  border-left-color: var(--warning);
  background-color: rgba(245, 158, 11, 0.1);
  color: #FCD34D;
}

[class*="alert-danger"], .alert-danger, [class*="alert-error"], .alert-error {
  border-left-color: var(--error);
  background-color: rgba(239, 68, 68, 0.1);
  color: #FCA5A5;
}

/* Callout Styles */
.callout, .admonition {
  padding: 0.75rem;
  margin: 0.75rem 0;
  border-left: 3px solid;
  border-radius: 0 0.375rem 0.375rem 0;
  background-color: rgba(51, 65, 85, 0.3);
  page-break-inside: avoid;
}

.callout-note, .admonition-note {
  border-color: #3B82F6;
  background-color: rgba(59, 130, 246, 0.1);
}

.callout-tip, .admonition-tip {
  border-color: #10B981;
  background-color: rgba(16, 185, 129, 0.1);
}

.callout-warning, .admonition-warning {
  border-color: #F59E0B;
  background-color: rgba(245, 158, 11, 0.1);
}

.callout-danger, .admonition-danger {
  border-color: #EF4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.callout-title, .admonition-title {
  font-weight: 600;
  margin-bottom: 0.375rem;
}

/* Math Styles */
.math {
  font-family: 'KaTeX_Math', 'Times New Roman', serif;
}

.math-display {
  display: block;
  text-align: center;
  margin: 0.75rem 0;
  overflow-x: auto;
}

/* Mermaid Diagrams - hide in PDF, show placeholder */
.mermaid {
  background-color: var(--bg-secondary);
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin: 0.75rem 0;
  text-align: center;
  page-break-inside: avoid;
}

/* Task List Checkboxes */
input[type="checkbox"] {
  margin-right: 0.375rem;
  accent-color: var(--accent);
}

/* Strikethrough */
del {
  color: var(--text-secondary);
  text-decoration: line-through;
}

/* Footnotes */
.footnotes {
  margin-top: 1.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
  font-size: 0.8rem;
  color: var(--text-secondary);
}
`;

      // Create full HTML document for PDF
      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>${filePath?.split(/[\\/]/).pop() || 'MD++ Export'}</title>
  <style>${exportCSS}</style>
  <!-- Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <!-- Highlight.js for syntax highlighting -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/${isDark ? 'atom-one-dark' : 'atom-one-light'}.min.css">
  <script src="https://cdn.jsdelivr.net/npm/highlight.js@11/lib/common.min.js"></script>
</head>
<body>
${document.querySelector('.preview-content')?.innerHTML || ''}
<script>
  // Signal when all rendering is complete
  window.renderingComplete = false;

  async function renderAll() {
    // Initialize Mermaid with correct theme
    mermaid.initialize({
      startOnLoad: false,
      theme: '${isDark ? 'dark' : 'default'}',
      securityLevel: 'loose'
    });

    // Render Mermaid diagrams
    const mermaidElements = document.querySelectorAll('.mermaid');
    if (mermaidElements.length > 0) {
      // Restore original code from data-original attribute if present
      mermaidElements.forEach((el, index) => {
        const originalCode = el.getAttribute('data-original');
        if (originalCode) {
          el.textContent = originalCode;
        }
        el.removeAttribute('data-processed');
        el.id = 'mermaid-pdf-' + index;
      });

      try {
        await mermaid.run({ nodes: mermaidElements });
      } catch (e) {
        console.warn('Mermaid error:', e);
      }
    }

    // KaTeX math
    document.querySelectorAll('.math').forEach((el) => {
      const isDisplay = el.classList.contains('math-display');
      const mathContent = el.textContent || '';
      if (!el.querySelector('.katex')) {
        try {
          katex.render(mathContent, el, {
            displayMode: isDisplay,
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX error:', e);
        }
      }
    });

    // Syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
      if (!block.classList.contains('hljs') && !block.closest('.mermaid')) {
        hljs.highlightElement(block);
      }
    });

    // Mark rendering as complete
    window.renderingComplete = true;
  }

  document.addEventListener('DOMContentLoaded', renderAll);
</script>
</body>
</html>`;

      // Send to main process for PDF generation
      const result = await window.electronAPI.printToPDF(htmlContent, exportPath);
      if (!result.success) {
        console.error('PDF export failed:', result.error);
      }
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
  }, [content, filePath, theme]);

  // Update modified state reference
  useEffect(() => {
    window.electronAPI?.setModified(isModified);
  }, [isModified]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Settings: Ctrl+,
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      }
      // Help: F1
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(true);
      }
      // Find: Ctrl+F
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setSearchMode('find');
        setSearchOpen(true);
      }
      // Replace: Ctrl+H
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setSearchMode('replace');
        setSearchOpen(true);
      }
      // Close search: Escape
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <div className="app">
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showAIContext={showAIContext}
        onToggleAIContext={() => setShowAIContext(!showAIContext)}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <div className={`main-content view-${viewMode}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="editor-pane">
            <EditorPane
              ref={editorRef}
              content={content}
              onChange={handleContentChange}
              onCursorChange={setCursorPosition}
              theme={theme}
            />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <Preview content={content} showAIContext={showAIContext} settings={settings} theme={theme} />
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
      <SearchReplace
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        content={content}
        onReplace={setContent}
        mode={searchMode}
      />
      <HelpDialog
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <TableEditor
        isOpen={tableEditorOpen}
        onClose={() => setTableEditorOpen(false)}
        onInsert={(markdown) => {
          editorRef.current?.insert('\n' + markdown + '\n');
        }}
      />
      {isDragging && (
        <div className="drop-overlay">
          <div className="drop-overlay-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Datei hier ablegen</p>
          </div>
        </div>
      )}
    </div>
  );
}
