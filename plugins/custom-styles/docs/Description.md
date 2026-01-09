# Custom Styles Plugin

## Overview

The Custom Styles plugin allows you to embed CSS, SCSS, or SASS stylesheets directly in your Markdown documents. This enables per-document styling, custom themes, and advanced visual customization without external files. Styles are automatically scoped to the preview to prevent affecting the editor interface.

## Features

- **CSS Support** - Write plain CSS directly in your document
- **SCSS/SASS Compilation** - Full SCSS and SASS syntax with compilation
- **Theme Variables** - Access MD++ theme CSS variables in your styles
- **Scoped Styles** - Styles are automatically scoped to preview content
- **Visual Feedback** - Code blocks show "Applied" indicator when styles are active
- **Error Reporting** - SCSS compilation errors are displayed inline
- **File Extension Activation** - Auto-enabled for `.mdpp` and `.mpsc` files

## Use Cases

- **Custom Document Themes** - Create unique styles for specific documents
- **Branding** - Apply corporate colors and fonts
- **Presentations** - Style slides with custom layouts
- **Prototyping** - Quickly test CSS changes in context
- **Teaching CSS** - Show styles and their effects in real-time

## Activation

The plugin is **disabled by default** but automatically activates for:
- Files with `.mdpp` extension (MD++ enhanced Markdown)
- Files with `.mpsc` extension (MD++ scripted content)

You can also manually enable it in the Plugin Manager.

## Available Theme Variables

Use these CSS custom properties to integrate with MD++ themes:

| Variable | Description |
|----------|-------------|
| `--bg-primary` | Primary background color |
| `--bg-secondary` | Secondary background color |
| `--bg-card` | Card/panel background |
| `--bg-hover` | Hover state background |
| `--text-primary` | Primary text color |
| `--text-secondary` | Secondary text color |
| `--text-muted` | Muted/dimmed text |
| `--accent` | Accent/brand color |
| `--accent-hover` | Accent hover state |
| `--color-success` | Success indicator |
| `--color-warning` | Warning indicator |
| `--color-error` | Error indicator |
| `--color-info` | Info indicator |
| `--border-color` | Border color |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `defaultLanguage` | `css` | Default language for new style blocks |
| `enableSassCompilation` | `true` | Enable SCSS/SASS compilation |
| `scopeStyles` | `true` | Scope styles to preview container |

## Toolbar Integration

The plugin adds a "Styling" group to the toolbar with buttons for:
- Insert CSS block
- Insert SCSS block

## Requirements

- MD++ Editor version 1.0.0 or higher
- SASS package (included with MD++)
