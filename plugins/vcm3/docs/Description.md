# VCM3 Components Plugin

## Overview

The VCM3 (Vibe Coding Markdown v3) plugin provides a set of native components designed for modern documentation and content creation. Components use semantic design tokens and CSS custom properties for consistent theming. VCM3 is optimized for vibecoding workflows and AI-assisted content creation.

## Features

- **Semantic Components** - Purpose-built UI elements
- **Design Tokens** - CSS custom properties for theming
- **AI Context Support** - Hidden blocks visible to AI assistants
- **Dark Mode** - Full dark/light mode support
- **Hover Effects** - Smooth transitions and interactions
- **Flexible Layouts** - Grid and accordion components

## Available Components

| Component | Description |
|-----------|-------------|
| `card` | Content card with header, body, footer |
| `alert` | Notification messages |
| `callout` | Highlighted information blocks |
| `code` | Styled code containers |
| `tabs` | Tabbed content interface |
| `accordion` | Collapsible content panels |
| `badge` | Labels and tags |
| `button` | Interactive buttons |
| `feature` | Feature showcase cards |
| `grid` | Responsive grid layouts |
| `ai-context` | Hidden AI-visible blocks |

## Design Tokens

VCM3 components use these CSS custom properties:

| Token | Description |
|-------|-------------|
| `--bg-card` | Card background |
| `--text-primary` | Primary text color |
| `--text-muted-foreground` | Muted text |
| `--primary` | Primary accent color |
| `--primary-foreground` | Text on primary |
| `--secondary` | Secondary color |
| `--secondary-foreground` | Text on secondary |
| `--border` | Border color |
| `--input` | Input border |
| `--accent` | Accent color |
| `--accent-foreground` | Text on accent |

## AI Context Blocks

The `ai-context` component creates hidden content that is:
- Invisible to human readers in preview
- Visible and parseable by AI assistants
- Useful for providing context without visual clutter

## Requirements

- MD++ Editor version 1.0.0 or higher

## Use Cases

- Technical documentation
- Product feature showcases
- Interactive tutorials
- AI-assisted content workflows
- Design system documentation
