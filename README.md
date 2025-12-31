# MD++ (Markdown Plus Plus)

Extended Markdown with Framework-Agnostic Component Directives and AI Context Blocks.

## Architecture

MD++ is designed as a **3-tier system** where each layer can be used independently:

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 3: Electron Desktop App (optional)                    │
│  - Full-featured desktop editor                             │
│  - File management, menus, export                           │
│  - Uses Tier 2 components                                   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Tier 2: React Components (optional)                        │
│  - <MDPPEditor> - Monaco-based editor                       │
│  - <MDPPPreview> - Live preview component                   │
│  - <MDPPSplitView> - Combined editor/preview                │
│  - Uses Tier 1 parser                                       │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│  Tier 1: Pure JavaScript Parser (core)                      │
│  - Works in ANY JavaScript environment                      │
│  - No React, no Electron, no build tools required           │
│  - Single script tag for browser usage                      │
│  - Full MD++ parsing and HTML rendering                     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Option 1: Browser (No Build Tools Required)

Include a single script tag and start using MD++ immediately:

```html
<!-- Include the browser bundle -->
<script src="https://unpkg.com/@gorduan/mdplusplus/dist/mdplusplus.browser.global.js"></script>

<script>
  // Create parser instance
  const parser = new MDPlusPlus.MDPlusPlus();

  // Parse markdown
  const result = await parser.convert('# Hello **MD++**!');

  // Use the HTML
  document.getElementById('preview').innerHTML = result.html;
</script>
```

See `examples/vanilla-browser.html` for a complete working example.

### Option 2: npm/pnpm (With Build Tools)

```bash
npm install @gorduan/mdplusplus
# or
pnpm add @gorduan/mdplusplus
```

```javascript
import { MDPlusPlus } from '@gorduan/mdplusplus';

const parser = new MDPlusPlus();
const result = await parser.convert('# Hello **MD++**!');
console.log(result.html);
```

### Option 3: React Components

```tsx
import { MDPPPreview } from '@gorduan/mdplusplus/components';

function App() {
  return <MDPPPreview value="# Hello **MD++**!" />;
}
```

### Option 4: Desktop App

```bash
cd MDPlusPlus
pnpm install
node start-dev.cjs
```

## Features

- **Pure JavaScript Parser**: Works in any browser, Node.js, or JavaScript runtime
- **Zero Dependencies for Browser**: Single file bundle (~190KB) with everything included
- **Component Directives**: Use `:::component{attributes}` syntax for styled elements
- **AI Context Blocks**: Hidden context for AI assistants with `:::ai-context`
- **Plugin System**: JSON-based plugins for any CSS framework
- **React Components**: Optional embeddable editor and preview components
- **Electron Desktop App**: Optional full-featured desktop editor

## Tier 1: Pure JavaScript Parser

The core parser has **zero framework dependencies** and works everywhere JavaScript runs.

### Browser Usage (Vanilla JS)

```html
<!DOCTYPE html>
<html>
<head>
  <title>MD++ Example</title>
</head>
<body>
  <textarea id="input"># Hello MD++</textarea>
  <div id="output"></div>

  <script src="dist/mdplusplus.browser.global.js"></script>
  <script>
    const parser = new MDPlusPlus.MDPlusPlus();
    const input = document.getElementById('input');
    const output = document.getElementById('output');

    async function render() {
      const result = await parser.convert(input.value);
      output.innerHTML = result.html;
    }

    input.addEventListener('input', render);
    render();
  </script>
</body>
</html>
```

### Node.js Usage

```javascript
import { MDPlusPlus } from '@gorduan/mdplusplus';

const parser = new MDPlusPlus();

const markdown = `
# Welcome to MD++

This is **bold** and *italic* text.

:::ai-context{visibility=hidden}
This context is only visible to AI tools.
:::
`;

const result = await parser.convert(markdown);
console.log(result.html);
console.log(result.aiContexts); // AI context blocks
```

### With Plugins

```javascript
import { MDPlusPlus, PluginLoader } from '@gorduan/mdplusplus';
import vcm3Plugin from '@gorduan/mdplusplus/plugins/vcm3.json';

const loader = new PluginLoader();
const plugin = loader.loadFromJSON(vcm3Plugin);

const parser = new MDPlusPlus({ plugins: [plugin] });

const result = await parser.convert(`
:::card{.shadow}
This is a styled card component.
:::
`);
```

### Parser API

```typescript
// Create parser
const parser = new MDPlusPlus(options?: ParserOptions);

// Options
interface ParserOptions {
  plugins?: PluginDefinition[];  // CSS framework plugins
  showAIContext?: boolean;       // Render hidden AI context (default: false)
}

// Convert markdown to HTML
const result = await parser.convert(markdown: string);

// Result object
interface RenderResult {
  html: string;                   // Rendered HTML
  aiContexts: AIContext[];        // Extracted AI context blocks
  frontmatter?: Record<string, any>;  // YAML frontmatter
  errors: RenderError[];          // Parse warnings/errors
}
```

## Tier 2: React Components

Optional React components for building editors and previews.

### MDPPPreview

Renders MD++ content:

```tsx
import { MDPPPreview } from '@gorduan/mdplusplus/components';

<MDPPPreview
  value="# Hello MD++"
  showAIContext={false}
  darkMode={true}
  height="400px"
/>
```

### MDPPEditor

Monaco-based editor with MD++ syntax highlighting:

```tsx
import { MDPPEditor } from '@gorduan/mdplusplus/components';

<MDPPEditor
  value={content}
  onChange={setContent}
  darkMode={true}
  height="400px"
/>
```

### MDPPSplitView

Combined editor and preview:

```tsx
import { MDPPSplitView } from '@gorduan/mdplusplus/components';

<MDPPSplitView
  value={content}
  onChange={setContent}
  defaultViewMode="split"
  height="600px"
/>
```

## Tier 3: Electron Desktop App

Full-featured desktop application built on Tiers 1 and 2.

### Running

```bash
# Development mode
node start-dev.cjs

# Build for production
pnpm run electron:build
```

### Features

- Monaco Editor with MD++ syntax highlighting
- Live preview with VCM3 dark theme
- File operations (New, Open, Save, Save As)
- Smart format detection (*.md vs *.mdpp)
- Export to HTML
- View modes: Editor, Split, Preview
- DevTools toggle

## MD++ Syntax

### Standard Markdown

All standard Markdown syntax is supported: headings, bold, italic, links, images, code blocks, lists, tables, etc.

### Component Directives

```markdown
<!-- Block directive -->
:::card{.shadow}
Card content with **markdown**.
:::

<!-- Leaf directive (no content) -->
::divider{.my-4}

<!-- With framework namespace -->
:::bootstrap:alert{variant="warning"}
Warning message!
:::
```

### AI Context Blocks

```markdown
<!-- Hidden from output (for AI tools only) -->
:::ai-context{visibility=hidden}
Project context for AI assistants.
:::

<!-- Visible in output -->
:::ai-context{visibility=visible}
Visible context block.
:::
```

## Creating Plugins

Plugins define how component directives are rendered:

```json
{
  "framework": "myframework",
  "version": "1.0.0",
  "components": {
    "card": {
      "tag": "div",
      "classes": ["card", "shadow"],
      "variants": {
        "primary": ["bg-blue-500"],
        "secondary": ["bg-gray-500"]
      }
    },
    "alert": {
      "tag": "div",
      "classes": ["alert"],
      "variants": {
        "warning": ["alert-warning"],
        "error": ["alert-error"]
      }
    }
  }
}
```

Usage:
```markdown
:::myframework:card{variant="primary"}
Content
:::
```

## Build Outputs

| File | Size | Description |
|------|------|-------------|
| `dist/index.js` | ~10KB | ESM module (requires bundler) |
| `dist/mdplusplus.browser.global.js` | ~190KB | Browser bundle (all deps included) |
| `dist/components/index.js` | ~25KB | React components |

## Scripts

```bash
# Build all (parser + browser bundle + components)
pnpm build

# Development (Electron app)
node start-dev.cjs

# Type check
pnpm typecheck

# Run tests
pnpm test
```

## Browser Compatibility

The browser bundle works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## License

MIT
