# KaTeX Math Plugin

## Overview

The KaTeX plugin enables LaTeX math rendering in your Markdown documents using [KaTeX](https://katex.org/), the fastest math typesetting library for the web. Write mathematical formulas, equations, and expressions using familiar LaTeX syntax.

## Features

- **Inline Math** - Embed math expressions within text using `$...$`
- **Display Math** - Centered block equations using `$$...$$`
- **Code Block Math** - Use fenced code blocks with `math`, `latex`, or `katex` language
- **Fast Rendering** - KaTeX is significantly faster than MathJax
- **High Quality** - Print-quality typesetting
- **Wide Symbol Support** - Most LaTeX math symbols supported
- **Custom Macros** - Define reusable math macros

## Supported Math

- Basic arithmetic and algebra
- Fractions and roots
- Greek letters and symbols
- Integrals and derivatives
- Summations and products
- Matrices and arrays
- Equations and alignments
- Set notation and logic
- Trigonometric functions
- Chemical equations (with mhchem)

## Assets

The plugin loads KaTeX from CDN:
- **CSS**: `katex@0.16.9/dist/katex.min.css`
- **JS**: `katex@0.16.9/dist/katex.min.js`
- **JS**: `katex@0.16.9/dist/contrib/auto-render.min.js`

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `displayMode` | `true` | Display math in block mode |
| `throwOnError` | `false` | Throw exceptions on parse errors |
| `strict` | `false` | Strict parsing mode |
| `trust` | `false` | Trust HTML in LaTeX (security) |
| `macros` | `{}` | Custom LaTeX macros |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+M` | Insert inline math |
| `Ctrl+Shift+M` | Insert display math |
| `Cmd+M` (Mac) | Insert inline math |
| `Cmd+Shift+M` (Mac) | Insert display math |

## Toolbar Integration

The plugin adds a "Math" group to the toolbar with buttons for:
- Insert inline math
- Insert display math (block)

## Conflicts

This plugin conflicts with `mathjax`. Only one math rendering plugin can be active at a time.

## Requirements

- MD++ Editor version 1.0.0 or higher
- Internet connection (for loading KaTeX from CDN)

## External Resources

- [KaTeX Documentation](https://katex.org/docs/supported.html)
- [KaTeX Function Support](https://katex.org/docs/support_table.html)
- [LaTeX Mathematics Wiki](https://en.wikibooks.org/wiki/LaTeX/Mathematics)
