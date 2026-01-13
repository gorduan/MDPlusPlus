# Bootstrap 5 Components Syntax Reference

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

## Nesting with Multiple Colons

MD++ supports **deep nesting** using different colon counts. The outer container uses more colons than inner containers:

```markdown
::::bootstrap:card
:::bootstrap:card-body
Nested content inside card body
:::
::::
```

**Result:**

::::bootstrap:card
:::bootstrap:card-body
Nested content inside card body
:::
::::

### Deep Nesting Example

```markdown
::::::bootstrap:container
:::::bootstrap:row
::::bootstrap:col{variant="md-6"}
:::bootstrap:card
Card in first column
:::
::::

::::bootstrap:col{variant="md-6"}
:::bootstrap:card
Card in second column
:::
::::
:::::
::::::
```

**Result:**

::::::bootstrap:container
:::::bootstrap:row
::::bootstrap:col{variant="md-6"}
:::bootstrap:card
Card in first column
:::
::::

::::bootstrap:col{variant="md-6"}
:::bootstrap:card
Card in second column
:::
::::
:::::
::::::

---

## Multi-Variant Support

You can combine multiple variants with space-separated values:

```markdown
:::bootstrap:table{variant="striped hover bordered"}
| Name | Email |
|------|-------|
| John | john@example.com |
| Jane | jane@example.com |
:::
```

**Result:**

:::bootstrap:table{variant="striped hover bordered"}
| Name | Email |
|------|-------|
| John | john@example.com |
| Jane | jane@example.com |
:::

---

## Layout Components

### Container

```markdown
:::bootstrap:container
Content with responsive max-width
:::

:::bootstrap:container{variant="fluid"}
Full-width content
:::
```

**Result:**

:::bootstrap:container
Content with responsive max-width
:::

### Grid System

```markdown
::::bootstrap:row{variant="g-3"}
:::bootstrap:col{variant="md-4"}
Column 1 (4/12 on medium+)
:::

:::bootstrap:col{variant="md-4"}
Column 2
:::

:::bootstrap:col{variant="md-4"}
Column 3
:::
::::
```

**Result:**

::::bootstrap:row{variant="g-3"}
:::bootstrap:col{variant="md-4"}
Column 1 (4/12 on medium+)
:::

:::bootstrap:col{variant="md-4"}
Column 2
:::

:::bootstrap:col{variant="md-4"}
Column 3
:::
::::

### Responsive Columns

Available column variants: `1`-`12`, `auto`, `sm-1` to `sm-12`, `md-1` to `md-12`, `lg-1` to `lg-12`, `xl-1` to `xl-12`, `xxl-1` to `xxl-12`

```markdown
:::bootstrap:col{variant="12 md-6 lg-4"}
Full width on mobile, half on medium, third on large
:::
```

---

## Cards

### Complete Card Structure

```markdown
:::::bootstrap:card
::::bootstrap:card-header
Featured
::::

::::bootstrap:card-body
:::bootstrap:card-title
Card Title
:::

:::bootstrap:card-text
Some quick example text to build on the card title.
:::
::::

::::bootstrap:card-footer
Card footer
::::
:::::
```

**Result:**

:::::bootstrap:card
::::bootstrap:card-header
Featured
::::

::::bootstrap:card-body
:::bootstrap:card-title
Card Title
:::

:::bootstrap:card-text
Some quick example text to build on the card title.
:::
::::

::::bootstrap:card-footer
Card footer
::::
:::::

### Card Group

```markdown
::::bootstrap:card-group
:::bootstrap:card
First card
:::

:::bootstrap:card
Second card
:::

:::bootstrap:card
Third card
:::
::::
```

**Result:**

::::bootstrap:card-group
:::bootstrap:card
First card
:::

:::bootstrap:card
Second card
:::

:::bootstrap:card
Third card
:::
::::

---

## Alerts

### All Alert Variants

```markdown
:::bootstrap:alert{variant="primary"}
A primary alert
:::

:::bootstrap:alert{variant="success"}
A success alert
:::

:::bootstrap:alert{variant="danger"}
A danger alert
:::

:::bootstrap:alert{variant="warning"}
A warning alert
:::

:::bootstrap:alert{variant="info"}
An info alert
:::
```

**Result:**

:::bootstrap:alert{variant="primary"}
A primary alert
:::

:::bootstrap:alert{variant="success"}
A success alert
:::

:::bootstrap:alert{variant="danger"}
A danger alert
:::

:::bootstrap:alert{variant="warning"}
A warning alert
:::

:::bootstrap:alert{variant="info"}
An info alert
:::

### Alert with Heading

```markdown
::::bootstrap:alert{variant="success"}
:::bootstrap:alert-heading
Well done!
:::

You successfully read this important alert message.
::::
```

**Result:**

::::bootstrap:alert{variant="success"}
:::bootstrap:alert-heading
Well done!
:::

You successfully read this important alert message.
::::

---

## Badges

```markdown
:::bootstrap:badge{variant="primary"}
Primary
:::

:::bootstrap:badge{variant="success"}
Success
:::

:::bootstrap:badge{variant="danger"}
Danger
:::

:::bootstrap:badge{variant="pill primary"}
Pill Badge
:::
```

**Result:**

:::bootstrap:badge{variant="primary"}
Primary
:::

:::bootstrap:badge{variant="success"}
Success
:::

:::bootstrap:badge{variant="danger"}
Danger
:::

:::bootstrap:badge{variant="pill primary"}
Pill Badge
:::

---

## Buttons

### Button Variants

```markdown
:::bootstrap:button{variant="primary"}
Primary
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

:::bootstrap:button{variant="outline-primary"}
Outline Primary
:::
```

**Result:**

:::bootstrap:button{variant="primary"}
Primary
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

:::bootstrap:button{variant="outline-primary"}
Outline Primary
:::

### Button Sizes

```markdown
:::bootstrap:button{variant="primary lg"}
Large Button
:::

:::bootstrap:button{variant="primary sm"}
Small Button
:::
```

**Result:**

:::bootstrap:button{variant="primary lg"}
Large Button
:::

:::bootstrap:button{variant="primary sm"}
Small Button
:::

### Button Group

```markdown
::::bootstrap:btn-group
:::bootstrap:button{variant="primary"}
Left
:::

:::bootstrap:button{variant="primary"}
Middle
:::

:::bootstrap:button{variant="primary"}
Right
:::
::::
```

**Result:**

::::bootstrap:btn-group
:::bootstrap:button{variant="primary"}
Left
:::

:::bootstrap:button{variant="primary"}
Middle
:::

:::bootstrap:button{variant="primary"}
Right
:::
::::

---

## Spinners

```markdown
::bootstrap:spinner{variant="primary"}

::bootstrap:spinner{variant="success"}

::bootstrap:spinner{variant="grow danger"}
```

**Result:**

::bootstrap:spinner{variant="primary"}

::bootstrap:spinner{variant="success"}

::bootstrap:spinner{variant="grow danger"}

---

## Progress Bars

```markdown
:::bootstrap:progress-bar{style="width: 25%"}
25%
:::

:::bootstrap:progress-bar{variant="success" style="width: 50%"}
50%
:::

:::bootstrap:progress-bar{variant="striped" style="width: 75%"}
75%
:::

:::bootstrap:progress-bar{variant="animated" style="width: 100%"}
100%
:::
```

**Result:**

:::bootstrap:progress-bar{style="width: 25%"}
25%
:::

:::bootstrap:progress-bar{variant="success" style="width: 50%"}
50%
:::

:::bootstrap:progress-bar{variant="striped" style="width: 75%"}
75%
:::

:::bootstrap:progress-bar{variant="animated" style="width: 100%"}
100%
:::

---

## Placeholders (Skeleton Loaders)

```markdown
::::bootstrap:placeholder-glow
:::bootstrap:placeholder{class="col-6"}
:::

:::bootstrap:placeholder{class="col-8"}
:::

:::bootstrap:placeholder{class="col-4"}
:::
::::

::::bootstrap:placeholder-wave
:::bootstrap:placeholder{variant="primary" class="col-12"}
:::
::::
```

**Result:**

::::bootstrap:placeholder-glow
:::bootstrap:placeholder{class="col-6"}
:::

:::bootstrap:placeholder{class="col-8"}
:::

:::bootstrap:placeholder{class="col-4"}
:::
::::

::::bootstrap:placeholder-wave
:::bootstrap:placeholder{variant="primary" class="col-12"}
:::
::::

---

## Tables

### Table with Multiple Variants

```markdown
:::bootstrap:table{variant="striped hover"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="striped hover"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

### Dark Table

```markdown
:::bootstrap:table{variant="dark striped"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::
```

**Result:**

:::bootstrap:table{variant="dark striped"}
| Name | Email | Role |
|------|-------|------|
| John | john@example.com | Admin |
| Jane | jane@example.com | User |
:::

---

## List Groups

### Basic List Group

```markdown
::::bootstrap:list-group
:::bootstrap:list-group-item
First item
:::

:::bootstrap:list-group-item{variant="active"}
Active item
:::

:::bootstrap:list-group-item
Third item
:::
::::
```

**Result:**

::::bootstrap:list-group
:::bootstrap:list-group-item
First item
:::

:::bootstrap:list-group-item{variant="active"}
Active item
:::

:::bootstrap:list-group-item
Third item
:::
::::

### Colored List Group Items

```markdown
::::bootstrap:list-group
:::bootstrap:list-group-item{variant="primary"}
Primary item
:::

:::bootstrap:list-group-item{variant="success"}
Success item
:::

:::bootstrap:list-group-item{variant="danger"}
Danger item
:::
::::
```

**Result:**

::::bootstrap:list-group
:::bootstrap:list-group-item{variant="primary"}
Primary item
:::

:::bootstrap:list-group-item{variant="success"}
Success item
:::

:::bootstrap:list-group-item{variant="danger"}
Danger item
:::
::::

---

## Accordion

Bootstrap accordions require `data-bs-target` on each accordion-button to reference the corresponding collapse.
The `data-bs-toggle="collapse"` attribute is set automatically by default.
Use `data-bs-parent` on accordion-collapse elements to close other items when opening a new one.

```markdown
::::::bootstrap:accordion{id="accordionExample"}
:::::bootstrap:accordion-item
::::bootstrap:accordion-header
:::bootstrap:accordion-button{data-bs-target="#collapseOne"}
Accordion Item #1
:::
::::

::::bootstrap:accordion-collapse{variant="show" id="collapseOne" data-bs-parent="#accordionExample"}
:::bootstrap:accordion-body
This is the first item's accordion body.
:::
::::
:::::

:::::bootstrap:accordion-item
::::bootstrap:accordion-header
:::bootstrap:accordion-button{variant="collapsed" data-bs-target="#collapseTwo"}
Accordion Item #2
:::
::::

::::bootstrap:accordion-collapse{id="collapseTwo" data-bs-parent="#accordionExample"}
:::bootstrap:accordion-body
This is the second item's accordion body.
:::
::::
:::::
::::::
```

**Result:**

::::::bootstrap:accordion{id="accordionExample"}
:::::bootstrap:accordion-item
::::bootstrap:accordion-header
:::bootstrap:accordion-button{data-bs-target="#collapseOne"}
Accordion Item #1
:::
::::

::::bootstrap:accordion-collapse{variant="show" id="collapseOne" data-bs-parent="#accordionExample"}
:::bootstrap:accordion-body
This is the first item's accordion body.
:::
::::
:::::

:::::bootstrap:accordion-item
::::bootstrap:accordion-header
:::bootstrap:accordion-button{variant="collapsed" data-bs-target="#collapseTwo"}
Accordion Item #2
:::
::::

::::bootstrap:accordion-collapse{id="collapseTwo" data-bs-parent="#accordionExample"}
:::bootstrap:accordion-body
This is the second item's accordion body.
:::
::::
:::::
::::::

---

## Tabs

Bootstrap tabs require `data-bs-target` on each tab-link to reference the corresponding pane.
The `data-bs-toggle="tab"` attribute is set automatically by default.

```markdown
:::::bootstrap:tabs{id="myTabs"}
::::bootstrap:tab-item
:::bootstrap:tab-link{variant="active" data-bs-target="#home"}
Home
:::
::::

::::bootstrap:tab-item
:::bootstrap:tab-link{data-bs-target="#profile"}
Profile
:::
::::
:::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{variant="active" id="home"}
Home tab content
:::

:::bootstrap:tab-pane{id="profile"}
Profile tab content
:::
::::
```

**Result:**

:::::bootstrap:tabs{id="myTabs"}
::::bootstrap:tab-item
:::bootstrap:tab-link{variant="active" data-bs-target="#home"}
Home
:::
::::

::::bootstrap:tab-item
:::bootstrap:tab-link{data-bs-target="#profile"}
Profile
:::
::::
:::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{variant="active" id="home"}
Home tab content
:::

:::bootstrap:tab-pane{id="profile"}
Profile tab content
:::
::::

---

## Navigation

### Nav Pills with Content

Nav Pills work like tabs - use `data-bs-toggle="pill"` and `data-bs-target` to link to content panes.
The `nav-link` component is now a `<button>` which works better with Bootstrap's JavaScript.

```markdown
:::::bootstrap:nav{variant="pills" id="pills-nav"}
::::bootstrap:nav-item
:::bootstrap:nav-link{variant="active" data-bs-toggle="pill" data-bs-target="#pills-home"}
Home
:::
::::

::::bootstrap:nav-item
:::bootstrap:nav-link{data-bs-toggle="pill" data-bs-target="#pills-profile"}
Profile
:::
::::

::::bootstrap:nav-item
:::bootstrap:nav-link{data-bs-toggle="pill" data-bs-target="#pills-contact"}
Contact
:::
::::
:::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{variant="active" id="pills-home"}
Home content goes here.
:::

:::bootstrap:tab-pane{id="pills-profile"}
Profile content goes here.
:::

:::bootstrap:tab-pane{id="pills-contact"}
Contact content goes here.
:::
::::
```

**Result:**

:::::bootstrap:nav{variant="pills" id="pills-nav"}
::::bootstrap:nav-item
:::bootstrap:nav-link{variant="active" data-bs-toggle="pill" data-bs-target="#pills-home"}
Home
:::
::::

::::bootstrap:nav-item
:::bootstrap:nav-link{data-bs-toggle="pill" data-bs-target="#pills-profile"}
Profile
:::
::::

::::bootstrap:nav-item
:::bootstrap:nav-link{data-bs-toggle="pill" data-bs-target="#pills-contact"}
Contact
:::
::::
:::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{variant="active" id="pills-home"}
Home content goes here.
:::

:::bootstrap:tab-pane{id="pills-profile"}
Profile content goes here.
:::

:::bootstrap:tab-pane{id="pills-contact"}
Contact content goes here.
:::
::::

---

## Pagination with Content

Pagination can switch content like Tabs using `data-bs-toggle="tab"` and `data-bs-target`.
The `page-link` component is now a `<button>` which works better with Bootstrap's JavaScript.

```markdown
::::::bootstrap:pagination
:::::bootstrap:pagination-list
::::bootstrap:page-item
:::bootstrap:page-link{data-bs-toggle="tab" data-bs-target="#page-1"}
1
:::
::::

::::bootstrap:page-item{variant="active"}
:::bootstrap:page-link{variant="active" data-bs-toggle="tab" data-bs-target="#page-2"}
2
:::
::::

::::bootstrap:page-item
:::bootstrap:page-link{data-bs-toggle="tab" data-bs-target="#page-3"}
3
:::
::::
:::::
::::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{id="page-1"}
Content for page 1.
:::

:::bootstrap:tab-pane{variant="active" id="page-2"}
Content for page 2.
:::

:::bootstrap:tab-pane{id="page-3"}
Content for page 3.
:::
::::
```

**Result:**

::::::bootstrap:pagination
:::::bootstrap:pagination-list
::::bootstrap:page-item
:::bootstrap:page-link{data-bs-toggle="tab" data-bs-target="#page-1"}
1
:::
::::

::::bootstrap:page-item{variant="active"}
:::bootstrap:page-link{variant="active" data-bs-toggle="tab" data-bs-target="#page-2"}
2
:::
::::

::::bootstrap:page-item
:::bootstrap:page-link{data-bs-toggle="tab" data-bs-target="#page-3"}
3
:::
::::
:::::
::::::

::::bootstrap:tab-content
:::bootstrap:tab-pane{id="page-1"}
Content for page 1.
:::

:::bootstrap:tab-pane{variant="active" id="page-2"}
Content for page 2.
:::

:::bootstrap:tab-pane{id="page-3"}
Content for page 3.
:::
::::

---

## Breadcrumb

```markdown
:::::bootstrap:breadcrumb
::::bootstrap:breadcrumb-list
:::bootstrap:breadcrumb-item
Home
:::

:::bootstrap:breadcrumb-item
Library
:::

:::bootstrap:breadcrumb-item{variant="active"}
Data
:::
::::
:::::
```

**Result:**

:::::bootstrap:breadcrumb
::::bootstrap:breadcrumb-list
:::bootstrap:breadcrumb-item
Home
:::

:::bootstrap:breadcrumb-item
Library
:::

:::bootstrap:breadcrumb-item{variant="active"}
Data
:::
::::
:::::

---

## Dropdown

The `dropdown-toggle` component automatically includes `data-bs-toggle="dropdown"`.

```markdown
::::bootstrap:dropdown
:::bootstrap:dropdown-toggle{variant="primary"}
Dropdown button
:::

:::::bootstrap:dropdown-menu
::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Action
:::
::::

::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Another action
:::
::::

:::bootstrap:dropdown-divider
:::

::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Separated link
:::
::::
:::::
::::
```

**Result:**

::::bootstrap:dropdown
:::bootstrap:dropdown-toggle{variant="primary"}
Dropdown button
:::

:::::bootstrap:dropdown-menu
::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Action
:::
::::

::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Another action
:::
::::

:::bootstrap:dropdown-divider
:::

::::bootstrap:dropdown-item
:::bootstrap:dropdown-item-link
Separated link
:::
::::
:::::
::::

---

## Toast

```markdown
::::bootstrap:toast{variant="show"}
:::bootstrap:toast-header
**Bootstrap** - just now
::bootstrap:btn-close{data-bs-dismiss="toast"}
:::

:::bootstrap:toast-body
Hello! This is a toast message.
:::
::::
```

**Result:**

::::bootstrap:toast{variant="show"}
:::bootstrap:toast-header
**Bootstrap** - just now
:::

:::bootstrap:toast-body
Hello! This is a toast message.
:::
::::

---

## Forms

### Basic Form

```markdown
::::bootstrap:form-group
:::bootstrap:form-label
Email address
:::

:::bootstrap:form-control{type="email" placeholder="Enter email"}
:::

:::bootstrap:form-text
We'll never share your email.
:::
::::

::::bootstrap:form-group
:::bootstrap:form-label
Password
:::

:::bootstrap:form-control{type="password" placeholder="Password"}
:::
::::
```

**Result:**

::::bootstrap:form-group
:::bootstrap:form-label
Email address
:::

:::bootstrap:form-control{type="email" placeholder="Enter email"}
:::

:::bootstrap:form-text
We'll never share your email.
:::
::::

::::bootstrap:form-group
:::bootstrap:form-label
Password
:::

:::bootstrap:form-control{type="password" placeholder="Password"}
:::
::::

### Input Group

```markdown
::::bootstrap:input-group
:::bootstrap:input-group-text
@
:::

:::bootstrap:form-control{placeholder="Username"}
:::
::::
```

**Result:**

::::bootstrap:input-group
:::bootstrap:input-group-text
@
:::

:::bootstrap:form-control{placeholder="Username"}
:::
::::

---

## Typography

### Display Headings

```markdown
:::bootstrap:display{variant="1"}
Display 1
:::

:::bootstrap:display{variant="4"}
Display 4
:::
```

**Result:**

:::bootstrap:display{variant="1"}
Display 1
:::

:::bootstrap:display{variant="4"}
Display 4
:::

### Lead Paragraph

```markdown
:::bootstrap:lead
This is a lead paragraph. It stands out from regular paragraphs.
:::
```

**Result:**

:::bootstrap:lead
This is a lead paragraph. It stands out from regular paragraphs.
:::

### Blockquote

```markdown
::::bootstrap:blockquote
A well-known quote, contained in a blockquote element.

:::bootstrap:blockquote-footer
Someone famous in *Source Title*
:::
::::
```

**Result:**

::::bootstrap:blockquote
A well-known quote, contained in a blockquote element.

:::bootstrap:blockquote-footer
Someone famous in *Source Title*
:::
::::

---

## Utilities

### Aspect Ratio

```markdown
:::bootstrap:ratio{variant="16x9"}
<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
:::
```

### Visually Hidden (Screen Reader Only)

```markdown
:::bootstrap:visually-hidden
This text is only visible to screen readers
:::
```

---

## Component Reference

### Cards
- `card`, `card-header`, `card-body`, `card-footer`, `card-title`, `card-subtitle`, `card-text`, `card-link`, `card-img-top`, `card-img-bottom`, `card-img-overlay`, `card-group`

### Alerts
- `alert` (variants: primary, secondary, success, danger, warning, info, light, dark)
- `alert-heading`, `alert-link`

### Buttons
- `button` (variants: primary, secondary, success, danger, warning, info, light, dark, link, outline-*, lg, sm)
- `btn-group`, `btn-toolbar`, `btn-close`

### Navigation
- `navbar`, `navbar-brand`, `navbar-toggler`, `navbar-collapse`, `navbar-nav`, `navbar-text`
- `nav`, `nav-item`, `nav-link`
- `tabs`, `tab-item`, `tab-link`, `tab-content`, `tab-pane`
- `breadcrumb`, `breadcrumb-list`, `breadcrumb-item`
- `pagination`, `pagination-list`, `page-item`, `page-link`

### Layout
- `container` (variants: fluid, sm, md, lg, xl, xxl)
- `row` (variants: g-0 to g-5)
- `col` (variants: 1-12, auto, sm-*, md-*, lg-*, xl-*, xxl-*)

### Forms
- `form-group`, `form-floating`, `form-control`, `form-select`, `form-label`, `form-text`
- `form-check`, `form-check-input`, `form-check-label`
- `input-group`, `input-group-text`

### Components
- `accordion`, `accordion-item`, `accordion-header`, `accordion-button`, `accordion-collapse`, `accordion-body`
- `list-group`, `list-group-item`
- `dropdown`, `dropdown-toggle`, `dropdown-menu`, `dropdown-item`, `dropdown-item-link`, `dropdown-header`, `dropdown-divider`
- `modal`, `modal-dialog`, `modal-content`, `modal-header`, `modal-title`, `modal-body`, `modal-footer`
- `toast`, `toast-container`, `toast-header`, `toast-body`
- `offcanvas`, `offcanvas-header`, `offcanvas-title`, `offcanvas-body`
- `carousel`, `carousel-indicators`, `carousel-inner`, `carousel-item`, `carousel-caption`

### Indicators
- `spinner` (variants: primary, secondary, success, danger, warning, info, light, dark, grow, sm)
- `progress`, `progress-bar`
- `placeholder`, `placeholder-glow`, `placeholder-wave`
- `badge` (variants: primary, secondary, success, danger, warning, info, light, dark, pill)

### Typography
- `display` (variants: 1-6)
- `lead`, `blockquote`, `blockquote-footer`

### Utilities
- `ratio` (variants: 1x1, 4x3, 16x9, 21x9)
- `visually-hidden`, `clearfix`
- `figure`, `figure-img`, `figure-caption`
- `img-fluid`, `img-thumbnail`
- `collapse`, `table-responsive`
