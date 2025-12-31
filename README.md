# MD++ (Markdown Plus Plus)

Extended Markdown with Framework-Agnostic Component Directives and AI Context Blocks.

**Now available as a standalone Electron desktop app and embeddable React components!**

## Features

- **Standalone Electron App**: Full-featured desktop editor with Monaco Editor
- **Embeddable React Components**: Use `<MDPPEditor>`, `<MDPPPreview>`, `<MDPPSplitView>` in any React app
- **Component Directives**: Use `:::framework:component[Title]{attributes}` syntax
- **Plugin System**: JSON-based plugin definitions for any CSS framework
- **AI Context Blocks**: Hidden context for AI assistants with `:::ai-context[hidden]`
- **Live Preview**: Real-time rendering with syntax highlighting
- **Framework Agnostic**: Works with Bootstrap, Tailwind, or custom frameworks
- **TypeScript**: Full type definitions included

## Installation

```bash
npm install @gorduan/mdplusplus
# or
pnpm add @gorduan/mdplusplus
```

## Standalone Desktop App

### Running the Desktop App

```bash
# Development mode
pnpm run electron:dev

# Build for production
pnpm run electron:build
```

### Features

- Monaco Editor with MD++ syntax highlighting
- Live preview pane
- File operations (New, Open, Save, Save As)
- Export to HTML
- Split view, Editor only, Preview only modes
- AI Context visibility toggle
- Keyboard shortcuts

## Embeddable React Components

### MDPPEditor

A Monaco-based editor with MD++ syntax highlighting:

```tsx
import { MDPPEditor } from '@gorduan/mdplusplus/components';

function MyApp() {
  const [content, setContent] = useState('# Hello MD++');

  return (
    <MDPPEditor
      value={content}
      onChange={setContent}
      height="400px"
      darkMode={true}
      fontSize={14}
    />
  );
}
```

### MDPPPreview

Renders MD++ content as HTML:

```tsx
import { MDPPPreview } from '@gorduan/mdplusplus/components';

function MyApp() {
  return (
    <MDPPPreview
      value="# Hello MD++"
      showAIContext={false}
      darkMode={true}
      height="400px"
    />
  );
}
```

### MDPPSplitView

Combined editor and preview with toolbar:

```tsx
import { MDPPSplitView } from '@gorduan/mdplusplus/components';

function MyApp() {
  const [content, setContent] = useState('# Hello MD++');

  return (
    <MDPPSplitView
      value={content}
      onChange={setContent}
      height="600px"
      defaultViewMode="split"
      showToolbar={true}
    />
  );
}
```

## Parser API

### Quick Start

```typescript
import { MDPlusPlus, PluginLoader } from '@gorduan/mdplusplus';

// Load a plugin
const loader = new PluginLoader();
const vcm3Plugin = loader.loadFromJSON(require('./plugins/vcm3.json'));

// Create parser with plugin
const mdpp = new MDPlusPlus({
  plugins: [vcm3Plugin]
});

// Convert markdown
const result = await mdpp.convert(`
# Hello World

:::vcm3:card[My Card]
This is card content with **markdown** support.
:::

:::ai-context[hidden]
This context is only visible to AI assistants.
:::
`);

console.log(result.html);
console.log(result.aiContexts); // AI context blocks
```

## Directive Syntax

### Basic Directive
```markdown
:::component[Title]
Content here
:::
```

### With Framework Namespace
```markdown
:::bootstrap:card[Card Title]
Card content
:::
```

### With Attributes
```markdown
:::vcm3:alert[Warning]{variant="warning"}
Alert message
:::
```

## AI Context Blocks

AI context blocks provide hidden information for AI assistants:

```markdown
:::ai-context[hidden]
Project: E-commerce Platform
Stack: React, Node.js, PostgreSQL
Current Sprint: User Authentication
:::
```

These blocks can be:
- `[hidden]` - Not rendered in output (default)
- `[visible]` - Rendered with special styling

## Creating Plugins

Plugins are JSON files that define components:

```json
{
  "framework": "myframework",
  "version": "1.0.0",
  "components": {
    "card": {
      "tag": "div",
      "classes": ["card", "shadow-md"],
      "variants": {
        "primary": ["bg-blue-500"],
        "secondary": ["bg-gray-500"]
      }
    }
  }
}
```

## API Reference

### MDPlusPlus

```typescript
const mdpp = new MDPlusPlus(options?: ParserOptions);

// Register a plugin
mdpp.registerPlugin(plugin: PluginDefinition);

// Convert markdown to HTML
const result = await mdpp.convert(markdown: string);
// Returns: { html, aiContexts, frontmatter, errors }
```

### PluginLoader

```typescript
const loader = new PluginLoader();

// Load from JSON
const plugin = loader.loadFromJSON(json);

// Load multiple plugins
const plugins = loader.loadPlugins([json1, json2]);

// Get loaded plugin
const plugin = loader.getPlugin('framework-name');
```

### AI Context Utilities

```typescript
import { extractAIContext, hasAIContext } from '@gorduan/mdplusplus';

// Quick extraction without full parsing
const contexts = extractAIContext(markdown);

// Check if content has AI context
if (hasAIContext(markdown)) {
  // Handle AI context
}
```

## Component Props

### MDPPEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Markdown content |
| onChange | (value: string) => void | - | Change callback |
| height | string \| number | '400px' | Editor height |
| darkMode | boolean | true | Dark theme |
| lineNumbers | boolean | true | Show line numbers |
| wordWrap | boolean | true | Enable word wrap |
| fontSize | number | 14 | Font size |
| readOnly | boolean | false | Read-only mode |
| onCursorChange | (pos) => void | - | Cursor position callback |

### MDPPPreview Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Markdown content |
| showAIContext | boolean | false | Show AI context blocks |
| plugins | PluginDefinition[] | [] | Custom plugins |
| height | string \| number | 'auto' | Preview height |
| darkMode | boolean | true | Dark theme |
| sanitize | boolean | true | Sanitize HTML output |
| onRender | (result) => void | - | Render complete callback |
| debounceMs | number | 150 | Debounce delay |

### MDPPSplitView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | required | Markdown content |
| onChange | (value: string) => void | - | Change callback |
| defaultViewMode | 'split' \| 'editor' \| 'preview' | 'split' | Initial view mode |
| height | string \| number | '500px' | Component height |
| darkMode | boolean | true | Dark theme |
| showAIContext | boolean | false | Show AI context blocks |
| showToolbar | boolean | true | Show toolbar |
| readOnly | boolean | false | Read-only mode |

## Included Plugins

- `plugins/vcm3.json` - VCM3 native components
- `plugins/bootstrap.json` - Bootstrap 5 components

## Scripts

```bash
# Build parser library
pnpm run build:parser

# Build embeddable components
pnpm run build:components

# Build everything
pnpm run build

# Run Electron app in dev mode
pnpm run electron:dev

# Build Electron app for distribution
pnpm run electron:build

# Type check
pnpm run typecheck

# Run tests
pnpm run test
```

## License

MIT
