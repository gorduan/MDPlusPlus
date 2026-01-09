# Material Design Icons Plugin

## Overview

The Material Design Icons plugin integrates Google's Material Design icon library into MD++. Use simple image-like syntax to insert icons anywhere in your Markdown documents. Icons are rendered using the official Material Icons web font.

## Features

- **5000+ Icons** - Full Material Design icon set
- **5 Style Variants** - Filled, Outlined, Round, Sharp, Two-Tone
- **4 Size Options** - Small, Medium, Large, Extra Large
- **Simple Syntax** - Use familiar image syntax `![](google:icon-name)`
- **Semantic Names** - Use descriptive icon names
- **Web Font Rendering** - Crisp icons at any size

## Icon Styles

| Style | Description | Class |
|-------|-------------|-------|
| Filled (default) | Solid filled icons | `material-icons` |
| Outlined | Outline/stroke style | `material-icons-outlined` |
| Round | Rounded corners | `material-icons-round` |
| Sharp | Sharp corners | `material-icons-sharp` |
| Two-Tone | Two-color style | `material-icons-two-tone` |

## Icon Sizes

| Size | Pixels | Class |
|------|--------|-------|
| Small | 18px | `md-18` |
| Medium (default) | 24px | `md-24` |
| Large | 36px | `md-36` |
| Extra Large | 48px | `md-48` |

## Common Icons

The plugin includes quick access to commonly used icons:

**Navigation**: home, search, menu, close, arrow_back, arrow_forward

**Actions**: settings, delete, edit, add, remove, check, save, send

**Communication**: mail, notifications, share, comment, forum

**Media**: play_arrow, pause, stop, volume_up, image, videocam

**Files**: folder, file_copy, attach_file, download, upload

**User**: person, account_circle, face, group, lock

**Status**: info, warning, error, help, check_circle

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `defaultStyle` | `filled` | Default icon style |
| `defaultSize` | `24px` | Default icon size |
| `customClass` | `""` | Additional CSS class |

## Assets

The plugin loads Material Icons fonts from Google Fonts:
- Material Icons (filled)
- Material Icons Outlined
- Material Icons Round
- Material Icons Sharp
- Material Icons Two Tone

## Requirements

- MD++ Editor version 1.0.0 or higher
- Internet connection (for loading fonts from Google)

## External Resources

- [Material Icons Library](https://fonts.google.com/icons)
- [Material Design Guidelines](https://material.io/design/iconography/)
- [Icon Search Tool](https://fonts.google.com/icons?selected=Material+Icons)
