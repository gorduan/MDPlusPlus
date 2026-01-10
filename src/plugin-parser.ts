/**
 * MD++ Plugin-Aware Parser
 *
 * Extended parser that integrates with the Plugin System.
 * Builds processing pipeline dynamically from activated plugins.
 *
 * This wraps/extends the base MDPlusPlus parser to add:
 * - Plugin Registry integration
 * - Dynamic pipeline configuration based on active plugins
 * - Plugin-provided remark/rehype plugins
 * - Code block handlers from plugins
 */

import { unified, type Plugin } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import matter from 'gray-matter';

import type {
  RenderResult,
  RenderError,
  AIContext,
  ParserOptions,
  SecurityConfig,
  PluginDefinition,
} from './types';

import {
  PluginRegistry,
  createPluginRegistry,
  type MDPlusPlusPlugin,
  type RegisteredPlugin,
} from './plugin-system';

/**
 * Extended parser options with plugin registry
 */
export interface PluginParserOptions extends ParserOptions {
  /** Plugin registry instance (creates new one if not provided) */
  registry?: PluginRegistry;

  /** Automatically activate all registered plugins */
  autoActivate?: boolean;
}

/**
 * Pipeline configuration built from plugins
 */
interface PipelineConfig {
  remarkPlugins: Array<Plugin | [Plugin, unknown]>;
  rehypePlugins: Array<Plugin | [Plugin, unknown]>;
  codeBlockLanguages: Map<string, MDPlusPlusPlugin>;
}

/**
 * MD++ Plugin-Aware Parser
 */
export class MDPlusPlusWithPlugins {
  private registry: PluginRegistry;
  private legacyPlugins: Map<string, PluginDefinition> = new Map();
  private errors: RenderError[] = [];
  private aiContexts: AIContext[] = [];
  private options: PluginParserOptions;
  private security: SecurityConfig;

  private static readonly DEFAULT_SECURITY: SecurityConfig = {
    profile: 'warn',
    allowParserCode: false,
    allowHTMLCode: false,
    warnOnCode: true,
    trustedSources: [],
    blockedSources: [],
  };

  constructor(options: PluginParserOptions = {}) {
    this.options = options;
    this.security = {
      ...MDPlusPlusWithPlugins.DEFAULT_SECURITY,
      ...options.security,
    };

    // Use provided registry or create new one
    this.registry = options.registry || createPluginRegistry();

    // Register legacy plugins if provided
    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.registerLegacyPlugin(plugin);
      }
    }
  }

  /**
   * Get the plugin registry
   */
  getRegistry(): PluginRegistry {
    return this.registry;
  }

  /**
   * Register a legacy plugin (old format)
   */
  registerLegacyPlugin(plugin: PluginDefinition): void {
    if (this.legacyPlugins.has(plugin.framework)) {
      console.warn(`[MDPlusPlus] Legacy plugin "${plugin.framework}" is already registered.`);
    }
    this.legacyPlugins.set(plugin.framework, plugin);

    // Also register in the new registry
    this.registry.registerLegacy({
      framework: plugin.framework,
      version: plugin.version,
      author: plugin.author,
      description: plugin.description,
      css: plugin.css,
      js: plugin.js,
      init: plugin.init,
      codeBlockLanguages: (plugin as any).codeBlockLanguages,
      components: plugin.components,
    });
  }

  /**
   * Register a plugin from manifest and instance
   */
  async registerPlugin(
    manifest: any,
    instance: MDPlusPlusPlugin,
    autoActivate: boolean = false
  ): Promise<void> {
    this.registry.register(manifest, '');
    this.registry.setInstance(manifest.id, instance);

    if (autoActivate) {
      await this.registry.activate(manifest.id);
    }
  }

  /**
   * Activate a plugin by ID
   */
  async activatePlugin(pluginId: string): Promise<void> {
    await this.registry.activate(pluginId);
  }

  /**
   * Deactivate a plugin by ID
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    await this.registry.deactivate(pluginId);
  }

  /**
   * Get all active plugins
   */
  getActivePlugins(): RegisteredPlugin[] {
    return this.registry.getActive();
  }

  /**
   * Build pipeline configuration from active plugins
   */
  private buildPipelineConfig(): PipelineConfig {
    const config: PipelineConfig = {
      remarkPlugins: [],
      rehypePlugins: [],
      codeBlockLanguages: new Map(),
    };

    // Get active plugins sorted by priority
    const activePlugins = this.registry
      .getActive()
      .filter((p) => p.instance)
      .sort((a, b) => {
        const priorityA = a.manifest.parser?.priority ?? 100;
        const priorityB = b.manifest.parser?.priority ?? 100;
        return priorityB - priorityA; // Higher priority first
      });

    for (const registered of activePlugins) {
      const instance = registered.instance!;

      // Collect remark plugins
      if (instance.remarkPlugins) {
        const plugins = instance.remarkPlugins();
        config.remarkPlugins.push(...plugins);
      }

      // Collect rehype plugins
      if (instance.rehypePlugins) {
        const plugins = instance.rehypePlugins();
        config.rehypePlugins.push(...plugins);
      }

      // Collect code block handlers
      if (instance.codeBlockHandler && registered.manifest.parser?.codeBlockLanguages) {
        for (const lang of registered.manifest.parser.codeBlockLanguages) {
          config.codeBlockLanguages.set(lang.toLowerCase(), instance);
        }
      }
    }

    return config;
  }

  /**
   * Check if a feature is enabled (defaults to true)
   */
  private isEnabled(feature: keyof ParserOptions): boolean {
    const value = this.options[feature];
    return value === undefined ? true : Boolean(value);
  }

  /**
   * Convert MD++ markdown to HTML using plugin pipeline
   */
  async convert(markdown: string): Promise<RenderResult> {
    // Reset state
    this.errors = [];
    this.aiContexts = [];

    // Parse frontmatter
    const { content, data: frontmatter } = matter(markdown);

    // Preprocess directives and callouts
    let processedContent = content;
    if (this.isEnabled('enableDirectives') || this.isEnabled('enableCallouts')) {
      processedContent = this.preprocessDirectives(content);
    }

    // Build pipeline from plugins
    const pipelineConfig = this.buildPipelineConfig();

    // Build processor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let processor: any = unified().use(remarkParse);

    // GFM: tables, strikethrough, task lists, autolinks
    if (this.isEnabled('enableGfm')) {
      processor = processor.use(remarkGfm);
    }

    // Directives (:::plugin:component)
    if (this.isEnabled('enableDirectives')) {
      processor = processor.use(remarkDirective);
      processor = processor.use(this.createDirectivePlugin());
    }

    // Add remark plugins from active plugins
    for (const plugin of pipelineConfig.remarkPlugins) {
      if (Array.isArray(plugin)) {
        processor = processor.use(plugin[0], plugin[1]);
      } else {
        processor = processor.use(plugin);
      }
    }

    // Code block handling (from plugins and built-in)
    processor = processor.use(this.createCodeBlockPlugin(pipelineConfig.codeBlockLanguages));

    // Convert to HTML
    processor = processor.use(remarkRehype, { allowDangerousHtml: true });

    // Add rehype plugins from active plugins
    for (const plugin of pipelineConfig.rehypePlugins) {
      if (Array.isArray(plugin)) {
        processor = processor.use(plugin[0], plugin[1]);
      } else {
        processor = processor.use(plugin);
      }
    }

    // Heading anchors
    if (this.isEnabled('enableHeadingAnchors')) {
      processor = processor.use(rehypeSlug);
      processor = processor.use(rehypeAutolinkHeadings, { behavior: 'wrap' });
    }

    // Stringify
    processor = processor.use(rehypeStringify, { allowDangerousHtml: true });

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
   * Get required assets for all active plugins
   */
  getRequiredAssets(): { css: string[]; js: string[] } {
    const css: string[] = [];
    const js: string[] = [];

    // From new registry
    for (const plugin of this.registry.getActive()) {
      if (plugin.manifest.assets?.css) {
        css.push(...plugin.manifest.assets.css);
      }
      if (plugin.manifest.assets?.js) {
        js.push(...plugin.manifest.assets.js);
      }
    }

    // From legacy plugins
    for (const plugin of this.legacyPlugins.values()) {
      if (plugin.css) css.push(...plugin.css);
      if (plugin.js) js.push(...plugin.js);
    }

    return { css: [...new Set(css)], js: [...new Set(js)] };
  }

  /**
   * Preprocess directives and callouts
   */
  private preprocessDirectives(content: string): string {
    // Replace :::framework:component[...] with :::framework_component[...]
    // Also handle ::framework:component (leaf directives), :framework:component (text directives)
    // and ::::framework:component (nested containers with 4+ colons)
    // BUT skip content inside code blocks (``` ... ```)

    // First, extract and protect code blocks
    const codeBlocks: string[] = [];
    let processed = content.replace(/```[\s\S]*?```/g, (match) => {
      codeBlocks.push(match);
      return `\x00CODE_BLOCK_${codeBlocks.length - 1}\x00`;
    });

    // Now apply directive preprocessing - support 1+ colons for nesting
    processed = processed.replace(/(:{1,})([\w-]+):([\w-]+)(\[|{|\s|$)/g, '$1$2_$3$4');

    // Restore code blocks
    processed = processed.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, index) => {
      return codeBlocks[parseInt(index, 10)];
    });

    // Convert GitHub/Obsidian-style callouts to directives
    processed = processed.replace(
      /^(>[ ]?)\[!(\w+)\][ ]?(.*)$/gm,
      (match, prefix, type, title) => {
        const typeLower = type.toLowerCase();
        const titleAttr = title.trim() ? `[${title.trim()}]` : '';
        return `:::__callout__admonitions_${typeLower}${titleAttr}`;
      }
    );

    // Close callout blocks
    processed = this.closeCalloutBlocks(processed);

    // Remove the callout marker after processing
    processed = processed.replace(/:::__callout__/g, ':::');

    return processed;
  }

  /**
   * Close callout blocks that were opened from GitHub/Obsidian syntax
   */
  private closeCalloutBlocks(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let inCallout = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith(':::__callout__')) {
        inCallout = true;
        result.push(line);
        continue;
      }

      if (inCallout) {
        if (line.startsWith('> ') || line.startsWith('>')) {
          result.push(line.replace(/^>[ ]?/, ''));
        } else if (line.trim() === '') {
          const nextLine = lines[i + 1];
          if (nextLine && (nextLine.startsWith('> ') || nextLine.startsWith('>'))) {
            result.push(line);
          } else {
            result.push(':::');
            result.push(line);
            inCallout = false;
          }
        } else {
          result.push(':::');
          result.push(line);
          inCallout = false;
        }
      } else {
        result.push(line);
      }
    }

    if (inCallout) {
      result.push(':::');
    }

    return result.join('\n');
  }

  /**
   * Generate HTML error alerts for parsing errors
   */
  private generateErrorAlerts(): string {
    let alerts = '';

    for (const error of this.errors) {
      const alertClass =
        error.type === 'invalid-syntax' || error.type === 'security-blocked'
          ? 'mdpp-error-danger'
          : 'mdpp-error-warning';
      const icon =
        error.type === 'invalid-syntax' || error.type === 'security-blocked' ? '❌' : '⚠️';

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
    const assets = this.getRequiredAssets();
    let tags = '';

    for (const cssUrl of assets.css) {
      tags += `<link rel="stylesheet" href="${cssUrl}">\n`;
    }
    for (const jsUrl of assets.js) {
      tags += `<script src="${jsUrl}"></script>\n`;
    }

    return tags;
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
   * Create the remark plugin for handling special code blocks
   */
  private createCodeBlockPlugin(codeBlockHandlers: Map<string, MDPlusPlusPlugin>) {
    const self = this;

    // Built-in languages
    const builtinLanguages = new Set(['mermaid', 'math', 'latex', 'katex']);

    return function codeBlockPlugin() {
      return (tree: any) => {
        visit(tree, 'code', (node: any) => {
          const lang = node.lang?.toLowerCase();

          if (!lang) return;

          // Check plugin handlers first
          const handler = codeBlockHandlers.get(lang);
          if (handler?.codeBlockHandler) {
            const result = handler.codeBlockHandler(lang, node.value, node.meta);
            if (result !== null) {
              node.type = 'html';
              node.value = result;
              return;
            }
          }

          // Built-in handling
          if (builtinLanguages.has(lang)) {
            node.type = 'html';
            node.value = self.renderBuiltinCodeBlock(lang, node.value);
          }
        });

        // Handle math nodes from remark-math
        visit(tree, 'math', (node: any) => {
          node.type = 'html';
          node.value = `<div class="math math-display" data-math-style="display">${self.escapeHtml(node.value)}</div>`;
        });

        visit(tree, 'inlineMath', (node: any) => {
          node.type = 'html';
          node.value = `<span class="math math-inline" data-math-style="inline">${self.escapeHtml(node.value)}</span>`;
        });
      };
    };
  }

  /**
   * Render a built-in special code block
   */
  private renderBuiltinCodeBlock(language: string, code: string): string {
    switch (language) {
      case 'mermaid':
        return `<pre class="mermaid">${this.escapeHtml(code)}</pre>`;
      case 'math':
      case 'latex':
      case 'katex':
        return `<div class="math math-display" data-math-style="display">${this.escapeHtml(code)}</div>`;
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
    const { name, attributes = {} } = node;

    // Skip if no name (can happen with malformed directives)
    if (!name) {
      return;
    }

    // Parse framework_component or framework:component from name
    let framework: string | undefined;
    let component: string;

    if (name.includes('_')) {
      const parts = name.split('_');
      framework = parts[0];
      component = parts.slice(1).join('_');
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

    // Find component definition from registry or legacy plugins
    let componentDef: any;
    let foundFramework: string | undefined;

    if (framework) {
      // Check new registry first
      const registered = this.registry.get(framework);
      if (registered?.status === 'active' && registered.manifest.components?.[component]) {
        componentDef = registered.manifest.components[component];
        foundFramework = framework;
      }
      // Then check legacy plugins
      if (!componentDef) {
        const legacyPlugin = this.legacyPlugins.get(framework);
        if (legacyPlugin?.components[component]) {
          componentDef = legacyPlugin.components[component];
          foundFramework = framework;
        }
      }

      if (!componentDef) {
        this.errors.push({
          type: 'unknown-component',
          title: 'Unknown Component',
          message: `Component "${component}" not found in plugin "${framework}".`,
        });
      }
    } else {
      // Search all active plugins and legacy plugins
      for (const registered of this.registry.getActive()) {
        if (registered.manifest.components?.[component]) {
          componentDef = registered.manifest.components[component];
          foundFramework = registered.manifest.id;
          break;
        }
      }
      if (!componentDef) {
        for (const plugin of this.legacyPlugins.values()) {
          if (plugin.components[component]) {
            componentDef = plugin.components[component];
            foundFramework = plugin.framework;
            break;
          }
        }
      }
    }

    // Build HTML
    const hast = this.buildHAST(node, componentDef, attributes);

    // Replace node data
    node.data = node.data || {};

    // If we have a wrapper, we need to handle it specially
    if (hast.wrapperTag) {
      // Create wrapper structure by modifying the node
      // The wrapper becomes the outer element, and we nest the original inside
      node.data.hName = hast.wrapperTag;
      node.data.hProperties = hast.wrapperProperties;

      // Wrap existing children in the inner element
      const innerChildren = node.children || [];
      node.children = [{
        type: 'containerDirective',
        data: {
          hName: hast.tagName,
          hProperties: hast.properties
        },
        children: innerChildren
      }];
    } else {
      node.data.hName = hast.tagName;
      node.data.hProperties = hast.properties;
    }
  }

  /**
   * Handle AI context directive
   */
  private handleAIContext(node: any, attributes: Record<string, any>): void {
    const directiveLabel = this.extractDirectiveLabel(node);
    const visibility = directiveLabel || attributes.visibility || 'hidden';

    let content = '';
    if (node.children) {
      content = this.extractText(node.children);
    }

    this.aiContexts.push({
      visible: visibility === 'visible',
      content,
      metadata: {
        ...attributes,
        visibility,
      },
    });

    if (visibility === 'html-hidden') {
      node.type = 'html';
      node.value = '<!-- AI Context (html-hidden) -->';
      node.children = undefined;
    } else if (visibility === 'hidden' && !this.options.showAIContext) {
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: ['mdpp-ai-context', 'mdpp-ai-hidden'],
        'data-ai-context': 'true',
        'data-visibility': 'hidden',
        style: 'display: none;',
      };
    } else {
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: ['mdpp-ai-context', 'mdpp-ai-visible'],
        'data-ai-context': 'true',
        'data-visibility': visibility,
      };
    }
  }

  /**
   * Extract the label from a directive node
   */
  private extractDirectiveLabel(node: any): string | undefined {
    if (node.attributes?.label) {
      return node.attributes.label;
    }

    if (node.children && node.children.length > 0) {
      const firstChild = node.children[0];
      if (firstChild.type === 'text' && firstChild.value) {
        const match = firstChild.value.match(/^\[([\w-]+)\]/);
        if (match) {
          firstChild.value = firstChild.value.replace(/^\[([\w-]+)\]\s*/, '');
          return match[1];
        }
      }
    }

    return undefined;
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
  ): { tagName: string; properties: Record<string, any>; wrapperTag?: string; wrapperProperties?: Record<string, any> } {
    const tagName = componentDef?.tag || 'div';
    const componentClasses: string[] = componentDef?.classes ? [...componentDef.classes] : [];

    // Handle variant - support multiple space-separated variants: variant="striped hover"
    const variantValue = attributes.variant || attributes.type;
    if (variantValue && componentDef?.variants) {
      const variants = String(variantValue).split(/\s+/).filter(Boolean);
      for (const v of variants) {
        if (componentDef.variants[v]) {
          componentClasses.push(...componentDef.variants[v]);
        }
      }
    }

    // Build properties
    const properties: Record<string, any> = {};

    // Apply default attributes from component definition first
    if (componentDef?.defaultAttributes) {
      for (const [key, value] of Object.entries(componentDef.defaultAttributes)) {
        properties[key] = value;
      }
    }

    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'variant') continue;

      if (key === 'class' || key === 'className') {
        componentClasses.push(...String(value).split(/\s+/).filter(Boolean));
      } else if (key === 'id') {
        properties.id = value;
      } else if (key.startsWith('.')) {
        componentClasses.push(key.slice(1));
      } else if (key.startsWith('#')) {
        properties.id = key.slice(1);
      } else if (value === '' || value === true) {
        properties[key] = true;
      } else {
        properties[key] = value;
      }
    }

    if (componentClasses.length > 0) {
      properties.className = [...new Set(componentClasses)];
    }

    // Handle wrapper element
    const result: { tagName: string; properties: Record<string, any>; wrapperTag?: string; wrapperProperties?: Record<string, any> } = { tagName, properties };

    if (componentDef?.wrapperTag) {
      result.wrapperTag = componentDef.wrapperTag;
      result.wrapperProperties = {};
      if (componentDef.wrapperClasses?.length > 0) {
        result.wrapperProperties.className = [...componentDef.wrapperClasses];
      }
    }

    return result;
  }
}

/**
 * Create a new plugin-aware parser
 */
export function createPluginParser(options: PluginParserOptions = {}): MDPlusPlusWithPlugins {
  return new MDPlusPlusWithPlugins(options);
}
