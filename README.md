# MD++ (Markdown Plus Plus)

Extended Markdown with Framework-Agnostic Component Directives and AI Context Blocks.

## Features

- **Component Directives**: Use `:::framework:component[Title]{attributes}` syntax
- **Plugin System**: JSON-based plugin definitions for any CSS framework
- **AI Context Blocks**: Hidden context for AI assistants with `:::ai-context[hidden]`
- **Framework Agnostic**: Works with Bootstrap, Tailwind, or custom frameworks
- **TypeScript**: Full type definitions included

## Installation

```bash
npm install @gorduan/mdplusplus
# or
pnpm add @gorduan/mdplusplus
```

## Quick Start

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

## Included Plugins

- `plugins/vcm3.json` - VCM3 native components
- `plugins/bootstrap.json` - Bootstrap 5 components

## License

MIT
