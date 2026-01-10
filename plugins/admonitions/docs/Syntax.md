# Admonitions Syntax Reference

## Basic Syntax (GitHub/Obsidian Style)

Admonitions use blockquote syntax with a type identifier:

```markdown
> [!NOTE]
> This is a note callout.
```

**Result:**

> [!NOTE]
> This is a note callout.

The type identifier is case-insensitive: `[!NOTE]`, `[!Note]`, and `[!note]` are equivalent.

---

## All Admonition Types

### Note

Informational content that supplements the main text.

```markdown
> [!NOTE]
> This is general information that might be helpful.
```

**Result:**

> [!NOTE]
> This is general information that might be helpful.

### Info

Additional details and supplementary information.

```markdown
> [!INFO]
> Here are some extra details about this topic.
```

**Result:**

> [!INFO]
> Here are some extra details about this topic.

### Tip

Helpful suggestions and best practices.

```markdown
> [!TIP]
> Use keyboard shortcuts to work faster!
```

**Result:**

> [!TIP]
> Use keyboard shortcuts to work faster!

### Hint

Subtle guidance (alias for tip, same styling).

```markdown
> [!HINT]
> Try hovering over the icon for more options.
```

**Result:**

> [!HINT]
> Try hovering over the icon for more options.

### Important

Key information that shouldn't be overlooked.

```markdown
> [!IMPORTANT]
> Make sure to save your work before closing.
```

**Result:**

> [!IMPORTANT]
> Make sure to save your work before closing.

### Warning

Potential issues or things to be careful about.

```markdown
> [!WARNING]
> This action cannot be undone.
```

**Result:**

> [!WARNING]
> This action cannot be undone.

### Caution

Situations requiring careful consideration (alias for warning).

```markdown
> [!CAUTION]
> Proceed with care when editing configuration files.
```

**Result:**

> [!CAUTION]
> Proceed with care when editing configuration files.

### Danger

Critical warnings about serious consequences.

```markdown
> [!DANGER]
> Do not delete this file! It is required for the system to function.
```

**Result:**

> [!DANGER]
> Do not delete this file! It is required for the system to function.

### Error

Error states or failure conditions (alias for danger).

```markdown
> [!ERROR]
> The operation failed due to insufficient permissions.
```

**Result:**

> [!ERROR]
> The operation failed due to insufficient permissions.

### Success

Positive outcomes and confirmations.

```markdown
> [!SUCCESS]
> Your changes have been saved successfully.
```

**Result:**

> [!SUCCESS]
> Your changes have been saved successfully.

### Question

Questions, FAQs, or inquiries.

```markdown
> [!QUESTION]
> How do I reset my password?
```

**Result:**

> [!QUESTION]
> How do I reset my password?

### Quote

Quotations and citations.

```markdown
> [!QUOTE]
> "The only way to do great work is to love what you do."
> — Steve Jobs
```

**Result:**

> [!QUOTE]
> "The only way to do great work is to love what you do."
> — Steve Jobs

### Example

Examples and sample code.

```markdown
> [!EXAMPLE]
> Here's how to use the function:
> ```javascript
> const result = myFunction(42);
> ```
```

**Result:**

> [!EXAMPLE]
> Here's how to use the function:
> ```javascript
> const result = myFunction(42);
> ```

### Abstract

Summaries and TL;DR content.

```markdown
> [!ABSTRACT]
> This document describes the new plugin architecture,
> including configuration options and migration steps.
```

**Result:**

> [!ABSTRACT]
> This document describes the new plugin architecture,
> including configuration options and migration steps.

### Bug

Known issues and bugs.

```markdown
> [!BUG]
> There is a known issue with Safari where the dropdown
> may not render correctly. A fix is in progress.
```

**Result:**

> [!BUG]
> There is a known issue with Safari where the dropdown
> may not render correctly. A fix is in progress.

---

## Custom Titles

Override the default title by adding text after the type:

```markdown
> [!NOTE] My Custom Title
> This note has a custom title instead of "Note".
```

**Result:**

> [!NOTE] My Custom Title
> This note has a custom title instead of "Note".

```markdown
> [!WARNING] Security Notice
> Please update your password regularly.
```

**Result:**

> [!WARNING] Security Notice
> Please update your password regularly.

```markdown
> [!TIP] Pro Tip
> You can combine multiple shortcuts for complex actions.
```

**Result:**

> [!TIP] Pro Tip
> You can combine multiple shortcuts for complex actions.

---

## Collapsible Admonitions

Add `+` or `-` after the type to make the callout collapsible:

### Expanded by Default (+)

```markdown
> [!NOTE]+
> This callout is collapsible and starts expanded.
> Click the header to collapse it.
```

**Result:**

> [!NOTE]+
> This callout is collapsible and starts expanded.
> Click the header to collapse it.

### Collapsed by Default (-)

```markdown
> [!NOTE]-
> This callout is collapsible and starts collapsed.
> Click the header to expand it.
```

**Result:**

> [!NOTE]-
> This callout is collapsible and starts collapsed.
> Click the header to expand it.

### With Custom Title

```markdown
> [!FAQ]- Click to see the answer
> The answer to your question is here,
> hidden until you click the header.
```

**Result:**

> [!FAQ]- Click to see the answer
> The answer to your question is here,
> hidden until you click the header.

---

## Multi-line Content

Continue the blockquote for multi-line content:

```markdown
> [!NOTE]
> This is the first paragraph of the note.
>
> This is the second paragraph. You can include
> as many paragraphs as needed.
>
> - You can also include lists
> - With multiple items
>
> And even code blocks or other Markdown.
```

**Result:**

> [!NOTE]
> This is the first paragraph of the note.
>
> This is the second paragraph. You can include
> as many paragraphs as needed.
>
> - You can also include lists
> - With multiple items
>
> And even code blocks or other Markdown.

---

## Nested Markdown

Admonitions support full Markdown syntax inside:

### With Code

```markdown
> [!TIP]
> Use the following command to install:
> ```bash
> npm install mdplusplus
> ```
```

**Result:**

> [!TIP]
> Use the following command to install:
> ```bash
> npm install mdplusplus
> ```

### With Links

```markdown
> [!NOTE]
> For more information, see the [official documentation](https://example.com).
```

**Result:**

> [!NOTE]
> For more information, see the [official documentation](https://example.com).

### With Lists

```markdown
> [!IMPORTANT]
> Before you begin, ensure you have:
> 1. Node.js 18 or higher
> 2. npm or pnpm
> 3. A text editor
```

**Result:**

> [!IMPORTANT]
> Before you begin, ensure you have:
> 1. Node.js 18 or higher
> 2. npm or pnpm
> 3. A text editor

### With Images

```markdown
> [!EXAMPLE]
> Here's what the result looks like:
> ![Screenshot](./images/screenshot.png)
```

**Result:**

> [!EXAMPLE]
> Here's what the result looks like:
> ![Screenshot](./images/screenshot.png)

### With Tables

```markdown
> [!NOTE]
> Here are the supported options:
>
> | Option | Type | Default |
> |--------|------|---------|
> | theme  | string | "dark" |
> | size   | number | 24 |
```

**Result:**

> [!NOTE]
> Here are the supported options:
>
> | Option | Type | Default |
> |--------|------|---------|
> | theme  | string | "dark" |
> | size   | number | 24 |

---

## Nested Admonitions

You can nest admonitions inside each other (limited depth):

```markdown
> [!NOTE]
> This is an outer note.
>
> > [!WARNING]
> > This is a nested warning inside the note.
```

**Result:**

> [!NOTE]
> This is an outer note.
>
> > [!WARNING]
> > This is a nested warning inside the note.

---

## Directive Syntax (Alternative)

MD++ also supports directive syntax for admonitions:

### Basic Directive

```markdown
:::note
This is a note using directive syntax.
:::
```

**Result:**

:::note
This is a note using directive syntax.
:::

### With Variant

```markdown
:::admonition{variant="warning"}
This is a warning using the generic admonition directive.
:::
```

**Result:**

:::admonition{variant="warning"}
This is a warning using the generic admonition directive.
:::

### With Title

```markdown
:::tip{title="Pro Tip"}
This is a tip with a custom title.
:::
```

**Result:**

:::tip{title="Pro Tip"}
This is a tip with a custom title.
:::

### Collapsible Directive

```markdown
:::note{collapsible collapsed}
This note starts collapsed.
:::
```

**Result:**

:::note{collapsible collapsed}
This note starts collapsed.
:::

---

## Type Aliases

Some types are aliases for others (same styling, different names):

| Type | Alias For | Styling |
|------|-----------|---------|
| `hint` | `tip` | Green, lightbulb icon |
| `caution` | `warning` | Yellow, triangle icon |
| `error` | `danger` | Red, times icon |

---

## Styling Classes

Each admonition type generates specific CSS classes:

| Type | CSS Classes |
|------|-------------|
| `note` | `.admonition .admonition-note` |
| `info` | `.admonition .admonition-info` |
| `tip` | `.admonition .admonition-tip` |
| `warning` | `.admonition .admonition-warning` |
| `danger` | `.admonition .admonition-danger` |
| `success` | `.admonition .admonition-success` |
| `question` | `.admonition .admonition-question` |
| `quote` | `.admonition .admonition-quote` |
| `example` | `.admonition .admonition-example` |
| `abstract` | `.admonition .admonition-abstract` |
| `bug` | `.admonition .admonition-bug` |

---

## Complete Examples

### Documentation Page

```markdown
# Getting Started

> [!NOTE]
> This guide assumes you have basic knowledge of Markdown.

## Installation

> [!IMPORTANT]
> Make sure Node.js is installed before proceeding.

Run the following command:

```bash
npm install mdplusplus
```

> [!SUCCESS]
> Installation complete! You're ready to start.

## Configuration

> [!TIP]
> Create a `config.json` file in your project root.

> [!WARNING]
> Never commit sensitive data to version control.

## Troubleshooting

> [!QUESTION]- Why isn't my plugin loading?
> Check that the plugin is in the correct folder format:
> `plugins/plugin-name/plugin.json`

> [!BUG]
> Known issue: Hot reload may not work on Windows.
> Workaround: Restart the application.
```

**Result:**

> [!NOTE]
> This guide assumes you have basic knowledge of Markdown.

> [!IMPORTANT]
> Make sure Node.js is installed before proceeding.

> [!SUCCESS]
> Installation complete! You're ready to start.

> [!TIP]
> Create a `config.json` file in your project root.

> [!WARNING]
> Never commit sensitive data to version control.

> [!QUESTION]- Why isn't my plugin loading?
> Check that the plugin is in the correct folder format:
> `plugins/plugin-name/plugin.json`

> [!BUG]
> Known issue: Hot reload may not work on Windows.
> Workaround: Restart the application.

### Tutorial with Steps

```markdown
> [!ABSTRACT]
> In this tutorial, you'll learn how to create your first diagram.

## Step 1: Create a File

> [!TIP]
> Use the `.mdpp` extension for MD++ enhanced features.

## Step 2: Add Content

> [!EXAMPLE]
> ```markdown
> # My First Document
> Hello, world!
> ```

## Step 3: Preview

> [!SUCCESS]
> Your document is now ready to preview!

> [!DANGER]
> Do not close the window while saving is in progress.
```

**Result:**

> [!ABSTRACT]
> In this tutorial, you'll learn how to create your first diagram.

> [!TIP]
> Use the `.mdpp` extension for MD++ enhanced features.

> [!EXAMPLE]
> ```markdown
> # My First Document
> Hello, world!
> ```

> [!SUCCESS]
> Your document is now ready to preview!

> [!DANGER]
> Do not close the window while saving is in progress.

---

## Best Practices

1. **Use sparingly** - Too many callouts reduce their impact
2. **Choose the right type** - Match the type to the content's importance
3. **Keep content focused** - One main point per callout
4. **Use custom titles** - When the default title isn't descriptive enough
5. **Consider collapsibility** - Use for optional or supplementary information
6. **Maintain consistency** - Use the same type for similar content throughout
