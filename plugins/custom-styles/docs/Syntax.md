# Custom Styles Syntax Reference

## Basic CSS Usage

Embed CSS using a fenced code block with `css` language:

````markdown
```css
.custom-heading {
  color: var(--accent);
  font-size: 2rem;
  border-bottom: 2px solid var(--border-color);
}
```
````

**Result:**

```css
.custom-heading {
  color: var(--accent);
  font-size: 2rem;
  border-bottom: 2px solid var(--border-color);
}
```

The styles are automatically applied to the preview.

---

## SCSS Usage

Use SCSS for variables, nesting, and advanced features:

````markdown
```scss
$primary: var(--accent);
$spacing: 1rem;

.feature-card {
  background: var(--bg-card);
  padding: $spacing;
  border-radius: 8px;

  .title {
    color: $primary;
    font-weight: bold;
    margin-bottom: $spacing / 2;
  }

  .description {
    color: var(--text-secondary);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```
````

**Result:**

```scss
$primary: var(--accent);
$spacing: 1rem;

.feature-card {
  background: var(--bg-card);
  padding: $spacing;
  border-radius: 8px;

  .title {
    color: $primary;
    font-weight: bold;
    margin-bottom: $spacing / 2;
  }

  .description {
    color: var(--text-secondary);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}
```

---

## SASS (Indented Syntax)

Use indented SASS syntax without braces:

````markdown
```sass
$primary: var(--accent)

.sidebar
  width: 250px
  background: var(--bg-secondary)

  .nav-item
    padding: 0.5rem 1rem

    &.active
      background: var(--bg-hover)
      color: $primary
```
````

**Result:**

```sass
$primary: var(--accent)

.sidebar
  width: 250px
  background: var(--bg-secondary)

  .nav-item
    padding: 0.5rem 1rem

    &.active
      background: var(--bg-hover)
      color: $primary
```

---

## Using Theme Variables

### All Available Variables

````markdown
```css
/* Backgrounds */
.element {
  background: var(--bg-primary);     /* Main background */
  background: var(--bg-secondary);   /* Secondary background */
  background: var(--bg-card);        /* Card/panel background */
  background: var(--bg-hover);       /* Hover state */
  background: var(--bg-code);        /* Code block background */
}

/* Text Colors */
.text {
  color: var(--text-primary);        /* Main text */
  color: var(--text-secondary);      /* Secondary text */
  color: var(--text-muted);          /* Muted/dimmed text */
  color: var(--text-code);           /* Code text */
}

/* Accent Colors */
.accent {
  color: var(--accent);              /* Primary accent */
  color: var(--accent-hover);        /* Accent hover state */
  color: var(--accent-light);        /* Light accent variant */
}

/* Status Colors */
.status {
  color: var(--color-success);       /* Success/positive */
  color: var(--color-warning);       /* Warning/caution */
  color: var(--color-error);         /* Error/danger */
  color: var(--color-info);          /* Information */
}

/* Borders */
.bordered {
  border: 1px solid var(--border-color);
}

/* Syntax Highlighting */
.code-theme {
  --keyword: var(--syntax-keyword);
  --string: var(--syntax-string);
  --function: var(--syntax-function);
  --variable: var(--syntax-variable);
  --comment: var(--syntax-comment);
  --number: var(--syntax-number);
}
```
````

**Result:**

```css
/* Backgrounds */
.element {
  background: var(--bg-primary);     /* Main background */
  background: var(--bg-secondary);   /* Secondary background */
  background: var(--bg-card);        /* Card/panel background */
  background: var(--bg-hover);       /* Hover state */
  background: var(--bg-code);        /* Code block background */
}

/* Text Colors */
.text {
  color: var(--text-primary);        /* Main text */
  color: var(--text-secondary);      /* Secondary text */
  color: var(--text-muted);          /* Muted/dimmed text */
  color: var(--text-code);           /* Code text */
}

/* Accent Colors */
.accent {
  color: var(--accent);              /* Primary accent */
  color: var(--accent-hover);        /* Accent hover state */
  color: var(--accent-light);        /* Light accent variant */
}

/* Status Colors */
.status {
  color: var(--color-success);       /* Success/positive */
  color: var(--color-warning);       /* Warning/caution */
  color: var(--color-error);         /* Error/danger */
  color: var(--color-info);          /* Information */
}

/* Borders */
.bordered {
  border: 1px solid var(--border-color);
}

/* Syntax Highlighting */
.code-theme {
  --keyword: var(--syntax-keyword);
  --string: var(--syntax-string);
  --function: var(--syntax-function);
  --variable: var(--syntax-variable);
  --comment: var(--syntax-comment);
  --number: var(--syntax-number);
}
```

### Theme-Aware Components

````markdown
```scss
.theme-aware-card {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;

  h3 {
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
  }

  .highlight {
    background: var(--accent);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
}
```
````

**Result:**

```scss
.theme-aware-card {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;

  h3 {
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
  }

  .highlight {
    background: var(--accent);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
}
```

---

## SCSS Features

### Variables

````markdown
```scss
// Define variables
$card-padding: 1.5rem;
$card-radius: 8px;
$shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.1);

.card {
  padding: $card-padding;
  border-radius: $card-radius;
  box-shadow: $shadow-soft;
}
```
````

**Result:**

```scss
// Define variables
$card-padding: 1.5rem;
$card-radius: 8px;
$shadow-soft: 0 2px 8px rgba(0, 0, 0, 0.1);

.card {
  padding: $card-padding;
  border-radius: $card-radius;
  box-shadow: $shadow-soft;
}
```

### Nesting

````markdown
```scss
.navigation {
  display: flex;
  gap: 1rem;

  .nav-item {
    padding: 0.5rem 1rem;

    a {
      color: var(--text-primary);
      text-decoration: none;

      &:hover {
        color: var(--accent);
      }
    }

    &.active {
      border-bottom: 2px solid var(--accent);
    }
  }
}
```
````

**Result:**

```scss
.navigation {
  display: flex;
  gap: 1rem;

  .nav-item {
    padding: 0.5rem 1rem;

    a {
      color: var(--text-primary);
      text-decoration: none;

      &:hover {
        color: var(--accent);
      }
    }

    &.active {
      border-bottom: 2px solid var(--accent);
    }
  }
}
```

### Parent Selector (&)

````markdown
```scss
.button {
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--accent-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--large {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }

  &--outline {
    background: transparent;
    border: 2px solid var(--accent);
    color: var(--accent);
  }
}
```
````

**Result:**

```scss
.button {
  background: var(--accent);
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--accent-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--large {
    padding: 1rem 2rem;
    font-size: 1.2rem;
  }

  &--outline {
    background: transparent;
    border: 2px solid var(--accent);
    color: var(--accent);
  }
}
```

### Mixins

````markdown
```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin card-base {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.centered-container {
  @include flex-center;
  min-height: 200px;
}

.info-card {
  @include card-base;
  @include flex-center;
  flex-direction: column;
}
```
````

**Result:**

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin card-base {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-color);
}

.centered-container {
  @include flex-center;
  min-height: 200px;
}

.info-card {
  @include card-base;
  @include flex-center;
  flex-direction: column;
}
```

### Mixin with Parameters

````markdown
```scss
@mixin button-variant($bg, $hover-bg) {
  background: $bg;

  &:hover {
    background: $hover-bg;
  }
}

.btn-primary {
  @include button-variant(var(--accent), var(--accent-hover));
}

.btn-success {
  @include button-variant(var(--color-success), darken(#22c55e, 10%));
}
```
````

**Result:**

```scss
@mixin button-variant($bg, $hover-bg) {
  background: $bg;

  &:hover {
    background: $hover-bg;
  }
}

.btn-primary {
  @include button-variant(var(--accent), var(--accent-hover));
}

.btn-success {
  @include button-variant(var(--color-success), darken(#22c55e, 10%));
}
```

### Extend/Inheritance

````markdown
```scss
%message-base {
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.message-info {
  @extend %message-base;
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--color-info);
}

.message-warning {
  @extend %message-base;
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--color-warning);
}

.message-error {
  @extend %message-base;
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error);
}
```
````

**Result:**

```scss
%message-base {
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.message-info {
  @extend %message-base;
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--color-info);
}

.message-warning {
  @extend %message-base;
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--color-warning);
}

.message-error {
  @extend %message-base;
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error);
}
```

### Math Operations

````markdown
```scss
$base-size: 16px;
$spacing-unit: 8px;

.component {
  font-size: $base-size;
  padding: $spacing-unit * 2;          // 16px
  margin-bottom: $spacing-unit * 3;    // 24px

  .title {
    font-size: $base-size * 1.5;       // 24px
  }

  .small-text {
    font-size: $base-size * 0.875;     // 14px
  }
}
```
````

**Result:**

```scss
$base-size: 16px;
$spacing-unit: 8px;

.component {
  font-size: $base-size;
  padding: $spacing-unit * 2;          // 16px
  margin-bottom: $spacing-unit * 3;    // 24px

  .title {
    font-size: $base-size * 1.5;       // 24px
  }

  .small-text {
    font-size: $base-size * 0.875;     // 14px
  }
}
```

### Conditionals

````markdown
```scss
@mixin theme-aware($theme: 'light') {
  @if $theme == 'dark' {
    background: #1a1a2e;
    color: #ffffff;
  } @else {
    background: #ffffff;
    color: #1a1a2e;
  }
}

.dark-section {
  @include theme-aware('dark');
}

.light-section {
  @include theme-aware('light');
}
```
````

**Result:**

```scss
@mixin theme-aware($theme: 'light') {
  @if $theme == 'dark' {
    background: #1a1a2e;
    color: #ffffff;
  } @else {
    background: #ffffff;
    color: #1a1a2e;
  }
}

.dark-section {
  @include theme-aware('dark');
}

.light-section {
  @include theme-aware('light');
}
```

### Loops

````markdown
```scss
// Generate spacing utilities
@for $i from 1 through 5 {
  .mt-#{$i} {
    margin-top: $i * 0.25rem;
  }

  .mb-#{$i} {
    margin-bottom: $i * 0.25rem;
  }

  .p-#{$i} {
    padding: $i * 0.25rem;
  }
}

// Generate color classes
$colors: (
  'primary': var(--accent),
  'success': var(--color-success),
  'warning': var(--color-warning),
  'error': var(--color-error)
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }

  .bg-#{$name} {
    background: $color;
  }
}
```
````

**Result:**

```scss
// Generate spacing utilities
@for $i from 1 through 5 {
  .mt-#{$i} {
    margin-top: $i * 0.25rem;
  }

  .mb-#{$i} {
    margin-bottom: $i * 0.25rem;
  }

  .p-#{$i} {
    padding: $i * 0.25rem;
  }
}

// Generate color classes
$colors: (
  'primary': var(--accent),
  'success': var(--color-success),
  'warning': var(--color-warning),
  'error': var(--color-error)
);

@each $name, $color in $colors {
  .text-#{$name} {
    color: $color;
  }

  .bg-#{$name} {
    background: $color;
  }
}
```

---

## Directive Syntax

Alternative syntax using MD++ directives:

### Basic Style Directive

````markdown
:::custom-styles:style
.my-class {
  color: red;
}
:::
````

**Result:**

:::custom-styles:style
.my-class {
  color: red;
}
:::

### With Language Attribute

````markdown
:::custom-styles:style{lang="scss"}
$color: blue;
.my-class {
  color: $color;
}
:::
````

**Result:**

:::custom-styles:style{lang="scss"}
$color: blue;
.my-class {
  color: $color;
}
:::

### Scoped Attribute

````markdown
:::custom-styles:style{scoped}
/* Styles are scoped to this document section */
.local-style {
  font-style: italic;
}
:::
````

**Result:**

:::custom-styles:style{scoped}
/* Styles are scoped to this document section */
.local-style {
  font-style: italic;
}
:::

---

## Visual Indicators

### Applied Styles

When styles are successfully applied, the code block shows:
- Green left border
- "Applied" label in the top-right corner

### Error State

When SCSS compilation fails:
- Red left border
- "Error" label in the top-right corner
- Error message displayed below the code

---

## Complete Examples

### Custom Document Theme

````markdown
# My Styled Document

```scss
// Document-wide theme customization
$heading-color: #2563eb;
$link-color: #7c3aed;

h1, h2, h3 {
  color: $heading-color;
  font-family: 'Georgia', serif;
}

a {
  color: $link-color;
  text-decoration: none;
  border-bottom: 1px dashed $link-color;

  &:hover {
    border-bottom-style: solid;
  }
}

blockquote {
  background: var(--bg-secondary);
  border-left: 4px solid $heading-color;
  padding: 1rem;
  font-style: italic;
}

code {
  background: var(--bg-code);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}
```

## Introduction

This document uses custom styling defined above.

> This blockquote has custom styling.

Check out [this link](#) with custom hover effects.
````

**Result:**

```scss
// Document-wide theme customization
$heading-color: #2563eb;
$link-color: #7c3aed;

h1, h2, h3 {
  color: $heading-color;
  font-family: 'Georgia', serif;
}

a {
  color: $link-color;
  text-decoration: none;
  border-bottom: 1px dashed $link-color;

  &:hover {
    border-bottom-style: solid;
  }
}

blockquote {
  background: var(--bg-secondary);
  border-left: 4px solid $heading-color;
  padding: 1rem;
  font-style: italic;
}

code {
  background: var(--bg-code);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
}
```

### Card Layout System

````markdown
```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .card-title {
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .card-description {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}
```
````

**Result:**

```scss
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .card-title {
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .card-description {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}
```

### Animated Components

````markdown
```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animated-element {
  animation: fadeIn 0.5s ease-out;
}

.pulsing-button {
  background: var(--accent);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  animation: pulse 2s infinite;

  &:hover {
    animation: none;
    transform: scale(1.05);
  }
}
```
````

**Result:**

```scss
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.animated-element {
  animation: fadeIn 0.5s ease-out;
}

.pulsing-button {
  background: var(--accent);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  animation: pulse 2s infinite;

  &:hover {
    animation: none;
    transform: scale(1.05);
  }
}
```

---

## Best Practices

1. **Use theme variables** - Ensures styles adapt to different themes
2. **Scope selectors** - Use specific class names to avoid conflicts
3. **Keep styles organized** - Group related styles together
4. **Use SCSS for complex styles** - Leverage nesting and variables
5. **Test in both themes** - Verify styles work in light and dark modes
6. **Avoid !important** - Use specific selectors instead
7. **Comment your code** - Document complex style logic
