# Bootstrap Components Syntax Reference

## Basic Directive Syntax

All Bootstrap components use the MD++ directive syntax:

```markdown
:::bootstrap:component-name{attributes}
Content here
:::
```

**Result:**

:::bootstrap:alert{variant="info"}
This is a Bootstrap component rendered in MD++
:::

---

## Important: Nesting Limitation

The current parser supports **single-level nesting only**. For complex layouts, use separate components or HTML directly.

---

## Layout Components

### Container

Standard centered container with responsive max-widths.

```markdown
:::bootstrap:container
Content with responsive max-width
:::
```

**Result:**

:::bootstrap:container
Content with responsive max-width
:::

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

**Result:**

:::bootstrap:container{variant="fluid"}
Full-width content
:::

---

## Cards

Flexible content container.

### Simple Card

```markdown
:::bootstrap:card
## Card Title

This is the card content. Cards have styling for
borders, shadows, and proper padding.
:::
```

**Result:**

:::bootstrap:card
## Card Title

This is the card content. Cards have styling for
borders, shadows, and proper padding.
:::

### Card Header

```markdown
:::bootstrap:card-header
Card Header Text
:::
```

**Result:**

:::bootstrap:card-header
Card Header Text
:::

### Card Body

```markdown
:::bootstrap:card-body
Card body content goes here.
:::
```

**Result:**

:::bootstrap:card-body
Card body content goes here.
:::

### Card Footer

```markdown
:::bootstrap:card-footer
Card Footer Text
:::
```

**Result:**

:::bootstrap:card-footer
Card Footer Text
:::

---

## Alerts

Contextual feedback messages.

### Basic Alert

```markdown
:::bootstrap:alert{variant="primary"}
This is a primary alert.
:::
```

**Result:**

:::bootstrap:alert{variant="primary"}
This is a primary alert.
:::

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

**Result:**

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

**Result:**

:::bootstrap:alert{variant="success"}
## Success!

Your file was saved successfully.

**Next steps:**
1. Review the changes
2. Share with your team
:::

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

**Result:**

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

**Result:**

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

### Outline Buttons

```markdown
:::bootstrap:button{variant="outline-primary"}
Outline Primary
:::

:::bootstrap:button{variant="outline-secondary"}
Outline Secondary
:::
```

**Result:**

:::bootstrap:button{variant="outline-primary"}
Outline Primary
:::

:::bootstrap:button{variant="outline-secondary"}
Outline Secondary
:::

---

## Spinners

Loading indicators.

### Border Spinner

```markdown
::bootstrap:spinner{variant="primary"}
```

**Result:**

::bootstrap:spinner{variant="primary"}

### Grow Spinner

```markdown
::bootstrap:spinner{variant="grow"}
```

**Result:**

::bootstrap:spinner{variant="grow"}

### Color Variants

```markdown
::bootstrap:spinner{variant="primary"}
::bootstrap:spinner{variant="secondary"}
::bootstrap:spinner{variant="success"}
::bootstrap:spinner{variant="danger"}
```

**Result:**

::bootstrap:spinner{variant="primary"}
::bootstrap:spinner{variant="secondary"}
::bootstrap:spinner{variant="success"}
::bootstrap:spinner{variant="danger"}

---

## Progress Bars

Display progress indicators.

### Progress Container

```markdown
:::bootstrap:progress
Progress container
:::
```

**Result:**

:::bootstrap:progress
Progress container
:::

### Progress Bar

```markdown
:::bootstrap:progress-bar{style="width: 50%"}
50%
:::
```

**Result:**

:::bootstrap:progress-bar{style="width: 50%"}
50%
:::

### Colored Progress

```markdown
:::bootstrap:progress-bar{variant="success" style="width: 75%"}
75%
:::
```

**Result:**

:::bootstrap:progress-bar{variant="success" style="width: 75%"}
75%
:::

### Striped and Animated

```markdown
:::bootstrap:progress-bar{variant="striped" style="width: 60%"}
60%
:::

:::bootstrap:progress-bar{variant="animated" style="width: 80%"}
80%
:::
```

**Result:**

:::bootstrap:progress-bar{variant="striped" style="width: 60%"}
60%
:::

:::bootstrap:progress-bar{variant="animated" style="width: 80%"}
80%
:::

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

**Result:**

:::bootstrap:table
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

### Table Variants

```markdown
:::bootstrap:table{variant="striped"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="striped"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

```markdown
:::bootstrap:table{variant="bordered"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="bordered"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

```markdown
:::bootstrap:table{variant="hover"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="hover"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

```markdown
:::bootstrap:table{variant="dark"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="dark"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

---

## List Groups

Flexible component for displaying lists.

### List Group Container

```markdown
:::bootstrap:list-group
List group container
:::
```

**Result:**

:::bootstrap:list-group
List group container
:::

### List Group Item

```markdown
:::bootstrap:list-group-item
First item
:::

:::bootstrap:list-group-item
Second item
:::

:::bootstrap:list-group-item
Third item
:::
```

**Result:**

:::bootstrap:list-group-item
First item
:::

:::bootstrap:list-group-item
Second item
:::

:::bootstrap:list-group-item
Third item
:::

---

## Accordion

Collapsible content panels.

### Accordion Container

```markdown
:::bootstrap:accordion
Accordion container
:::
```

**Result:**

:::bootstrap:accordion
Accordion container
:::

### Accordion Item

```markdown
:::bootstrap:accordion-item
### Section 1
Content for the first section.
:::

:::bootstrap:accordion-item
### Section 2
Content for the second section.
:::
```

**Result:**

:::bootstrap:accordion-item
### Section 1
Content for the first section.
:::

:::bootstrap:accordion-item
### Section 2
Content for the second section.
:::

---

## Modal Components

Dialog box components (use together for full modal).

### Modal Container

```markdown
:::bootstrap:modal{id="exampleModal"}
Modal container
:::
```

**Result:**

:::bootstrap:modal{id="exampleModal"}
Modal container
:::

### Modal Header

```markdown
:::bootstrap:modal-header
## Modal Title
:::
```

**Result:**

:::bootstrap:modal-header
## Modal Title
:::

### Modal Body

```markdown
:::bootstrap:modal-body
This is the modal body content.
:::
```

**Result:**

:::bootstrap:modal-body
This is the modal body content.
:::

### Modal Footer

```markdown
:::bootstrap:modal-footer
Modal footer content
:::
```

**Result:**

:::bootstrap:modal-footer
Modal footer content
:::

---

## Toast Components

Push notification components.

### Toast Container

```markdown
:::bootstrap:toast
Toast notification
:::
```

**Result:**

:::bootstrap:toast
Toast notification
:::

### Toast Header

```markdown
:::bootstrap:toast-header
**Notification** - just now
:::
```

**Result:**

:::bootstrap:toast-header
**Notification** - just now
:::

### Toast Body

```markdown
:::bootstrap:toast-body
Hello! This is a toast message.
:::
```

**Result:**

:::bootstrap:toast-body
Hello! This is a toast message.
:::

---

## Navigation Components

### Navbar

```markdown
:::bootstrap:navbar{variant="dark"}
Navigation bar
:::
```

**Result:**

:::bootstrap:navbar{variant="dark"}
Navigation bar
:::

### Navbar Brand

```markdown
:::bootstrap:navbar-brand
My App
:::
```

**Result:**

:::bootstrap:navbar-brand
My App
:::

### Nav Item

```markdown
:::bootstrap:nav-item
Home
:::

:::bootstrap:nav-item
About
:::

:::bootstrap:nav-item
Contact
:::
```

**Result:**

:::bootstrap:nav-item
Home
:::

:::bootstrap:nav-item
About
:::

:::bootstrap:nav-item
Contact
:::

---

## Tab Components

### Tab Pane

```markdown
:::bootstrap:tab-pane{variant="active" id="home"}
### Home
Content for the home tab.
:::

:::bootstrap:tab-pane{id="profile"}
### Profile
Content for the profile tab.
:::
```

**Result:**

:::bootstrap:tab-pane{variant="active" id="home"}
### Home
Content for the home tab.
:::

:::bootstrap:tab-pane{id="profile"}
### Profile
Content for the profile tab.
:::

---

## Breadcrumb Components

### Breadcrumb Item

```markdown
:::bootstrap:breadcrumb-item
Home
:::

:::bootstrap:breadcrumb-item
Library
:::

:::bootstrap:breadcrumb-item{variant="active"}
Data
:::
```

**Result:**

:::bootstrap:breadcrumb-item
Home
:::

:::bootstrap:breadcrumb-item
Library
:::

:::bootstrap:breadcrumb-item{variant="active"}
Data
:::

---

## Offcanvas Components

Sidebar overlay panels.

### Offcanvas Container

```markdown
:::bootstrap:offcanvas{variant="start" id="sidebar"}
Offcanvas sidebar
:::
```

**Result:**

:::bootstrap:offcanvas{variant="start" id="sidebar"}
Offcanvas sidebar
:::

### Offcanvas Header

```markdown
:::bootstrap:offcanvas-header
## Menu
:::
```

**Result:**

:::bootstrap:offcanvas-header
## Menu
:::

### Offcanvas Body

```markdown
:::bootstrap:offcanvas-body
Sidebar content here.
:::
```

**Result:**

:::bootstrap:offcanvas-body
Sidebar content here.
:::

---

## Form Components

### Form Group

```markdown
:::bootstrap:form-group
Form group container
:::
```

**Result:**

:::bootstrap:form-group
Form group container
:::

### Form Label

```markdown
:::bootstrap:form-label
Email address
:::
```

**Result:**

:::bootstrap:form-label
Email address
:::

### Form Control

```markdown
:::bootstrap:form-control{type="email" placeholder="Enter email"}
:::

:::bootstrap:form-control{variant="lg"}
Large input
:::

:::bootstrap:form-control{variant="sm"}
Small input
:::
```

**Result:**

:::bootstrap:form-control{type="email" placeholder="Enter email"}
:::

:::bootstrap:form-control{variant="lg"}
Large input
:::

:::bootstrap:form-control{variant="sm"}
Small input
:::

---

## Grid Components

### Row

```markdown
:::bootstrap:row
Grid row container
:::
```

**Result:**

:::bootstrap:row
Grid row container
:::

### Column

```markdown
:::bootstrap:col{variant="6"}
Half width (6 of 12 columns)
:::

:::bootstrap:col{variant="4"}
One third
:::

:::bootstrap:col{variant="8"}
Two thirds
:::
```

**Result:**

:::bootstrap:col{variant="6"}
Half width (6 of 12 columns)
:::

:::bootstrap:col{variant="4"}
One third
:::

:::bootstrap:col{variant="8"}
Two thirds
:::

---

## Dropdown Components

### Dropdown Container

```markdown
:::bootstrap:dropdown
Dropdown container
:::
```

**Result:**

:::bootstrap:dropdown
Dropdown container
:::

### Dropdown Toggle

```markdown
:::bootstrap:dropdown-toggle{variant="primary"}
Dropdown
:::
```

**Result:**

:::bootstrap:dropdown-toggle{variant="primary"}
Dropdown
:::

### Dropdown Item

```markdown
:::bootstrap:dropdown-item
Action 1
:::

:::bootstrap:dropdown-item
Action 2
:::

:::bootstrap:dropdown-item
Action 3
:::
```

**Result:**

:::bootstrap:dropdown-item
Action 1
:::

:::bootstrap:dropdown-item
Action 2
:::

:::bootstrap:dropdown-item
Action 3
:::

---

## Carousel Components

### Carousel Container

```markdown
:::bootstrap:carousel{id="myCarousel"}
Carousel container
:::
```

**Result:**

:::bootstrap:carousel{id="myCarousel"}
Carousel container
:::

### Carousel Item

```markdown
:::bootstrap:carousel-item{variant="active"}
Slide 1 Content
:::

:::bootstrap:carousel-item
Slide 2 Content
:::

:::bootstrap:carousel-item
Slide 3 Content
:::
```

**Result:**

:::bootstrap:carousel-item{variant="active"}
Slide 1 Content
:::

:::bootstrap:carousel-item
Slide 2 Content
:::

:::bootstrap:carousel-item
Slide 3 Content
:::

---

## Best Practices

1. **Use single components** - Each component works independently
2. **Semantic variants** - Use colors meaningfully (success for positive, danger for errors)
3. **Combine with HTML** - For complex layouts, use HTML alongside directives
4. **Mobile first** - Test at different screen sizes
5. **Accessibility** - Use proper heading hierarchy inside components
