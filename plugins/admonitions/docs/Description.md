# Admonitions Plugin

## Overview

The Admonitions plugin provides callout boxes for highlighting important information in your Markdown documents. These visual blocks draw attention to notes, tips, warnings, and other special content. The plugin is compatible with GitHub and Obsidian callout syntax.

## Features

- **Multiple Types** - 15 different admonition types for various purposes
- **GitHub Compatible** - Uses `> [!TYPE]` blockquote syntax
- **Obsidian Compatible** - Works with Obsidian callout format
- **Custom Titles** - Override default titles with your own
- **Collapsible** - Create expandable/collapsible callouts
- **Nested Content** - Include any Markdown inside callouts
- **Themed Icons** - Each type has a distinctive icon
- **AI Visibility** - Certain types are visible to AI assistants

## Admonition Types

| Type | Icon | Use Case |
|------|------|----------|
| `note` | Info circle | General information |
| `info` | Info circle | Supplementary details |
| `tip` | Lightbulb | Helpful suggestions |
| `hint` | Lightbulb | Subtle guidance (alias for tip) |
| `important` | Exclamation circle | Key information |
| `warning` | Exclamation triangle | Potential issues |
| `caution` | Exclamation triangle | Careful consideration (alias for warning) |
| `danger` | Times circle | Critical warnings |
| `error` | Times circle | Error states (alias for danger) |
| `success` | Check circle | Positive outcomes |
| `question` | Question circle | FAQs or inquiries |
| `quote` | Quote left | Quotations |
| `example` | List | Examples and samples |
| `abstract` | Clipboard list | Summaries |
| `bug` | Bug | Known issues |

## AI Visibility

The following admonition types are visible to AI assistants (marked with `aiVisible: true`):
- `note`
- `tip`
- `warning`
- `danger`

This allows AI tools to understand and reference important callouts in your document.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+N` | Insert a Note callout |
| `Cmd+Shift+N` (Mac) | Insert a Note callout |

## Toolbar Integration

The plugin adds a "Callouts" group to the toolbar with quick-insert buttons for:
- Note
- Tip
- Warning
- Danger
- Success
- Question

## Requirements

- MD++ Editor version 1.0.0 or higher

## Styling

Admonitions are styled with:
- Colored left border matching the type
- Light background tint
- Icon in the header
- Rounded corners
- Proper spacing for nested content
