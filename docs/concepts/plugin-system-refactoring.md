# MD++ Plugin-System Refactoring - Konzeptdokument

> **Status**: Phase 6 in Planung (True Plugin Isolation)
> **Erstellt**: 2025-01-07
> **Aktualisiert**: 2025-01-07
> **Zweck**: Vollständig modulares Plugin-System - Plugins können ohne Code-Änderungen hinzugefügt/entfernt werden

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [IST-Zustand Analyse](#2-ist-zustand-analyse)
3. [SOLL-Zustand: True Plugin Isolation](#3-soll-zustand-true-plugin-isolation)
4. [Unified Plugin Folder Structure](#4-unified-plugin-folder-structure)
5. [Plugin Manifest Schema (Erweitert)](#5-plugin-manifest-schema-erweitert)
6. [Contribution Points System](#6-contribution-points-system)
7. [WYSIWYG Toolbar Extension System](#7-wysiwyg-toolbar-extension-system)
8. [Monaco Editor Language Extensions](#8-monaco-editor-language-extensions)
9. [Preview Rendering System](#9-preview-rendering-system)
10. [Export System Integration](#10-export-system-integration)
11. [Migration Plan Phase 6](#11-migration-plan-phase-6)
12. [Implementierungsstatus](#12-implementierungsstatus)
13. [Quellen & Referenzen](#13-quellen--referenzen)

---

## 1. Executive Summary

### Das Kernprinzip

**"Delete the plugin folder → Zero errors, zero orphaned code, zero broken features"**

Wenn ein Plugin-Ordner gelöscht wird:
- Keine Import-Fehler im MD++ Code
- Keine verwaisten Toolbar-Buttons
- Keine defekten Editor-Features
- Keine Rendering-Fehler in der Preview
- Keine kaputten Export-Funktionen

Wenn der Plugin-Ordner wieder hinzugefügt wird:
- Alle Features sind sofort wieder verfügbar
- Toolbar-Buttons erscheinen
- Editor-Highlighting funktioniert
- Preview rendert korrekt
- Export enthält benötigte Assets

### Was dieses Dokument definiert

| Bereich | Beschreibung |
|---------|--------------|
| **Plugin Folder Structure** | Einheitliche Ordnerstruktur für alle Plugins |
| **Contribution Points** | VS Code-inspiriertes Deklarationssystem |
| **Toolbar Extensions** | Dynamische WYSIWYG-Toolbar aus Plugin-Definitionen |
| **Language Extensions** | Monaco Editor Syntax Highlighting pro Plugin |
| **Preview Rendering** | Plugin-basiertes Post-Processing ohne Hardcoding |
| **Export Integration** | Dynamische Asset-Injection für HTML/PDF Export |

---

## 2. IST-Zustand Analyse

### 2.1 Hardcoded Dependencies (Kritisch)

Die folgende Analyse zeigt alle Stellen, die beim Entfernen eines Plugins zu Fehlern führen würden:

#### 2.1.1 Import Statements (Build-Breaker)

```typescript
// app/renderer/src/components/Preview.tsx - Lines 14-21
import mermaid from 'mermaid';           // ❌ Direkter Import
import katex from 'katex';               // ❌ Direkter Import
import 'katex/dist/katex.min.css';       // ❌ Direkter Import
import hljs from 'highlight.js';         // ❌ Direkter Import

import bootstrapPlugin from '../../../../plugins/bootstrap.json';    // ❌ Direkter Import
import admonitionsPlugin from '../../../../plugins/admonitions.json'; // ❌ Direkter Import
```

**Impact**: Build schlägt fehl wenn Datei nicht existiert.

#### 2.1.2 Hardcoded Toolbar Items (Runtime-Breaker)

```typescript
// app/renderer/src/wysiwyg/builtinToolbarItems.ts - Lines 237-392
{
  id: 'mermaid',                                    // ❌ Hardcoded
  action: (editor) => editor.chain().focus().setMermaid().run(),
},
{
  id: 'callout-note',                               // ❌ Hardcoded
  action: (editor) => editor.chain().focus().toggleAdmonition('note').run(),
},
// ... 6 weitere Admonition-Buttons
```

**Impact**: Toolbar-Actions rufen nicht existierende Editor-Commands auf.

#### 2.1.3 Hardcoded Parser Cases (Logic-Breaker)

```typescript
// src/parser.ts - Lines 859-867
case 'mermaid':                                     // ❌ Hardcoded
  return `<pre class="mermaid">${this.escapeHtml(code)}</pre>`;
case 'katex':                                       // ❌ Hardcoded
  return `<div class="math math-display">${this.escapeHtml(code)}</div>`;
```

**Impact**: Parser erwartet bestimmte Code-Block-Languages.

#### 2.1.4 Hardcoded Preview Rendering (Visual-Breaker)

```typescript
// app/renderer/src/components/Preview.tsx - Lines 220-300
const mermaidElements = previewRef.current!.querySelectorAll('.mermaid');
mermaid.run({ nodes: mermaidElements });            // ❌ Direkter API-Call

const mathElements = previewRef.current!.querySelectorAll('.math, .language-math');
katex.render(mathContent, el);                      // ❌ Direkter API-Call
```

**Impact**: API-Calls zu nicht geladenen Libraries.

#### 2.1.5 Hardcoded Export (Output-Breaker)

```typescript
// app/renderer/src/App.tsx - Lines 983-1010
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
// ...
mermaid.initialize({...});
mermaid.run({ nodes: mermaidElements });
```

**Impact**: Export enthält CDN-Links zu nicht benötigten Libraries.

### 2.2 Betroffene Dateien (Vollständige Liste)

| Datei | Problem | Betroffene Plugins |
|-------|---------|-------------------|
| `Preview.tsx` | Direkte Imports, DOM-Queries, API-Calls | mermaid, katex, hljs, bootstrap, admonitions |
| `builtinToolbarItems.ts` | Hardcoded Buttons | mermaid, admonitions |
| `MermaidNodeView.tsx` | Direkter mermaid Import | mermaid |
| `SettingsDialog.tsx` | Default enabledPlugins | katex, mermaid, admonitions, bootstrap |
| `parser.ts` | switch-cases für Languages | mermaid, katex |
| `plugin-parser.ts` | builtinLanguages Set | mermaid, math, latex, katex |
| `App.tsx` | Export CDN-Links & Init | mermaid, katex, hljs |
| `markdownParser.ts` | codeBlockLang Check | mermaid |
| `markdownSerializer.ts` | mermaidBlock Handler | mermaid |
| `elementTemplates.ts` | Template Registration | mermaid, admonitions, hljs |
| `Sidebar.tsx` | Insert Template | mermaid |
| `HelpDialog.tsx` | Documentation | mermaid |

---

## 3. SOLL-Zustand: True Plugin Isolation

### 3.1 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MD++ Core                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Parser    │  │   Editor    │  │   Preview   │  │   Export    │ │
│  │    Core     │  │    Core     │  │    Core     │  │    Core     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
│         │                │                │                │        │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐ │
│  │                    Plugin Integration Layer                     │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐ │ │
│  │  │  Registry  │ │  Resolver  │ │   Loader   │ │ Contribution │ │ │
│  │  │            │ │            │ │            │ │    Points    │ │ │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘ │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
              ┌─────┴─────┐   ┌─────┴─────┐   ┌─────┴─────┐
              │  Plugin A │   │  Plugin B │   │  Plugin C │
              │  (katex)  │   │ (mermaid) │   │(admonit.) │
              └───────────┘   └───────────┘   └───────────┘
```

### 3.2 Kernprinzipien

1. **Zero Direct Imports**: MD++ importiert NIE direkt aus Plugin-Ordnern
2. **Lazy Loading**: Plugins werden nur geladen wenn aktiviert
3. **Graceful Degradation**: Fehlende Plugins = Feature nicht verfügbar (kein Crash)
4. **Dynamic Registration**: Alle Features werden zur Laufzeit registriert
5. **Contribution Point Model**: Plugins deklarieren was sie beitragen (nicht imperativer Code)

### 3.3 Feature Matrix nach Refactoring

| Feature | Aktuell | Nach Refactoring |
|---------|---------|------------------|
| Parser Code-Blocks | switch-case Hardcoded | Plugin contributes `codeBlockLanguages` |
| Toolbar Buttons | builtinToolbarItems.ts | Plugin contributes `toolbar.items` |
| Editor Highlighting | Monaco built-in | Plugin contributes `editor.languages` |
| Preview Rendering | Direkter API-Call | Plugin contributes `preview.renderer` |
| Export Assets | Hardcoded CDN-Links | Plugin contributes `assets` |
| Keyboard Shortcuts | Hardcoded | Plugin contributes `keybindings` |
| TipTap Extensions | Direkter Import | Plugin contributes `editor.extensions` |
| CSS Styles | Global CSS | Plugin contributes `styles` |

---

## 4. Unified Plugin Folder Structure

### 4.1 Standard Plugin Structure

```
plugins/
└── {plugin-id}/
    ├── plugin.json              # [REQUIRED] Plugin Manifest
    ├── README.md                # [RECOMMENDED] Documentation
    │
    ├── parser/                  # Parser-related code
    │   ├── index.ts             # Remark/Rehype plugins
    │   ├── codeblock-handler.ts # Code block language handlers
    │   └── input-rules.ts       # Markdown shortcuts
    │
    ├── editor/                  # Editor extensions
    │   ├── extension.ts         # TipTap extension
    │   ├── nodeview.tsx         # React NodeView component
    │   ├── language.ts          # Monaco language definition
    │   └── commands.ts          # Editor commands
    │
    ├── toolbar/                 # Toolbar contributions
    │   ├── items.ts             # Toolbar button definitions
    │   └── icons/               # Custom SVG icons
    │       └── diagram.svg
    │
    ├── preview/                 # Preview rendering
    │   ├── renderer.ts          # Post-processing logic
    │   └── styles.css           # Preview-specific styles
    │
    ├── export/                  # Export customization
    │   └── assets.ts            # CDN URLs, init scripts
    │
    ├── settings/                # Plugin settings
    │   ├── schema.json          # JSON Schema for settings
    │   └── defaults.json        # Default values
    │
    ├── i18n/                    # Internationalization
    │   ├── en.json
    │   └── de.json
    │
    └── assets/                  # Static assets
        ├── styles/
        │   └── theme.css
        └── scripts/
            └── runtime.js
```

### 4.2 Minimales Plugin (Components-Only)

```
plugins/
└── bootstrap/
    ├── plugin.json              # Manifest mit components
    └── assets/
        └── styles/
            └── bootstrap.min.css
```

### 4.3 Parser-Only Plugin

```
plugins/
└── katex/
    ├── plugin.json
    ├── parser/
    │   └── index.ts             # remark-math + rehype-katex
    ├── preview/
    │   └── renderer.ts          # KaTeX render calls
    └── settings/
        └── schema.json
```

### 4.4 Full-Featured Plugin (Hybrid)

```
plugins/
└── mermaid/
    ├── plugin.json
    ├── README.md
    │
    ├── parser/
    │   ├── index.ts             # Code block detection
    │   └── codeblock-handler.ts # HTML generation
    │
    ├── editor/
    │   ├── extension.ts         # MermaidBlock TipTap extension
    │   ├── nodeview.tsx         # Visual Mermaid editor
    │   ├── language.ts          # Monaco syntax for mermaid
    │   └── commands.ts          # setMermaid, toggleMermaid
    │
    ├── toolbar/
    │   ├── items.ts             # Diagram button
    │   └── icons/
    │       └── flowchart.svg
    │
    ├── preview/
    │   ├── renderer.ts          # mermaid.run()
    │   └── styles.css           # .mermaid container styles
    │
    ├── export/
    │   └── assets.ts            # CDN URLs + init script
    │
    └── settings/
        ├── schema.json
        └── defaults.json
```

---

## 5. Plugin Manifest Schema (Erweitert)

### 5.1 Vollständiges Schema

```json
{
  "$schema": "https://mdplusplus.dev/schemas/plugin.v2.json",

  // ===== METADATA =====
  "id": "mermaid",
  "name": "Mermaid Diagrams",
  "version": "1.0.0",
  "author": "MD++ Team",
  "description": "Flowcharts, sequence diagrams, and more",
  "license": "MIT",
  "repository": "https://github.com/example/mdpp-mermaid",
  "homepage": "https://mermaid.js.org",

  // ===== PLUGIN TYPE =====
  "type": "hybrid",  // "parser" | "components" | "hybrid" | "theme"

  // ===== DEPENDENCIES =====
  "dependencies": {
    "plugins": [],
    "npm": ["mermaid@^10.0.0"]
  },
  "optionalDependencies": {
    "plugins": ["elk-layout"]
  },
  "conflicts": ["plantuml"],

  // ===== CONTRIBUTION POINTS =====
  "contributes": {

    // Parser contributions
    "parser": {
      "entry": "./parser/index.ts",
      "phase": "remark",
      "priority": 90,
      "codeBlockLanguages": ["mermaid"],
      "codeBlockHandler": "./parser/codeblock-handler.ts"
    },

    // Editor contributions (TipTap + Monaco)
    "editor": {
      "extension": "./editor/extension.ts",
      "nodeView": "./editor/nodeview.tsx",
      "commands": [
        {
          "id": "setMermaid",
          "title": "Insert Mermaid Diagram"
        },
        {
          "id": "toggleMermaidEdit",
          "title": "Toggle Mermaid Edit Mode"
        }
      ],
      "languages": [
        {
          "id": "mermaid",
          "extensions": [".mmd", ".mermaid"],
          "aliases": ["Mermaid", "mermaid"],
          "configuration": "./editor/language.ts"
        }
      ]
    },

    // Toolbar contributions
    "toolbar": {
      "items": [
        {
          "id": "insert-diagram",
          "command": "setMermaid",
          "group": "insert",
          "priority": 4,
          "icon": "./toolbar/icons/flowchart.svg",
          "label": "Diagram",
          "tooltip": "Insert Mermaid Diagram",
          "shortcut": "Ctrl+Shift+M"
        }
      ],
      "groups": [
        {
          "id": "diagrams",
          "label": "Diagrams",
          "priority": 45
        }
      ]
    },

    // Keybindings
    "keybindings": [
      {
        "command": "setMermaid",
        "key": "ctrl+shift+m",
        "mac": "cmd+shift+m",
        "when": "editorTextFocus"
      }
    ],

    // Preview rendering
    "preview": {
      "renderer": "./preview/renderer.ts",
      "styles": ["./preview/styles.css"],
      "selectors": [".mermaid", "pre.mermaid"]
    },

    // Sidebar contributions
    "sidebar": {
      "insertTemplates": [
        {
          "id": "mermaid-flowchart",
          "label": "Flowchart",
          "category": "diagrams",
          "template": "```mermaid\ngraph TD\n    A[Start] --> B[End]\n```\n"
        },
        {
          "id": "mermaid-sequence",
          "label": "Sequence Diagram",
          "category": "diagrams",
          "template": "```mermaid\nsequenceDiagram\n    Alice->>Bob: Hello!\n    Bob-->>Alice: Hi!\n```\n"
        }
      ]
    },

    // Export contributions
    "export": {
      "assets": "./export/assets.ts",
      "styles": ["./preview/styles.css"]
    },

    // Help/Documentation
    "help": {
      "entries": [
        {
          "title": "Mermaid Diagrams",
          "description": "Create flowcharts, sequence diagrams, and more",
          "syntax": "```mermaid",
          "link": "https://mermaid.js.org/intro/"
        }
      ]
    }
  },

  // ===== UI COMPONENTS (Legacy Support) =====
  "components": {
    "diagram": {
      "tag": "pre",
      "classes": ["mermaid"],
      "description": "Mermaid diagram container"
    }
  },

  // ===== ASSETS =====
  "assets": {
    "css": [
      "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.css"
    ],
    "js": [
      "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
    ],
    "init": "mermaid.initialize({startOnLoad:false,theme:'default'});"
  },

  // ===== SETTINGS =====
  "settings": {
    "schema": "./settings/schema.json",
    "defaults": {
      "theme": "default",
      "securityLevel": "loose"
    }
  },

  // ===== COMPATIBILITY =====
  "engines": {
    "mdplusplus": ">=1.0.0"
  },
  "minAppVersion": "1.0.0"
}
```

### 5.2 Contribution Point Types

| Contribution Point | Beschreibung | Obligatorische Felder |
|-------------------|--------------|----------------------|
| `contributes.parser` | Parser-Pipeline Integration | `entry`, `phase` |
| `contributes.editor` | TipTap Extension + Monaco | `extension` oder `commands` |
| `contributes.toolbar` | Toolbar Buttons | `items[].id`, `items[].command` |
| `contributes.keybindings` | Keyboard Shortcuts | `command`, `key` |
| `contributes.preview` | Preview Post-Processing | `renderer` |
| `contributes.sidebar` | Sidebar Insert Templates | `insertTemplates[].template` |
| `contributes.export` | Export Assets | `assets` |
| `contributes.help` | Help Dialog Entries | `entries[].title` |

---

## 6. Contribution Points System

### 6.1 Contribution Point Registry

```typescript
// src/plugin-system/contribution-registry.ts

export interface ContributionPoint<T> {
  id: string;
  schema: JSONSchema;
  handler: ContributionHandler<T>;
}

export interface ContributionHandler<T> {
  register(pluginId: string, contribution: T): void;
  unregister(pluginId: string): void;
  getAll(): Map<string, T[]>;
}

export class ContributionRegistry {
  private points: Map<string, ContributionPoint<unknown>> = new Map();

  // Built-in contribution points
  constructor() {
    this.registerPoint('parser', parserContributionHandler);
    this.registerPoint('editor', editorContributionHandler);
    this.registerPoint('toolbar', toolbarContributionHandler);
    this.registerPoint('keybindings', keybindingsContributionHandler);
    this.registerPoint('preview', previewContributionHandler);
    this.registerPoint('sidebar', sidebarContributionHandler);
    this.registerPoint('export', exportContributionHandler);
    this.registerPoint('help', helpContributionHandler);
  }

  processPluginContributions(pluginId: string, contributes: Record<string, unknown>): void {
    for (const [pointId, contribution] of Object.entries(contributes)) {
      const point = this.points.get(pointId);
      if (point) {
        point.handler.register(pluginId, contribution);
      }
    }
  }

  removePluginContributions(pluginId: string): void {
    for (const point of this.points.values()) {
      point.handler.unregister(pluginId);
    }
  }
}
```

### 6.2 Parser Contribution Handler

```typescript
// src/plugin-system/contributions/parser-handler.ts

interface ParserContribution {
  entry?: string;
  phase: 'remark' | 'rehype' | 'both';
  priority?: number;
  codeBlockLanguages?: string[];
  codeBlockHandler?: string;
}

class ParserContributionHandler implements ContributionHandler<ParserContribution> {
  private contributions: Map<string, ParserContribution> = new Map();
  private codeBlockHandlers: Map<string, (lang: string, code: string) => string> = new Map();

  register(pluginId: string, contribution: ParserContribution): void {
    this.contributions.set(pluginId, contribution);

    // Register code block languages
    if (contribution.codeBlockLanguages) {
      for (const lang of contribution.codeBlockLanguages) {
        // Dynamic handler loading
        if (contribution.codeBlockHandler) {
          this.loadCodeBlockHandler(pluginId, lang, contribution.codeBlockHandler);
        }
      }
    }
  }

  getCodeBlockHandler(lang: string): ((code: string) => string) | undefined {
    return this.codeBlockHandlers.get(lang);
  }

  getActiveRemarkPlugins(): Plugin[] {
    // Returns remark plugins sorted by priority
  }

  getActiveRehypePlugins(): Plugin[] {
    // Returns rehype plugins sorted by priority
  }
}
```

### 6.3 Toolbar Contribution Handler

```typescript
// src/plugin-system/contributions/toolbar-handler.ts

interface ToolbarItemContribution {
  id: string;
  command: string;
  group: string;
  priority?: number;
  icon?: string;
  label: string;
  tooltip?: string;
  shortcut?: string;
  when?: string;
}

class ToolbarContributionHandler implements ContributionHandler<{ items: ToolbarItemContribution[] }> {
  register(pluginId: string, contribution: { items: ToolbarItemContribution[] }): void {
    for (const item of contribution.items) {
      // Resolve icon path
      const icon = item.icon
        ? this.loadIcon(pluginId, item.icon)
        : undefined;

      // Register with toolbar registry
      toolbarRegistry.register({
        id: `${pluginId}:${item.id}`,
        type: 'button',
        group: item.group,
        priority: item.priority ?? 100,
        icon,
        label: item.label,
        tooltip: item.tooltip,
        shortcut: item.shortcut,
        pluginId,
        action: (editor) => {
          // Execute command from editor contribution
          const command = editorContributionHandler.getCommand(pluginId, item.command);
          if (command) {
            command.execute(editor);
          }
        },
      });
    }
  }

  unregister(pluginId: string): void {
    toolbarRegistry.unregisterPlugin(pluginId);
  }
}
```

---

## 7. WYSIWYG Toolbar Extension System

### 7.1 Aktuelles Problem

```typescript
// builtinToolbarItems.ts - HARDCODED
const builtinItems: ToolbarItem[] = [
  // ... 40+ hardcoded items including plugin-specific ones
  {
    id: 'mermaid',  // ❌ Should come from plugin
    icon: GitBranch,
    action: (editor) => editor.chain().focus().setMermaid().run(),
  },
];
```

### 7.2 Neue Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                     Toolbar Registry                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Core Items                            ││
│  │  [Undo] [Redo] | [B] [I] [S] | [H1] [H2] [H3] | ...     ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Plugin-Contributed Items                    ││
│  │  [Diagram]    ← mermaid plugin                          ││
│  │  [Note] [Tip] [Warning] ← admonitions plugin            ││
│  │  [Math]       ← katex plugin                            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Plugin Toolbar Definition

```typescript
// plugins/mermaid/toolbar/items.ts

import { ToolbarItemContribution } from '@mdplusplus/plugin-sdk';
import { GitBranch } from 'lucide-react';

export const toolbarItems: ToolbarItemContribution[] = [
  {
    id: 'insert-diagram',
    command: 'setMermaid',
    group: 'insert',
    priority: 4,
    icon: GitBranch,  // or './icons/flowchart.svg'
    label: 'Diagram',
    tooltip: 'Insert Mermaid Diagram (Ctrl+Shift+M)',
    shortcut: 'Ctrl+Shift+M',
  },
];
```

```typescript
// plugins/admonitions/toolbar/items.ts

export const toolbarItems: ToolbarItemContribution[] = [
  {
    id: 'callout-note',
    command: 'toggleAdmonition:note',
    group: 'callout',
    priority: 0,
    icon: Info,
    label: 'Note',
    tooltip: 'Insert Note Callout',
  },
  {
    id: 'callout-tip',
    command: 'toggleAdmonition:tip',
    group: 'callout',
    priority: 1,
    icon: Lightbulb,
    label: 'Tip',
    tooltip: 'Insert Tip Callout',
  },
  // ... weitere
];
```

### 7.4 Core Toolbar Items (Non-Plugin)

Nach Refactoring enthält `builtinToolbarItems.ts` NUR:

```typescript
const coreItems: ToolbarItem[] = [
  // History (undo/redo)
  { id: 'undo', ... },
  { id: 'redo', ... },

  // Basic formatting
  { id: 'bold', ... },
  { id: 'italic', ... },
  { id: 'strikethrough', ... },
  { id: 'code', ... },

  // Headings
  { id: 'heading1', ... },
  { id: 'heading2', ... },
  { id: 'heading3', ... },

  // Lists
  { id: 'bulletList', ... },
  { id: 'orderedList', ... },
  { id: 'blockquote', ... },
  { id: 'codeBlock', ... },

  // Basic insert
  { id: 'link', ... },
  { id: 'image', ... },
  { id: 'table', ... },
  { id: 'horizontalRule', ... },
];

// KEINE mermaid, admonition, etc. - diese kommen aus Plugins!
```

---

## 8. Monaco Editor Language Extensions

### 8.1 Aktuelles Problem

Monaco verwendet built-in Language-Definitionen. Plugins können keine eigenen Languages hinzufügen.

### 8.2 Plugin Language Definition

```typescript
// plugins/mermaid/editor/language.ts

import type { MonacoLanguageContribution } from '@mdplusplus/plugin-sdk';

export const mermaidLanguage: MonacoLanguageContribution = {
  id: 'mermaid',
  extensions: ['.mmd', '.mermaid'],
  aliases: ['Mermaid', 'mermaid', 'mmd'],

  monarchTokensProvider: {
    keywords: [
      'graph', 'subgraph', 'end', 'flowchart', 'sequenceDiagram',
      'classDiagram', 'stateDiagram', 'erDiagram', 'gantt',
      'pie', 'gitGraph', 'mindmap', 'timeline'
    ],

    tokenizer: {
      root: [
        [/%%.*$/, 'comment'],
        [/--?>|-->|-.->|==>|--x|--o/, 'delimiter.arrow'],
        [/\[.*?\]|\(.*?\)|\{.*?\}/, 'string.label'],
        [/[A-Z][a-zA-Z0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],
        [/[a-z][a-zA-Z0-9_]*/, 'identifier'],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
      ]
    }
  },

  // Code block detection in Markdown
  embeddedLanguages: {
    inMarkdown: true,
    fenceInfo: ['mermaid', 'mmd']
  }
};
```

### 8.3 Language Registration Flow

```typescript
// src/plugin-system/contributions/editor-handler.ts

class EditorContributionHandler {
  registerLanguage(pluginId: string, langDef: MonacoLanguageContribution): void {
    // Register language ID
    monaco.languages.register({
      id: langDef.id,
      extensions: langDef.extensions,
      aliases: langDef.aliases,
    });

    // Register tokenizer
    if (langDef.monarchTokensProvider) {
      monaco.languages.setMonarchTokensProvider(
        langDef.id,
        langDef.monarchTokensProvider
      );
    }

    // Register embedded language support for Markdown code blocks
    if (langDef.embeddedLanguages?.inMarkdown) {
      this.registerMarkdownCodeBlockLanguage(langDef);
    }
  }
}
```

---

## 9. Preview Rendering System

### 9.1 Aktuelles Problem

```typescript
// Preview.tsx - HARDCODED Rendering
const renderMermaid = async () => {
  const mermaidElements = previewRef.current!.querySelectorAll('.mermaid');
  await mermaid.run({ nodes: mermaidElements });
};

const renderKaTeX = () => {
  const mathElements = previewRef.current!.querySelectorAll('.math');
  katex.render(mathContent, el);
};
```

### 9.2 Plugin Preview Renderer

```typescript
// plugins/mermaid/preview/renderer.ts

import type { PreviewRenderer, PreviewContext } from '@mdplusplus/plugin-sdk';

export const mermaidPreviewRenderer: PreviewRenderer = {
  // CSS selectors to match
  selectors: ['.mermaid', 'pre.mermaid', '[data-type="mermaid-block"]'],

  // Priority (higher = runs first)
  priority: 100,

  // Async rendering function
  async render(elements: Element[], context: PreviewContext): Promise<void> {
    if (elements.length === 0) return;

    // Dynamically import mermaid only when needed
    const mermaid = await import('mermaid');

    // Get settings from context
    const settings = context.getPluginSettings('mermaid');

    // Initialize with current theme
    mermaid.default.initialize({
      startOnLoad: false,
      theme: context.theme === 'dark' ? 'dark' : 'default',
      securityLevel: settings.securityLevel ?? 'loose',
    });

    // Store original content for reset
    elements.forEach((el, index) => {
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', el.textContent || '');
      }
      el.removeAttribute('data-processed');
      el.id = `mermaid-${Date.now()}-${index}`;
    });

    // Render
    await mermaid.default.run({ nodes: elements as HTMLElement[] });
  },

  // Reset function (called when plugin is disabled)
  reset(elements: Element[]): void {
    elements.forEach((el) => {
      const originalCode = el.getAttribute('data-original');
      if (originalCode) {
        el.innerHTML = '';
        el.textContent = originalCode;
        el.removeAttribute('data-processed');
      }
    });
  }
};
```

### 9.3 Preview Renderer Registry

```typescript
// src/plugin-system/contributions/preview-handler.ts

class PreviewContributionHandler {
  private renderers: Map<string, PreviewRenderer[]> = new Map();

  register(pluginId: string, renderer: PreviewRenderer): void {
    // Store renderer
    let list = this.renderers.get(pluginId) || [];
    list.push(renderer);
    this.renderers.set(pluginId, list);
  }

  async renderAll(container: HTMLElement, context: PreviewContext): Promise<void> {
    const enabledPlugins = context.getEnabledPlugins();

    // Get all renderers from enabled plugins, sorted by priority
    const activeRenderers = Array.from(this.renderers.entries())
      .filter(([pluginId]) => enabledPlugins.includes(pluginId))
      .flatMap(([_, renderers]) => renderers)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

    // Run each renderer
    for (const renderer of activeRenderers) {
      const elements = Array.from(
        container.querySelectorAll(renderer.selectors.join(', '))
      );

      if (elements.length > 0) {
        await renderer.render(elements, context);
      }
    }
  }

  resetPlugin(pluginId: string, container: HTMLElement): void {
    const renderers = this.renderers.get(pluginId) || [];
    for (const renderer of renderers) {
      if (renderer.reset) {
        const elements = Array.from(
          container.querySelectorAll(renderer.selectors.join(', '))
        );
        renderer.reset(elements);
      }
    }
  }
}
```

### 9.4 Refactored Preview.tsx useEffect

```typescript
// app/renderer/src/components/Preview.tsx (AFTER Refactoring)

useEffect(() => {
  if (!previewRef.current) return;

  const context: PreviewContext = {
    theme,
    getEnabledPlugins: () => settings?.enabledPlugins || [],
    getPluginSettings: (pluginId) => pluginRegistry.getSettings(pluginId),
  };

  // Let plugin system handle all rendering
  previewContributionHandler.renderAll(previewRef.current, context);

  // Always run syntax highlighting (core feature)
  highlightCodeBlocks(previewRef.current);

}, [html, theme, settings?.enabledPlugins]);
```

---

## 10. Export System Integration

### 10.1 Aktuelles Problem

```typescript
// App.tsx - HARDCODED Export Assets
const exportHTML = `
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script>
    mermaid.initialize({...});
    mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
  </script>
`;
```

### 10.2 Plugin Export Assets

```typescript
// plugins/mermaid/export/assets.ts

import type { ExportAssets } from '@mdplusplus/plugin-sdk';

export const mermaidExportAssets: ExportAssets = {
  // External CDN resources
  css: [],
  js: [
    'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
  ],

  // Initialization script (runs after DOMContentLoaded)
  initScript: (settings, theme) => `
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({
        startOnLoad: false,
        theme: '${theme === 'dark' ? 'dark' : 'default'}',
        securityLevel: '${settings.securityLevel ?? 'loose'}'
      });
      mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
    }
  `,

  // Inline CSS (embedded in <style>)
  inlineStyles: `
    .mermaid {
      text-align: center;
      margin: 1em 0;
    }
  `,

  // Check if this plugin's assets are needed for the content
  isNeeded: (html: string) => {
    return html.includes('class="mermaid"') ||
           html.includes('data-type="mermaid-block"');
  }
};
```

### 10.3 Export Assets Handler

```typescript
// src/plugin-system/contributions/export-handler.ts

class ExportContributionHandler {
  private assets: Map<string, ExportAssets> = new Map();

  buildExportAssets(html: string, settings: ParserSettings, theme: string): ExportBundle {
    const enabledPlugins = settings.enabledPlugins || [];
    const bundle: ExportBundle = {
      cssLinks: [],
      jsLinks: [],
      inlineStyles: [],
      initScripts: [],
    };

    for (const pluginId of enabledPlugins) {
      const assets = this.assets.get(pluginId);
      if (!assets) continue;

      // Check if plugin assets are needed for this content
      if (assets.isNeeded && !assets.isNeeded(html)) continue;

      // Add CSS
      if (assets.css) {
        bundle.cssLinks.push(...assets.css);
      }

      // Add JS
      if (assets.js) {
        bundle.jsLinks.push(...assets.js);
      }

      // Add inline styles
      if (assets.inlineStyles) {
        bundle.inlineStyles.push(assets.inlineStyles);
      }

      // Add init script
      if (assets.initScript) {
        const pluginSettings = pluginRegistry.getSettings(pluginId);
        bundle.initScripts.push(assets.initScript(pluginSettings, theme));
      }
    }

    return bundle;
  }
}
```

### 10.4 Refactored Export Function

```typescript
// app/renderer/src/App.tsx (AFTER Refactoring)

const handleExportHTML = async () => {
  const html = await parser.convert(content);

  // Get assets from enabled plugins
  const assets = exportContributionHandler.buildExportAssets(
    html.html,
    settings,
    theme
  );

  // Build HTML document
  const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  ${assets.cssLinks.map(url => `<link rel="stylesheet" href="${url}">`).join('\n  ')}
  <style>
    ${assets.inlineStyles.join('\n')}
  </style>
</head>
<body class="${theme}-mode">
  ${html.html}

  ${assets.jsLinks.map(url => `<script src="${url}"></script>`).join('\n  ')}
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      ${assets.initScripts.join('\n      ')}
    });
  </script>
</body>
</html>`;

  // Save file
  await saveFile(doc, `${title}.html`);
};
```

---

## 11. Migration Plan Phase 6

### Phase 6.1: Core Refactoring (Preparation)

**Ziel**: MD++ Core von allen Plugin-Direktimporten befreien

| Task | Datei | Änderung |
|------|-------|----------|
| 6.1.1 | `Preview.tsx` | Entferne direkte mermaid/katex/hljs Imports |
| 6.1.2 | `Preview.tsx` | Entferne direkte Plugin-JSON Imports |
| 6.1.3 | `builtinToolbarItems.ts` | Extrahiere mermaid/admonition Items |
| 6.1.4 | `MermaidNodeView.tsx` | Verschiebe nach `plugins/mermaid/editor/` |
| 6.1.5 | `parser.ts` | Entferne hardcoded switch-cases |
| 6.1.6 | `App.tsx` | Entferne hardcoded Export-Assets |

### Phase 6.2: Contribution Points Infrastructure

**Ziel**: VS Code-inspiriertes Contribution System

| Task | Beschreibung |
|------|--------------|
| 6.2.1 | Implementiere `ContributionRegistry` |
| 6.2.2 | Implementiere `ParserContributionHandler` |
| 6.2.3 | Implementiere `ToolbarContributionHandler` |
| 6.2.4 | Implementiere `EditorContributionHandler` |
| 6.2.5 | Implementiere `PreviewContributionHandler` |
| 6.2.6 | Implementiere `ExportContributionHandler` |
| 6.2.7 | Implementiere `SidebarContributionHandler` |
| 6.2.8 | Implementiere `HelpContributionHandler` |

### Phase 6.3: Plugin Migration

**Ziel**: Bestehende Plugins auf neue Struktur umstellen

| Plugin | Tasks |
|--------|-------|
| **mermaid** | toolbar/items.ts, editor/extension.ts, editor/nodeview.tsx, preview/renderer.ts, export/assets.ts |
| **katex** | preview/renderer.ts, export/assets.ts |
| **admonitions** | toolbar/items.ts, editor/extension.ts, preview/renderer.ts |
| **hljs** | preview/renderer.ts (neues Plugin), export/assets.ts |
| **bootstrap** | Nur Manifest-Update (components-only) |

### Phase 6.4: Dynamic Loading System

**Ziel**: Plugins zur Laufzeit laden/entladen

| Task | Beschreibung |
|------|--------------|
| 6.4.1 | Plugin Discovery (Filesystem Scan) |
| 6.4.2 | Dynamic Import für Parser-Code |
| 6.4.3 | Dynamic Import für Editor-Extensions |
| 6.4.4 | Dynamic Import für Preview-Renderer |
| 6.4.5 | Hot-Reload Support (optional) |

### Phase 6.5: Testing & Validation

**Ziel**: Sicherstellen dass Plugin-Isolation funktioniert

| Test | Beschreibung |
|------|--------------|
| 6.5.1 | Delete mermaid folder → App startet ohne Fehler |
| 6.5.2 | Delete katex folder → App startet ohne Fehler |
| 6.5.3 | Delete all plugins → App startet mit Core-Features |
| 6.5.4 | Re-add plugins → Features erscheinen sofort |
| 6.5.5 | Performance-Tests (Startup, Rendering) |

---

## 12. Implementierungsstatus

### Abgeschlossene Phasen

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| Phase 1 | ✅ | Plugin-Ordner-Struktur erstellt |
| Phase 2 | ✅ | Plugin-System Core (Registry, Loader, Resolver) |
| Phase 3 | ✅ | Parser-Plugins extrahiert |
| Phase 4 | ✅ | Parser Refactoring (MDPlusPlusWithPlugins) |
| Phase 5 | ✅ | UI/UX Anpassungen (PluginManager) |

### Offene Phasen

| Phase | Status | Beschreibung |
|-------|--------|--------------|
| Phase 6.1 | ⏳ | Core Refactoring (Direktimports entfernen) |
| Phase 6.2 | ⏳ | Contribution Points Infrastructure |
| Phase 6.3 | ⏳ | Plugin Migration (vollständige Struktur) |
| Phase 6.4 | ⏳ | Dynamic Loading System |
| Phase 6.5 | ⏳ | Testing & Validation |

---

## 13. Quellen & Referenzen

### Editor Architekturen
- [TipTap Extensions](https://tiptap.dev/docs/editor/core-concepts/extensions) - Extension-basiertes System
- [ProseMirror Guide](https://prosemirror.net/docs/guide/) - Plugin-System mit State, Props, Commands
- [CKEditor 5 Plugin Architecture](https://ckeditor.com/docs/ckeditor5/latest/framework/architecture/plugins.html) - Feature = Plugin
- [Froala Modular Architecture](https://froala.com/blog/general/building-more-robust-and-scalable-software-a-closer-at-froala-html-editor-software/)

### Plugin Systeme
- [VS Code Extension Contribution Points](https://code.visualstudio.com/api/references/contribution-points) - 32 Contribution Point Types
- [VS Code Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest) - package.json contributes
- [Obsidian Plugin Development](https://deepwiki.com/obsidianmd/obsidian-api/3-plugin-development) - manifest.json + Commands
- [Monaco Editor Language Support](https://deepwiki.com/microsoft/monaco-editor/3.1-language-support-system) - Two-Tier System

### Best Practices
- [Modular Plugin Architectures 2025](https://www.tiny.cloud/blog/open-source-wysiwyg-html-editor/) - Load only needed features
- [Understanding package.json in VS Code Extensions](https://dev.to/charan_gutti_cf60c6185074/understanding-packagejson-in-vs-code-extensions-the-heartbeat-of-your-extension-50pg)
- [Unified.js Plugin System](https://unifiedjs.com) - Remark/Rehype Pipeline

### MD++ Spezifisch
- [Plugin Registry Implementation](../src/plugin-system/plugin-registry.ts)
- [Toolbar Registry Implementation](../app/renderer/src/wysiwyg/ToolbarRegistry.ts)
- [Current Plugin Manifests](../plugins/)
