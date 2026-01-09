# Mermaid Diagrams Plugin

## Overview

The Mermaid plugin enables you to create diagrams and flowcharts directly in your Markdown documents using the popular [Mermaid](https://mermaid.js.org/) diagramming library. Diagrams are written as text and rendered as SVG graphics in the preview.

## Features

- **Flowcharts** - Create flow diagrams with nodes and edges
- **Sequence Diagrams** - Visualize interactions between components
- **Class Diagrams** - Document object-oriented structures
- **State Diagrams** - Model state machines and transitions
- **Entity Relationship Diagrams** - Design database schemas
- **Gantt Charts** - Plan project timelines
- **Pie Charts** - Display proportional data
- **Git Graphs** - Visualize branch histories
- **User Journey Maps** - Document user experiences
- **Mindmaps** - Organize hierarchical information
- **Timeline** - Display chronological events
- **Quadrant Charts** - Plot data in four quadrants
- **Sankey Diagrams** - Show flow quantities
- **XY Charts** - Create line, bar, and scatter plots

## Requirements

- MD++ Editor version 1.0.0 or higher
- Internet connection (for loading Mermaid library from CDN)

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `theme` | `default` | Mermaid theme: `default`, `dark`, `forest`, `neutral`, `base` |
| `securityLevel` | `loose` | Security level for rendering: `strict`, `loose`, `antiscript`, `sandbox` |
| `startOnLoad` | `true` | Automatically render diagrams when the page loads |
| `logLevel` | `error` | Logging level: `debug`, `info`, `warn`, `error`, `fatal` |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+M` | Insert a new Mermaid diagram block |
| `Cmd+Shift+M` (Mac) | Insert a new Mermaid diagram block |

## Integration

The plugin integrates with:

- **Editor**: WYSIWYG editor with Mermaid block support
- **Preview**: Live rendering of diagrams
- **Export**: Includes Mermaid assets in exported HTML
- **Toolbar**: Quick insert button in the "Insert" group

## External Resources

- [Mermaid Official Documentation](https://mermaid.js.org/intro/)
- [Mermaid Live Editor](https://mermaid.live/)
- [Mermaid GitHub Repository](https://github.com/mermaid-js/mermaid)
