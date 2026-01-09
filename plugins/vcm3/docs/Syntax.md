# VCM3 Components Syntax Reference

## Basic Directive Syntax

Use MD++ directive syntax with the `vcm3` framework prefix:

```markdown
:::vcm3:component-name{attributes}
Content here
:::
```

---

## Cards

Versatile content containers with optional header, body, and footer.

### Basic Card

```markdown
:::vcm3:card
## Card Title

Card content goes here with any Markdown.
:::
```

### Card with Structure

```markdown
:::vcm3:card
:::vcm3:card-header
Card Header Text
:::

:::vcm3:card-body
Main content of the card.
:::

:::vcm3:card-footer
Footer content (actions, links, etc.)
:::
:::
```

### Card Styling

Cards render with:
- Rounded corners (lg)
- Border
- Padding (4)
- Shadow (sm)
- Background from `--bg-card`

---

## Alerts

Notification and feedback messages.

### Alert Variants

```markdown
:::vcm3:alert{variant="info"}
This is informational content.
:::

:::vcm3:alert{variant="success"}
Operation completed successfully!
:::

:::vcm3:alert{variant="warning"}
Please be careful with this action.
:::

:::vcm3:alert{variant="error"}
An error has occurred.
:::

:::vcm3:alert{variant="default"}
This is a neutral message.
:::
```

### Alert Colors

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `info` | Blue-50 | Blue-800 | Blue-200 |
| `success` | Green-50 | Green-800 | Green-200 |
| `warning` | Yellow-50 | Yellow-800 | Yellow-200 |
| `error` | Red-50 | Red-800 | Red-200 |
| `default` | Muted | Muted-foreground | Border |

### Alert Styling

Alerts include:
- Rounded corners (md)
- Padding (4)
- Flex layout with gap
- Border with variant color

---

## Callouts

Highlighted information blocks with left border accent.

### Basic Callout

```markdown
:::vcm3:callout
This is important information that needs attention.
:::
```

### Callout with Title

```markdown
:::vcm3:callout
:::vcm3:callout-title
Pro Tip
:::

:::vcm3:callout-content
Use callouts for important information that shouldn't be missed.
:::
:::
```

### Callout Styling

Callouts render with:
- Left border (4px, primary color)
- Background with primary/5 opacity
- Rounded right corners (md)
- Padding (4)

---

## Code Blocks

Styled code containers for displaying code.

### Basic Code

```markdown
:::vcm3:code
function greet(name) {
  return `Hello, ${name}!`;
}
:::
```

### Code Styling

Code blocks include:
- Dark background (zinc-900)
- Light text (zinc-100)
- Rounded corners (md)
- Padding (4)
- Monospace font
- Small text size
- Horizontal scroll

---

## Tabs

Tabbed interface for organizing content.

### Basic Tabs

```markdown
:::vcm3:tabs
:::vcm3:tab{title="Overview"}
Overview content here.
:::

:::vcm3:tab{title="Installation"}
Installation instructions here.
:::

:::vcm3:tab{title="Usage"}
Usage examples here.
:::
:::
```

### Tab Styling

Tab container:
- Border
- Rounded corners (lg)

Tab panels:
- Padding (4)

---

## Accordions

Collapsible content sections.

### Basic Accordion

```markdown
:::vcm3:accordion
:::vcm3:accordion-item{title="Section 1"}
Content for section 1.
:::

:::vcm3:accordion-item{title="Section 2"}
Content for section 2.
:::

:::vcm3:accordion-item{title="Section 3"}
Content for section 3.
:::
:::
```

### Accordion Styling

Accordion container:
- Border
- Rounded corners (lg)
- Divided items

Accordion items:
- Collapsible on click
- Smooth animation

---

## Badges

Small labels and tags.

### Badge Variants

```markdown
:::vcm3:badge{variant="default"}
Default
:::

:::vcm3:badge{variant="secondary"}
Secondary
:::

:::vcm3:badge{variant="success"}
Success
:::

:::vcm3:badge{variant="warning"}
Warning
:::

:::vcm3:badge{variant="error"}
Error
:::
```

### Badge Colors

| Variant | Background | Text |
|---------|------------|------|
| `default` | Primary | Primary-foreground |
| `secondary` | Secondary | Secondary-foreground |
| `success` | Green-100 | Green-800 |
| `warning` | Yellow-100 | Yellow-800 |
| `error` | Red-100 | Red-800 |

### Badge Styling

Badges include:
- Inline-flex display
- Centered alignment
- Horizontal padding (2.5)
- Vertical padding (0.5)
- Rounded-full (pill)
- Extra small text
- Medium font weight

---

## Buttons

Interactive button elements.

### Button Variants

```markdown
:::vcm3:button{variant="default"}
Default Button
:::

:::vcm3:button{variant="secondary"}
Secondary Button
:::

:::vcm3:button{variant="outline"}
Outline Button
:::

:::vcm3:button{variant="ghost"}
Ghost Button
:::
```

### Button Colors

| Variant | Background | Hover |
|---------|------------|-------|
| `default` | Primary | Primary/90 |
| `secondary` | Secondary | Secondary/80 |
| `outline` | Transparent + Border | Accent |
| `ghost` | Transparent | Accent |

### Button Styling

Buttons include:
- Inline-flex display
- Centered content
- Rounded corners (md)
- Horizontal padding (4)
- Vertical padding (2)
- Small text
- Medium font weight
- Smooth color transition

---

## Feature Cards

Showcase cards for features or products.

### Basic Feature

```markdown
:::vcm3:feature
:::vcm3:feature-icon
🚀
:::

:::vcm3:feature-title
Lightning Fast
:::

:::vcm3:feature-description
Optimized performance for instant response times.
:::
:::
```

### Feature Styling

Feature cards include:
- Padding (6)
- Rounded corners (lg)
- Border
- Card background
- Hover shadow effect
- Smooth transition

Feature structure:
- Icon: Primary color, bottom margin (4)
- Title: Semibold, large text, bottom margin (2)
- Description: Muted text, small size

---

## Grid Layouts

Responsive grid systems.

### Grid Variants

```markdown
:::vcm3:grid{variant="2"}
Column 1
Column 2
:::

:::vcm3:grid{variant="3"}
Column 1
Column 2
Column 3
:::

:::vcm3:grid{variant="4"}
Column 1
Column 2
Column 3
Column 4
:::
```

### Grid Styling

Grids include:
- CSS Grid display
- Gap (4) between items
- Responsive column variants

---

## AI Context Blocks

Hidden content visible only to AI assistants.

### Basic AI Context

```markdown
:::vcm3:ai-context
This content is hidden from human readers but visible to AI.

Use this for:
- Providing context for AI assistants
- Including metadata
- Storing structured information
:::
```

### AI Context Properties

AI context blocks are:
- `hidden: true` - Not visible in preview
- `aiVisible: true` - Parsed by AI assistants
- Useful for AI-assisted workflows

### Use Cases

```markdown
:::vcm3:ai-context
## Context for AI

This document is about: Product documentation
Target audience: Developers
Key concepts: API, Integration, Authentication

When responding to questions about this document:
1. Focus on practical examples
2. Include code snippets
3. Reference the official API docs
:::

## Getting Started

Visible content for users...
```

---

## Complete Examples

### Product Feature Showcase

```markdown
:::vcm3:grid{variant="3"}
:::vcm3:feature
:::vcm3:feature-icon
⚡
:::
:::vcm3:feature-title
Fast Performance
:::
:::vcm3:feature-description
Optimized for speed with minimal load times.
:::
:::

:::vcm3:feature
:::vcm3:feature-icon
🔒
:::
:::vcm3:feature-title
Secure by Default
:::
:::vcm3:feature-description
Enterprise-grade security built into every layer.
:::
:::

:::vcm3:feature
:::vcm3:feature-icon
🌍
:::
:::vcm3:feature-title
Global Scale
:::
:::vcm3:feature-description
Deploy anywhere with worldwide infrastructure.
:::
:::
:::
```

### Documentation Page

```markdown
:::vcm3:callout
:::vcm3:callout-title
Before You Begin
:::
:::vcm3:callout-content
Make sure you have completed the [prerequisites](#).
:::
:::

:::vcm3:tabs
:::vcm3:tab{title="npm"}
:::vcm3:code
npm install @example/sdk
:::
:::

:::vcm3:tab{title="yarn"}
:::vcm3:code
yarn add @example/sdk
:::
:::

:::vcm3:tab{title="pnpm"}
:::vcm3:code
pnpm add @example/sdk
:::
:::
:::

:::vcm3:alert{variant="success"}
Installation complete! Proceed to the next section.
:::
```

### FAQ Accordion

```markdown
:::vcm3:card
## Frequently Asked Questions

:::vcm3:accordion
:::vcm3:accordion-item{title="How do I get started?"}
Follow our [Getting Started Guide](#) for step-by-step instructions.
:::

:::vcm3:accordion-item{title="What are the system requirements?"}
- Node.js 18 or higher
- 4GB RAM minimum
- Modern web browser
:::

:::vcm3:accordion-item{title="Is there a free tier?"}
Yes! Our free tier includes all core features with usage limits.
See [Pricing](#) for details.
:::

:::vcm3:accordion-item{title="How do I get support?"}
- Community Discord
- GitHub Issues
- Email support for Pro users
:::
:::
:::
```

### Status Dashboard

```markdown
:::vcm3:card
:::vcm3:card-header
System Status — All Systems Operational
:::

:::vcm3:card-body
:::vcm3:grid{variant="2"}

**API Gateway**
:::vcm3:badge{variant="success"}Operational:::

**Database**
:::vcm3:badge{variant="success"}Operational:::

**CDN**
:::vcm3:badge{variant="warning"}Degraded:::

**Auth Service**
:::vcm3:badge{variant="success"}Operational:::

:::
:::

:::vcm3:card-footer
Last updated: 2 minutes ago
:::
:::
```

---

## AI-Assisted Workflow Example

```markdown
:::vcm3:ai-context
Document metadata:
- Type: Tutorial
- Difficulty: Beginner
- Est. time: 15 minutes
- Prerequisites: Basic JavaScript knowledge

AI instructions:
- Provide simple, clear explanations
- Include runnable code examples
- Suggest next steps at the end
:::

# Building Your First App

:::vcm3:callout
:::vcm3:callout-title
What You'll Learn
:::
:::vcm3:callout-content
By the end of this tutorial, you'll be able to create a basic app.
:::
:::

## Step 1: Setup

:::vcm3:code
npm create my-app
cd my-app
npm install
:::

:::vcm3:alert{variant="info"}
The setup process takes about 1 minute.
:::

## Step 2: Run

:::vcm3:code
npm run dev
:::

:::vcm3:alert{variant="success"}
Your app is now running at http://localhost:3000
:::
```

---

## Best Practices

1. **Use semantic components** - Choose the right component for the content type
2. **Leverage AI context** - Provide helpful context for AI workflows
3. **Keep nesting shallow** - 2-3 levels maximum
4. **Use design tokens** - Rely on CSS custom properties for theming
5. **Test both themes** - Verify appearance in light and dark modes
6. **Structure content** - Use proper header/body/footer for cards
7. **Accessible content** - Ensure content is accessible without JS
