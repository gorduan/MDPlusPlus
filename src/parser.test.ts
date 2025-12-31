/**
 * MD++ Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { MDPlusPlus, PluginLoader } from './index';

describe('MDPlusPlus Parser', () => {
  describe('basic markdown', () => {
    it('converts heading to HTML with anchor', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert('# Hello World');
      expect(result.html).toContain('id="hello-world"');
      expect(result.html).toContain('Hello World');
      expect(result.html).toContain('<h1');
    });

    it('converts bold text', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert('**bold text**');
      expect(result.html).toContain('<strong>bold text</strong>');
    });

    it('converts italic text', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert('*italic text*');
      expect(result.html).toContain('<em>italic text</em>');
    });

    it('converts code blocks', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert('```js\nconst x = 1;\n```');
      expect(result.html).toContain('<code');
      expect(result.html).toContain('const x = 1;');
    });
  });

  describe('frontmatter', () => {
    it('parses YAML frontmatter', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert(`---
title: Test
author: MDPlusPlus
---
# Content`);
      expect(result.frontmatter?.title).toBe('Test');
      expect(result.frontmatter?.author).toBe('MDPlusPlus');
    });
  });

  describe('AI context blocks', () => {
    it('extracts visible AI context', async () => {
      const parser = new MDPlusPlus({ showAIContext: true });
      const result = await parser.convert(`
:::ai-context{visibility=visible}
This is visible context.
:::`);
      expect(result.aiContexts.length).toBe(1);
      expect(result.aiContexts[0].visible).toBe(true);
    });

    it('extracts hidden AI context', async () => {
      const parser = new MDPlusPlus({ showAIContext: false });
      const result = await parser.convert(`
:::ai-context{visibility=hidden}
This is hidden context.
:::`);
      expect(result.aiContexts.length).toBe(1);
      expect(result.aiContexts[0].visible).toBe(false);
    });
  });

  describe('directive preprocessing', () => {
    it('handles framework:component syntax', async () => {
      const bootstrapPlugin = {
        framework: 'bootstrap',
        version: '5.0.0',
        components: {
          alert: {
            tag: 'div',
            classes: ['alert']
          }
        }
      };

      const parser = new MDPlusPlus({ plugins: [bootstrapPlugin] });
      const result = await parser.convert(`
:::bootstrap:alert
Alert content
:::`);
      expect(result.html).toContain('class="alert"');
      expect(result.errors.length).toBe(0);
    });
  });

  describe('error handling', () => {
    it('reports missing plugin error', async () => {
      const parser = new MDPlusPlus();
      const result = await parser.convert(`
:::unknown:component
Content
:::`);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('missing-plugin');
    });

    it('generates error alerts in HTML', async () => {
      const parser = new MDPlusPlus({ suppressErrors: false });
      const result = await parser.convert(`
:::unknown:widget
Content
:::`);
      expect(result.html).toContain('mdpp-error');
    });

    it('suppresses error alerts when configured', async () => {
      const parser = new MDPlusPlus({ suppressErrors: true });
      const result = await parser.convert(`
:::unknown:widget
Content
:::`);
      expect(result.html).not.toContain('mdpp-error');
    });
  });

  describe('plugin system', () => {
    it('registers plugins correctly', async () => {
      const plugin = {
        framework: 'test',
        version: '1.0.0',
        components: {
          box: { tag: 'div', classes: ['test-box'] }
        }
      };

      const parser = new MDPlusPlus({ plugins: [plugin] });
      expect(parser.getPlugins().length).toBe(1);
      expect(parser.getPlugins()[0].framework).toBe('test');
    });

    it('applies component classes', async () => {
      const plugin = {
        framework: 'test',
        version: '1.0.0',
        components: {
          card: { tag: 'div', classes: ['test-card', 'shadow'] }
        }
      };

      const parser = new MDPlusPlus({ plugins: [plugin] });
      const result = await parser.convert(`
:::test:card
Card content
:::`);
      expect(result.html).toContain('test-card');
      expect(result.html).toContain('shadow');
    });

    it('applies variants', async () => {
      const plugin = {
        framework: 'test',
        version: '1.0.0',
        components: {
          alert: {
            tag: 'div',
            classes: ['alert'],
            variants: {
              success: ['alert-success'],
              danger: ['alert-danger']
            }
          }
        }
      };

      const parser = new MDPlusPlus({ plugins: [plugin] });
      const result = await parser.convert(`
:::test:alert{variant="success"}
Success message
:::`);
      expect(result.html).toContain('alert-success');
    });
  });

  describe('asset loading', () => {
    it('returns required assets from plugins', async () => {
      const plugin = {
        framework: 'bootstrap',
        version: '5.0.0',
        css: ['https://cdn.example.com/bootstrap.css'],
        js: ['https://cdn.example.com/bootstrap.js'],
        components: {}
      };

      const parser = new MDPlusPlus({ plugins: [plugin] });
      const assets = parser.getRequiredAssets();
      expect(assets.css).toContain('https://cdn.example.com/bootstrap.css');
      expect(assets.js).toContain('https://cdn.example.com/bootstrap.js');
    });

    it('generates asset tags when includeAssets is true', async () => {
      const plugin = {
        framework: 'test',
        version: '1.0.0',
        css: ['https://cdn.example.com/test.css'],
        js: ['https://cdn.example.com/test.js'],
        components: {}
      };

      const parser = new MDPlusPlus({ plugins: [plugin], includeAssets: true });
      const result = await parser.convert('# Test');
      expect(result.html).toContain('<link rel="stylesheet"');
      expect(result.html).toContain('https://cdn.example.com/test.css');
      expect(result.html).toContain('<script src=');
      expect(result.html).toContain('https://cdn.example.com/test.js');
    });
  });
});

describe('GFM features', () => {
  it('renders tables', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert(`
| A | B |
|---|---|
| 1 | 2 |
`);
    expect(result.html).toContain('<table>');
    expect(result.html).toContain('<th>');
    expect(result.html).toContain('<td>');
  });

  it('renders task lists', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert(`
- [x] Done
- [ ] Todo
`);
    expect(result.html).toContain('type="checkbox"');
    expect(result.html).toContain('checked');
  });

  it('renders strikethrough', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert('~~deleted~~');
    expect(result.html).toContain('<del>deleted</del>');
  });

  it('renders autolinks', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert('Visit https://github.com');
    expect(result.html).toContain('<a href="https://github.com"');
  });
});

describe('Math support', () => {
  it('renders inline math', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert('Inline $E=mc^2$ math');
    expect(result.html).toContain('math-inline');
    expect(result.html).toContain('E=mc^2');
  });

  it('renders display math', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert('$$\\sum_{i=1}^n x_i$$');
    // Display math should have language-math class
    expect(result.html).toContain('language-math');
  });

  it('renders math code block', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert(`
\`\`\`math
\\frac{a}{b}
\`\`\`
`);
    expect(result.html).toContain('class="math math-display"');
  });
});

describe('Mermaid support', () => {
  it('converts mermaid code blocks to pre.mermaid', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert(`
\`\`\`mermaid
graph TD
    A --> B
\`\`\`
`);
    expect(result.html).toContain('<pre class="mermaid">');
    expect(result.html).toContain('graph TD');
    expect(result.html).toContain('A --&gt; B');
  });

  it('escapes HTML in mermaid code', async () => {
    const parser = new MDPlusPlus();
    const result = await parser.convert(`
\`\`\`mermaid
graph TD
    A[<script>alert('xss')</script>] --> B
\`\`\`
`);
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).not.toContain('<script>');
  });
});

describe('PluginLoader', () => {
  it('loads plugins from JSON', () => {
    const loader = new PluginLoader();
    const plugin = loader.loadFromJSON({
      framework: 'test',
      version: '1.0.0',
      components: {
        box: { tag: 'div', classes: ['box'] }
      }
    });
    expect(plugin.framework).toBe('test');
    expect(plugin.components.box.tag).toBe('div');
  });

  it('validates plugin structure', () => {
    const loader = new PluginLoader();
    expect(() => loader.loadFromJSON(null)).toThrow();
    expect(() => loader.loadFromJSON({})).toThrow('framework');
    expect(() => loader.loadFromJSON({ framework: 'test' })).toThrow('components');
  });

  it('parses CSS/JS arrays', () => {
    const loader = new PluginLoader();
    const plugin = loader.loadFromJSON({
      framework: 'test',
      version: '1.0.0',
      css: ['https://example.com/style.css'],
      js: ['https://example.com/script.js'],
      components: {}
    });
    expect(plugin.css).toEqual(['https://example.com/style.css']);
    expect(plugin.js).toEqual(['https://example.com/script.js']);
  });
});
