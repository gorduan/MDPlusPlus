/**
 * MD++ Parser - Markdown Plus Plus
 * Converts MD++ syntax to HTML with plugin support
 *
 * Works in ANY JavaScript environment:
 * - Browser (with script tag)
 * - Node.js
 * - Electron
 * - Any bundler
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';
import type {
  PluginDefinition,
  RenderResult,
  RenderError,
  AIContext,
  ParserOptions,
  SecurityConfig
} from './types';

/**
 * Default security configuration
 */
const DEFAULT_SECURITY: SecurityConfig = {
  profile: 'warn',
  allowParserCode: false,
  allowHTMLCode: false,
  warnOnCode: true,
  trustedSources: [],
  blockedSources: [],
};

/**
 * MD++ Parser class
 */
export class MDPlusPlus {
  private plugins: Map<string, PluginDefinition> = new Map();
  private errors: RenderError[] = [];
  private aiContexts: AIContext[] = [];
  private options: ParserOptions;
  private security: SecurityConfig;

  constructor(options: ParserOptions = {}) {
    this.options = options;
    this.security = { ...DEFAULT_SECURITY, ...options.security };

    // Register any plugins passed in options
    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.registerPlugin(plugin);
      }
    }
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: PluginDefinition): void {
    if (this.plugins.has(plugin.framework)) {
      console.warn(`Plugin "${plugin.framework}" is already registered. Overwriting.`);
    }
    this.plugins.set(plugin.framework, plugin);
  }

  /**
   * Get registered plugins
   */
  getPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Convert MD++ markdown to HTML
   */
  async convert(markdown: string): Promise<RenderResult> {
    // Reset state
    this.errors = [];
    this.aiContexts = [];

    // Parse frontmatter
    const { content, data: frontmatter } = matter(markdown);

    // Preprocess directives: :::framework:component → :::framework_component
    const processedContent = this.preprocessDirectives(content);

    // Create processor
    const processor = unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(this.createDirectivePlugin())
      .use(this.createCodeBlockPlugin())
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true });

    // Process markdown
    const result = await processor.process(processedContent);
    let html = String(result);

    // Prepend error alerts if any (unless suppressed)
    if (this.errors.length > 0 && !this.options.suppressErrors) {
      html = this.generateErrorAlerts() + html;
    }

    // Prepend plugin assets if requested
    if (this.options.includeAssets) {
      html = this.generateAssetTags() + html;
    }

    return {
      html,
      aiContexts: this.aiContexts,
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
      errors: this.errors,
    };
  }

  /**
   * Preprocess directives to convert :::framework:component to :::framework_component
   * This is needed because remark-directive doesn't support colons in names
   */
  private preprocessDirectives(content: string): string {
    // Replace :::framework:component[...] with :::framework_component[...]
    return content.replace(/:::([\w-]+):([\w-]+)(\[|{|\s|$)/g, ':::$1_$2$3');
  }

  /**
   * Generate HTML error alerts for parsing errors
   */
  private generateErrorAlerts(): string {
    let alerts = '';

    for (const error of this.errors) {
      const alertClass = error.type === 'invalid-syntax' || error.type === 'security-blocked'
        ? 'mdpp-error-danger'
        : 'mdpp-error-warning';
      const icon = error.type === 'invalid-syntax' || error.type === 'security-blocked'
        ? '❌'
        : '⚠️';

      const title = error.title || this.getErrorTitle(error.type);

      alerts += `
<div class="mdpp-error ${alertClass}" role="alert">
  <strong>${icon} ${title}</strong>
  <p>${error.message}</p>
  ${error.details ? `<details><summary>Details</summary><pre>${error.details}</pre></details>` : ''}
</div>
`;
    }

    return alerts;
  }

  /**
   * Get default error title based on type
   */
  private getErrorTitle(type: string): string {
    const titles: Record<string, string> = {
      'missing-plugin': 'Plugin Not Found',
      'unknown-component': 'Unknown Component',
      'invalid-syntax': 'Invalid Syntax',
      'nesting-error': 'Nesting Error',
      'security-blocked': 'Security Blocked',
    };
    return titles[type] || 'Error';
  }

  /**
   * Generate CSS/JS asset tags for loaded plugins
   */
  private generateAssetTags(): string {
    let tags = '';

    for (const plugin of this.plugins.values()) {
      // Add CSS links
      if (plugin.css) {
        for (const cssUrl of plugin.css) {
          tags += `<link rel="stylesheet" href="${cssUrl}">\n`;
        }
      }
      // Add JS scripts
      if (plugin.js) {
        for (const jsUrl of plugin.js) {
          tags += `<script src="${jsUrl}"></script>\n`;
        }
      }
    }

    return tags;
  }

  /**
   * Get required assets for loaded plugins (for manual inclusion)
   */
  getRequiredAssets(): { css: string[]; js: string[] } {
    const css: string[] = [];
    const js: string[] = [];

    for (const plugin of this.plugins.values()) {
      if (plugin.css) css.push(...plugin.css);
      if (plugin.js) js.push(...plugin.js);
    }

    return { css, js };
  }

  /**
   * Create the remark plugin for handling directives
   */
  private createDirectivePlugin() {
    const self = this;

    return function directivePlugin() {
      return (tree: any) => {
        visit(tree, (node: any) => {
          if (
            node.type === 'containerDirective' ||
            node.type === 'leafDirective' ||
            node.type === 'textDirective'
          ) {
            self.processDirective(node);
          }
        });
      };
    };
  }

  /**
   * Create the remark plugin for handling special code blocks (mermaid, etc.)
   */
  private createCodeBlockPlugin() {
    const self = this;

    // Get languages that need special handling from plugins
    const specialLanguages = new Set<string>();
    for (const plugin of this.plugins.values()) {
      if ((plugin as any).codeBlockLanguages) {
        for (const lang of (plugin as any).codeBlockLanguages) {
          specialLanguages.add(lang);
        }
      }
    }
    // Always support mermaid
    specialLanguages.add('mermaid');

    return function codeBlockPlugin() {
      return (tree: any) => {
        visit(tree, 'code', (node: any) => {
          const lang = node.lang?.toLowerCase();

          if (lang && specialLanguages.has(lang)) {
            // Convert to HTML node for special rendering
            node.type = 'html';
            node.value = self.renderSpecialCodeBlock(lang, node.value);
          }
        });
      };
    };
  }

  /**
   * Render a special code block (mermaid, etc.)
   */
  private renderSpecialCodeBlock(language: string, code: string): string {
    switch (language) {
      case 'mermaid':
        // Mermaid.js expects content in a <pre class="mermaid"> tag
        return `<pre class="mermaid">${this.escapeHtml(code)}</pre>`;
      default:
        return `<pre class="${language}"><code>${this.escapeHtml(code)}</code></pre>`;
    }
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Process a directive node
   */
  private processDirective(node: any): void {
    const { name, attributes = {}, children = [] } = node;

    // Parse framework_component or framework:component from name
    let framework: string | undefined;
    let component: string;

    // After preprocessing, :::bootstrap:card becomes :::bootstrap_card
    if (name.includes('_')) {
      const parts = name.split('_');
      framework = parts[0];
      component = parts.slice(1).join('_'); // Handle components with underscores
    } else if (name.includes(':')) {
      [framework, component] = name.split(':');
    } else {
      component = name;
    }

    // Handle AI context specially
    if (component === 'ai-context') {
      this.handleAIContext(node, attributes);
      return;
    }

    // Find the plugin
    let plugin: PluginDefinition | undefined;
    if (framework) {
      plugin = this.plugins.get(framework);
      if (!plugin) {
        this.errors.push({
          type: 'missing-plugin',
          title: 'Plugin Not Found',
          message: `Plugin "${framework}" is not registered.`,
          details: `Syntax: :::${framework}:${component}\nLoaded plugins: ${this.getPluginNames().join(', ') || 'none'}`,
        });
      }
    } else {
      // Try to find component in any plugin
      for (const p of this.plugins.values()) {
        if (p.components[component]) {
          plugin = p;
          framework = p.framework;
          break;
        }
      }
    }

    // Find component definition
    const componentDef = plugin?.components[component];
    if (!componentDef && plugin) {
      const availableComponents = Object.keys(plugin.components).slice(0, 10).join(', ');
      this.errors.push({
        type: 'unknown-component',
        title: 'Unknown Component',
        message: `Component "${component}" not found in plugin "${framework}".`,
        details: `Available components: ${availableComponents}${Object.keys(plugin.components).length > 10 ? '...' : ''}`,
      });
    }

    // Build HTML
    const hast = this.buildHAST(node, componentDef, attributes);

    // Replace node data
    node.data = node.data || {};
    node.data.hName = hast.tagName;
    node.data.hProperties = hast.properties;
  }

  /**
   * Get list of loaded plugin names
   */
  private getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Handle AI context directive
   */
  private handleAIContext(node: any, attributes: Record<string, any>): void {
    const visibility = attributes.visibility || node.children?.[0]?.value || 'hidden';
    const isHidden = visibility === 'hidden';

    // Extract content from children
    let content = '';
    if (node.children) {
      content = this.extractText(node.children);
    }

    this.aiContexts.push({
      visible: !isHidden,
      content,
      metadata: attributes,
    });

    // If hidden and not showing AI context, don't render
    if (isHidden && !this.options.showAIContext) {
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: ['mdpp-ai-context', 'hidden'],
        'data-ai-context': 'true'
      };
    } else {
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: ['mdpp-ai-context'],
        'data-ai-context': 'true'
      };
    }
  }

  /**
   * Extract text content from node children
   */
  private extractText(children: any[]): string {
    return children
      .map((child: any) => {
        if (child.type === 'text') return child.value;
        if (child.children) return this.extractText(child.children);
        return '';
      })
      .join('');
  }

  /**
   * Build HAST node from directive
   */
  private buildHAST(
    node: any,
    componentDef: any,
    attributes: Record<string, any>
  ): { tagName: string; properties: Record<string, any> } {
    // Parse classes from attributes
    const classes: string[] = [];
    const props: Record<string, any> = {};

    // Add component classes
    if (componentDef?.classes) {
      classes.push(...componentDef.classes);
    }

    // Parse attributes (classes, id, custom attrs)
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'class' || key === 'className') {
        classes.push(...String(value).split(' '));
      } else if (key === 'id') {
        props.id = value;
      } else if (key.startsWith('.')) {
        // Class shorthand
        classes.push(key.slice(1));
      } else if (key.startsWith('#')) {
        // ID shorthand
        props.id = key.slice(1);
      } else {
        props[key] = value;
      }
    }

    // Handle variant if specified
    if (attributes.variant && componentDef?.variants?.[attributes.variant]) {
      classes.push(...componentDef.variants[attributes.variant]);
    }

    if (classes.length > 0) {
      props.className = classes;
    }

    return {
      tagName: componentDef?.tag || 'div',
      properties: props,
    };
  }
}
