# Bootstrap Components Syntax Reference

## Basic Directive Syntax

All Bootstrap components use the MD++ directive syntax:

```markdown
:::bootstrap:component-name{attributes}
Content here
:::
```

---

## Layout Components

### Container

Standard centered container with responsive max-widths.

```markdown
:::bootstrap:container
Content with responsive max-width
:::
```

#### Variants

| Variant | Description |
|---------|-------------|
| `fluid` | Full-width container |
| `sm` | 100% width until small breakpoint |
| `md` | 100% width until medium breakpoint |
| `lg` | 100% width until large breakpoint |
| `xl` | 100% width until extra large breakpoint |

```markdown
:::bootstrap:container{variant="fluid"}
Full-width content
:::
```

### Grid System (Row & Col)

Bootstrap's 12-column responsive grid.

```markdown
:::bootstrap:row
:::bootstrap:col{variant="6"}
Half width (6 of 12 columns)
:::

:::bootstrap:col{variant="6"}
Half width (6 of 12 columns)
:::
:::
```

#### Column Variants

| Variant | Width |
|---------|-------|
| `1` - `12` | Specific column span |
| `auto` | Auto-width based on content |

```markdown
:::bootstrap:row
:::bootstrap:col{variant="4"}
One third
:::

:::bootstrap:col{variant="8"}
Two thirds
:::
:::
```

---

## Cards

Flexible content container with header, body, and footer.

### Basic Card

```markdown
:::bootstrap:card
:::bootstrap:card-body
This is a basic card with just a body.
:::
:::
```

### Card with Header and Footer

```markdown
:::bootstrap:card
:::bootstrap:card-header
Card Header
:::

:::bootstrap:card-body
Card body content goes here. You can include
any Markdown content inside.
:::

:::bootstrap:card-footer
Card Footer
:::
:::
```

### Nested Content

```markdown
:::bootstrap:card
:::bootstrap:card-body
## Card Title

This card contains:
- Markdown headings
- Lists
- And other content

```javascript
// Even code blocks!
console.log("Hello");
```
:::
:::
```

---

## Alerts

Contextual feedback messages.

### Basic Alert

```markdown
:::bootstrap:alert{variant="primary"}
This is a primary alert.
:::
```

### All Alert Variants

```markdown
:::bootstrap:alert{variant="primary"}
A primary alert - check it out!
:::

:::bootstrap:alert{variant="secondary"}
A secondary alert - check it out!
:::

:::bootstrap:alert{variant="success"}
A success alert - well done!
:::

:::bootstrap:alert{variant="danger"}
A danger alert - be careful!
:::

:::bootstrap:alert{variant="warning"}
A warning alert - pay attention!
:::

:::bootstrap:alert{variant="info"}
An info alert - for your information.
:::

:::bootstrap:alert{variant="light"}
A light alert - subtle message.
:::

:::bootstrap:alert{variant="dark"}
A dark alert - serious message.
:::
```

### Alert with Markdown Content

```markdown
:::bootstrap:alert{variant="success"}
## Success!

Your file was saved successfully.

**Next steps:**
1. Review the changes
2. Share with your team
:::
```

---

## Badges

Small count and labeling component.

### Basic Badges

```markdown
:::bootstrap:badge{variant="primary"}
Primary
:::

:::bootstrap:badge{variant="secondary"}
Secondary
:::

:::bootstrap:badge{variant="success"}
Success
:::

:::bootstrap:badge{variant="danger"}
Danger
:::

:::bootstrap:badge{variant="warning"}
Warning
:::

:::bootstrap:badge{variant="info"}
Info
:::
```

### Inline Usage

```markdown
New messages :::bootstrap:badge{variant="danger"}5:::
```

---

## Buttons

Interactive button elements.

### Basic Buttons

```markdown
:::bootstrap:button{variant="primary"}
Primary Button
:::

:::bootstrap:button{variant="secondary"}
Secondary
:::

:::bootstrap:button{variant="success"}
Success
:::

:::bootstrap:button{variant="danger"}
Danger
:::

:::bootstrap:button{variant="warning"}
Warning
:::

:::bootstrap:button{variant="info"}
Info
:::
```

### Outline Buttons

```markdown
:::bootstrap:button{variant="outline-primary"}
Outline Primary
:::

:::bootstrap:button{variant="outline-secondary"}
Outline Secondary
:::
```

---

## Accordion

Collapsible content panels.

### Basic Accordion

```markdown
:::bootstrap:accordion
:::bootstrap:accordion-item
### Section 1
Content for the first section.
:::

:::bootstrap:accordion-item
### Section 2
Content for the second section.
:::

:::bootstrap:accordion-item
### Section 3
Content for the third section.
:::
:::
```

---

## List Groups

Flexible component for displaying lists.

### Basic List Group

```markdown
:::bootstrap:list-group
:::bootstrap:list-group-item
First item
:::

:::bootstrap:list-group-item
Second item
:::

:::bootstrap:list-group-item
Third item
:::
:::
```

---

## Spinners

Loading indicators.

### Border Spinner

```markdown
:::bootstrap:spinner{variant="primary"}
Loading...
:::
```

### Grow Spinner

```markdown
:::bootstrap:spinner{variant="grow"}
Loading...
:::
```

### Color Variants

```markdown
:::bootstrap:spinner{variant="primary"}:::
:::bootstrap:spinner{variant="secondary"}:::
:::bootstrap:spinner{variant="success"}:::
:::bootstrap:spinner{variant="danger"}:::
```

---

## Progress Bars

Display progress indicators.

### Basic Progress

```markdown
:::bootstrap:progress
:::bootstrap:progress-bar{style="width: 50%"}
50%
:::
:::
```

### Colored Progress

```markdown
:::bootstrap:progress
:::bootstrap:progress-bar{variant="success" style="width: 75%"}
75%
:::
:::
```

### Striped and Animated

```markdown
:::bootstrap:progress
:::bootstrap:progress-bar{variant="striped" style="width: 60%"}
60%
:::
:::

:::bootstrap:progress
:::bootstrap:progress-bar{variant="animated" style="width: 80%"}
80%
:::
:::
```

---

## Modals

Dialog boxes and popups.

### Basic Modal Structure

```markdown
:::bootstrap:modal{id="exampleModal"}
:::bootstrap:modal-dialog
:::bootstrap:modal-content
:::bootstrap:modal-header
## Modal Title
:::

:::bootstrap:modal-body
This is the modal body content.
:::

:::bootstrap:modal-footer
:::bootstrap:button{variant="secondary" data-bs-dismiss="modal"}
Close
:::
:::bootstrap:button{variant="primary"}
Save changes
:::
:::
:::
:::
:::
```

### Modal Sizes

| Variant | Size |
|---------|------|
| `sm` | Small (300px) |
| `lg` | Large (800px) |
| `xl` | Extra large (1140px) |

```markdown
:::bootstrap:modal{variant="lg"}
Large modal content
:::
```

---

## Tabs

Tabbed navigation interface.

### Basic Tabs

```markdown
:::bootstrap:tabs
:::bootstrap:tab-pane{variant="active" id="home"}
### Home
Content for the home tab.
:::

:::bootstrap:tab-pane{id="profile"}
### Profile
Content for the profile tab.
:::

:::bootstrap:tab-pane{id="contact"}
### Contact
Content for the contact tab.
:::
:::
```

---

## Tables

Styled data tables.

### Basic Table

```markdown
:::bootstrap:table
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

### Table Variants

```markdown
:::bootstrap:table{variant="striped"}
Striped rows for better readability.
:::

:::bootstrap:table{variant="bordered"}
Borders on all sides.
:::

:::bootstrap:table{variant="hover"}
Highlight rows on hover.
:::

:::bootstrap:table{variant="dark"}
Dark themed table.
:::

:::bootstrap:table{variant="sm"}
Compact table with less padding.
:::
```

---

## Dropdowns

Toggle contextual overlays.

### Basic Dropdown

```markdown
:::bootstrap:dropdown
:::bootstrap:dropdown-toggle{variant="primary"}
Dropdown
:::

:::bootstrap:dropdown-menu
:::bootstrap:dropdown-item
Action 1
:::
:::bootstrap:dropdown-item
Action 2
:::
:::bootstrap:dropdown-item
Action 3
:::
:::
:::
```

---

## Toasts

Push notifications.

```markdown
:::bootstrap:toast
:::bootstrap:toast-header
**Notification**
just now
:::

:::bootstrap:toast-body
Hello! This is a toast message.
:::
:::
```

---

## Navbar

Navigation bars.

### Basic Navbar

```markdown
:::bootstrap:navbar{variant="dark"}
:::bootstrap:container
:::bootstrap:navbar-brand
My App
:::

:::bootstrap:nav
:::bootstrap:nav-item
:::bootstrap:nav-link
Home
:::
:::

:::bootstrap:nav-item
:::bootstrap:nav-link
About
:::
:::

:::bootstrap:nav-item
:::bootstrap:nav-link
Contact
:::
:::
:::
:::
:::
```

### Navbar Variants

| Variant | Description |
|---------|-------------|
| `light` | Light background with dark text |
| `dark` | Dark background with light text |
| `expand-lg` | Expand at large breakpoint |
| `expand-md` | Expand at medium breakpoint |
| `fixed-top` | Fixed at top of viewport |
| `fixed-bottom` | Fixed at bottom of viewport |

---

## Carousel

Image slideshow.

```markdown
:::bootstrap:carousel{id="myCarousel"}
:::bootstrap:carousel-inner
:::bootstrap:carousel-item{variant="active"}
![First slide](image1.jpg)
:::

:::bootstrap:carousel-item
![Second slide](image2.jpg)
:::

:::bootstrap:carousel-item
![Third slide](image3.jpg)
:::
:::
:::
```

### Fade Transition

```markdown
:::bootstrap:carousel{variant="fade"}
...
:::
```

---

## Breadcrumbs

Navigation hierarchy.

```markdown
:::bootstrap:breadcrumb
:::bootstrap:breadcrumb-list
:::bootstrap:breadcrumb-item
Home
:::

:::bootstrap:breadcrumb-item
Library
:::

:::bootstrap:breadcrumb-item{variant="active"}
Data
:::
:::
:::
```

---

## Offcanvas

Sidebar overlay panels.

```markdown
:::bootstrap:offcanvas{variant="start" id="sidebar"}
:::bootstrap:offcanvas-header
## Menu
:::

:::bootstrap:offcanvas-body
Sidebar content here.
:::
:::
```

### Offcanvas Positions

| Variant | Position |
|---------|----------|
| `start` | Left side |
| `end` | Right side |
| `top` | Top |
| `bottom` | Bottom |

---

## Forms

Form components.

### Form Group

```markdown
:::bootstrap:form-group
:::bootstrap:form-label
Email address
:::

:::bootstrap:form-control{type="email" placeholder="Enter email"}
:::
:::
```

### Form Control Sizes

```markdown
:::bootstrap:form-control{variant="lg"}
Large input
:::

:::bootstrap:form-control{variant="sm"}
Small input
:::
```

---

## Complete Examples

### Card Grid Layout

```markdown
:::bootstrap:container
:::bootstrap:row
:::bootstrap:col{variant="4"}
:::bootstrap:card
:::bootstrap:card-body
## Feature 1
Description of feature 1.
:::
:::
:::

:::bootstrap:col{variant="4"}
:::bootstrap:card
:::bootstrap:card-body
## Feature 2
Description of feature 2.
:::
:::
:::

:::bootstrap:col{variant="4"}
:::bootstrap:card
:::bootstrap:card-body
## Feature 3
Description of feature 3.
:::
:::
:::
:::
:::
```

### Dashboard Panel

```markdown
:::bootstrap:card
:::bootstrap:card-header
:::bootstrap:badge{variant="success"}Active:::
Dashboard
:::

:::bootstrap:card-body
:::bootstrap:alert{variant="info"}
Welcome back! You have 5 new notifications.
:::

:::bootstrap:progress
:::bootstrap:progress-bar{variant="primary" style="width: 75%"}
75% Complete
:::
:::
:::

:::bootstrap:card-footer
:::bootstrap:button{variant="primary"}
View Details
:::
:::
:::
```

---

## Best Practices

1. **Use the grid** - Leverage rows and columns for responsive layouts
2. **Semantic variants** - Use colors meaningfully (success for positive, danger for errors)
3. **Don't over-nest** - Keep component nesting to 3-4 levels max
4. **Mobile first** - Test layouts at different screen sizes
5. **Accessibility** - Use proper heading hierarchy inside components
