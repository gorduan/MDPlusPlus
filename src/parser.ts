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
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import matter from 'gray-matter';
import type {
  PluginDefinition,
  RenderResult,
  RenderError,
  AIContext,
  ParserOptions,
  SecurityConfig,
  ScriptBlockData,
  ScriptRenderResult,
  AIPlaceholderData,
  FullRenderResult,
  FileFormat,
  FormatCapabilities,
  StyleBlockData
} from './types';
import {
  detectFileFormat,
  getFormatCapabilities,
  FORMAT_CAPABILITIES
} from './types';
import { remarkScriptBlock, extractScriptsFromFile } from './plugins/script-block';
import { remarkAIPlaceholder, extractPlaceholdersFromFile } from './plugins/ai-placeholder';
import { remarkMaterialIcons } from './plugins/material-icons';
import { remarkStyleBlock, extractStylesFromFile } from './plugins/style-block';
import { remarkKroki, getKrokiLanguages, type KrokiPluginOptions } from './plugins/kroki';

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
   * Detect component naming conflicts between plugins
   * Returns a map of component names to the plugins that define them
   */
  detectPluginConflicts(): Map<string, string[]> {
    const componentToPlugins = new Map<string, string[]>();

    for (const plugin of this.plugins.values()) {
      for (const componentName of Object.keys(plugin.components)) {
        const existing = componentToPlugins.get(componentName) || [];
        existing.push(plugin.framework);
        componentToPlugins.set(componentName, existing);
      }
    }

    // Filter to only include conflicts (more than one plugin defines the component)
    const conflicts = new Map<string, string[]>();
    for (const [component, plugins] of componentToPlugins) {
      if (plugins.length > 1) {
        conflicts.set(component, plugins);
      }
    }

    return conflicts;
  }

  /**
   * Get a detailed conflict report as a string
   */
  getConflictReport(): string {
    const conflicts = this.detectPluginConflicts();

    if (conflicts.size === 0) {
      return 'No plugin conflicts detected.';
    }

    let report = `Plugin Conflicts Detected:\n`;
    report += `${'─'.repeat(50)}\n\n`;

    for (const [component, plugins] of conflicts) {
      report += `Component: "${component}"\n`;
      report += `  Defined in: ${plugins.join(', ')}\n`;
      report += `  Resolution: Use framework prefix (e.g., :::${plugins[0]}:${component})\n\n`;
    }

    report += `${'─'.repeat(50)}\n`;
    report += `Recommendation: Always use framework prefix to avoid ambiguity.\n`;
    report += `Example: :::bootstrap:card instead of :::card\n`;

    return report;
  }

  /**
   * Check if a specific component has conflicts
   */
  hasComponentConflict(componentName: string): boolean {
    let count = 0;
    for (const plugin of this.plugins.values()) {
      if (plugin.components[componentName]) {
        count++;
        if (count > 1) return true;
      }
    }
    return false;
  }

  /**
   * Check if a feature is enabled (defaults to true)
   */
  private isEnabled(feature: keyof ParserOptions): boolean {
    const value = this.options[feature];
    return value === undefined ? true : Boolean(value);
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

    // Preprocess directives and callouts (only if enabled)
    let processedContent = content;
    if (this.isEnabled('enableDirectives') || this.isEnabled('enableCallouts')) {
      processedContent = this.preprocessDirectives(content);
    }

    // Build processor pipeline based on enabled features
    // Using any type to avoid complex unified processor generic types
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

    // Material Icons (![icon](google:name))
    if (this.isEnabled('enableMaterialIcons')) {
      processor = processor.use(remarkMaterialIcons);
    }

    // Math/LaTeX
    if (this.isEnabled('enableMath')) {
      processor = processor.use(remarkMath);
    }

    // Kroki diagrams (plantuml, graphviz, d2, etc.)
    if (this.isEnabled('enableKroki')) {
      processor = processor.use(remarkKroki, {
        serverUrl: this.options.krokiServerUrl || 'https://kroki.io',
      } as KrokiPluginOptions);
    }

    // Code block handling (mermaid, math blocks)
    processor = processor.use(this.createCodeBlockPlugin());

    // Style blocks (:::style, :::link-css)
    if (this.isEnabled('enableStyles')) {
      processor = processor.use(remarkStyleBlock);
    }

    // MarkdownScript blocks (:::script)
    if (this.isEnabled('enableScripts')) {
      processor = processor.use(remarkScriptBlock);
    }

    // Convert to HTML
    processor = processor.use(remarkRehype, { allowDangerousHtml: true });

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
   * Convert MD++ markdown to HTML with script extraction
   * Returns both HTML and script block data for execution
   */
  async convertWithScripts(markdown: string): Promise<ScriptRenderResult> {
    // Reset state
    this.errors = [];
    this.aiContexts = [];

    // Parse frontmatter
    const { content, data: frontmatter } = matter(markdown);

    // Preprocess directives and callouts (only if enabled)
    let processedContent = content;
    if (this.isEnabled('enableDirectives') || this.isEnabled('enableCallouts')) {
      processedContent = this.preprocessDirectives(content);
    }

    // Build processor pipeline based on enabled features
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

    // Material Icons (![icon](google:name))
    if (this.isEnabled('enableMaterialIcons')) {
      processor = processor.use(remarkMaterialIcons);
    }

    // Math/LaTeX
    if (this.isEnabled('enableMath')) {
      processor = processor.use(remarkMath);
    }

    // Kroki diagrams (plantuml, graphviz, d2, etc.)
    if (this.isEnabled('enableKroki')) {
      processor = processor.use(remarkKroki, {
        serverUrl: this.options.krokiServerUrl || 'https://kroki.io',
      } as KrokiPluginOptions);
    }

    // Code block handling (mermaid, math blocks)
    processor = processor.use(this.createCodeBlockPlugin());

    // Style blocks (:::style, :::link-css)
    if (this.isEnabled('enableStyles')) {
      processor = processor.use(remarkStyleBlock);
    }

    // MarkdownScript blocks (:::script) - always enabled for this method
    processor = processor.use(remarkScriptBlock);

    // Convert to HTML
    processor = processor.use(remarkRehype, { allowDangerousHtml: true });

    // Heading anchors
    if (this.isEnabled('enableHeadingAnchors')) {
      processor = processor.use(rehypeSlug);
      processor = processor.use(rehypeAutolinkHeadings, { behavior: 'wrap' });
    }

    // Stringify
    processor = processor.use(rehypeStringify, { allowDangerousHtml: true });

    // Process markdown
    const file = await processor.process(processedContent);
    let html = String(file);

    // Extract scripts from file data
    const scripts: ScriptBlockData[] = extractScriptsFromFile(file);

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
      scripts,
    };
  }

  /**
   * Convert MD++ markdown with full feature extraction
   * Returns HTML, scripts, AND AI placeholders for processing
   */
  async convertFull(markdown: string): Promise<FullRenderResult> {
    // Reset state
    this.errors = [];
    this.aiContexts = [];

    // Parse frontmatter
    const { content, data: frontmatter } = matter(markdown);

    // Preprocess directives and callouts (only if enabled)
    let processedContent = content;
    if (this.isEnabled('enableDirectives') || this.isEnabled('enableCallouts')) {
      processedContent = this.preprocessDirectives(content);
    }

    // Build processor pipeline based on enabled features
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

    // Material Icons (![icon](google:name))
    if (this.isEnabled('enableMaterialIcons')) {
      processor = processor.use(remarkMaterialIcons);
    }

    // Math/LaTeX
    if (this.isEnabled('enableMath')) {
      processor = processor.use(remarkMath);
    }

    // Kroki diagrams (plantuml, graphviz, d2, etc.)
    if (this.isEnabled('enableKroki')) {
      processor = processor.use(remarkKroki, {
        serverUrl: this.options.krokiServerUrl || 'https://kroki.io',
      } as KrokiPluginOptions);
    }

    // Code block handling (mermaid, math blocks)
    processor = processor.use(this.createCodeBlockPlugin());

    // Style blocks (:::style, :::link-css)
    if (this.isEnabled('enableStyles')) {
      processor = processor.use(remarkStyleBlock);
    }

    // MarkdownScript blocks (:::script)
    processor = processor.use(remarkScriptBlock);

    // AI Placeholders (:::ai-generate, :ai{})
    processor = processor.use(remarkAIPlaceholder);

    // Convert to HTML
    processor = processor.use(remarkRehype, { allowDangerousHtml: true });

    // Heading anchors
    if (this.isEnabled('enableHeadingAnchors')) {
      processor = processor.use(rehypeSlug);
      processor = processor.use(rehypeAutolinkHeadings, { behavior: 'wrap' });
    }

    // Stringify
    processor = processor.use(rehypeStringify, { allowDangerousHtml: true });

    // Process markdown
    const file = await processor.process(processedContent);
    let html = String(file);

    // Extract scripts, placeholders, and styles from file data
    const scripts: ScriptBlockData[] = extractScriptsFromFile(file);
    const placeholders: AIPlaceholderData[] = extractPlaceholdersFromFile(file);
    const styles: StyleBlockData[] = extractStylesFromFile(file);

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
      scripts,
      placeholders,
      styles,
      format: 'mdsc' as FileFormat, // convertFull assumes full features
    };
  }

  /**
   * Convert markdown with format-aware feature detection
   * Automatically detects format from filename and enables appropriate features
   *
   * @param markdown - The markdown content to convert
   * @param filename - Optional filename to detect format (e.g., 'doc.md', 'doc.mdsc')
   * @param formatOverride - Optional explicit format override
   */
  async convertWithFormat(
    markdown: string,
    filename?: string,
    formatOverride?: FileFormat
  ): Promise<FullRenderResult> {
    // Determine format
    const format: FileFormat = formatOverride || (filename ? detectFileFormat(filename) : 'mdplus');
    const caps = getFormatCapabilities(format);

    // Reset state
    this.errors = [];
    this.aiContexts = [];

    // Parse frontmatter
    const { content, data: frontmatter } = matter(markdown);

    // Preprocess directives and callouts (only if enabled by format)
    let processedContent = content;
    if (caps.components || caps.callouts) {
      processedContent = this.preprocessDirectives(content);
    }

    // Build processor pipeline based on format capabilities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let processor: any = unified().use(remarkParse);

    // GFM: tables, strikethrough, task lists, autolinks
    if (caps.gfm) {
      processor = processor.use(remarkGfm);
    }

    // Directives (:::plugin:component) - needed for components, callouts, ai-context, scripts, styles
    if (caps.components || caps.callouts || caps.aiContext || caps.scripts || caps.styles) {
      processor = processor.use(remarkDirective);
      processor = processor.use(this.createDirectivePlugin());
    }

    // Material Icons (![icon](google:name)) - check ParserOptions
    if (this.isEnabled('enableMaterialIcons')) {
      processor = processor.use(remarkMaterialIcons);
    }

    // Math/LaTeX
    if (caps.math) {
      processor = processor.use(remarkMath);
    }

    // Kroki diagrams (plantuml, graphviz, d2, etc.)
    if (this.isEnabled('enableKroki')) {
      processor = processor.use(remarkKroki, {
        serverUrl: this.options.krokiServerUrl || 'https://kroki.io',
      } as KrokiPluginOptions);
    }

    // Code block handling (mermaid, math blocks)
    if (caps.mermaid || caps.math) {
      processor = processor.use(this.createCodeBlockPlugin());
    }

    // Style blocks (:::style, :::link-css)
    if (caps.styles) {
      processor = processor.use(remarkStyleBlock);
    }

    // MarkdownScript blocks (:::script) - only for .mdsc
    if (caps.scripts) {
      processor = processor.use(remarkScriptBlock);
    }

    // AI Placeholders (:::ai-generate, :ai{}) - for mdplus and mdsc
    if (caps.aiPlaceholders) {
      processor = processor.use(remarkAIPlaceholder);
    }

    // Convert to HTML
    processor = processor.use(remarkRehype, { allowDangerousHtml: true });

    // Heading anchors
    if (this.isEnabled('enableHeadingAnchors')) {
      processor = processor.use(rehypeSlug);
      processor = processor.use(rehypeAutolinkHeadings, { behavior: 'wrap' });
    }

    // Stringify
    processor = processor.use(rehypeStringify, { allowDangerousHtml: true });

    // Process markdown
    const file = await processor.process(processedContent);
    let html = String(file);

    // Extract data based on format capabilities
    const scripts: ScriptBlockData[] = caps.scripts ? extractScriptsFromFile(file) : [];
    const placeholders: AIPlaceholderData[] = caps.aiPlaceholders ? extractPlaceholdersFromFile(file) : [];
    const styles: StyleBlockData[] = caps.styles ? extractStylesFromFile(file) : [];

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
      scripts,
      placeholders,
      styles: caps.styles ? styles : undefined,
      format,
    };
  }

  /**
   * Get format capabilities for a file
   */
  static getCapabilities(format: FileFormat): FormatCapabilities {
    return getFormatCapabilities(format);
  }

  /**
   * Detect format from filename
   */
  static detectFormat(filename: string): FileFormat {
    return detectFileFormat(filename);
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

    // Now apply directive preprocessing
    processed = processed.replace(/(:{1,})([\w-]+):([\w-]+)(\[|{|\s|$)/g, '$1$2_$3$4');

    // Restore code blocks
    processed = processed.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, index) => {
      return codeBlocks[parseInt(index, 10)];
    });

    // Convert GitHub/Obsidian-style callouts to directives
    // > [!NOTE]        -> :::admonitions_note
    // > [!WARNING]     -> :::admonitions_warning
    // > [!TIP] Title   -> :::admonitions_tip[Title]
    // We mark these with a special prefix so closeCalloutBlocks can identify them
    processed = processed.replace(
      /^(>[ ]?)\[!(\w+)\][ ]?(.*)$/gm,
      (match, prefix, type, title) => {
        const typeLower = type.toLowerCase();
        const titleAttr = title.trim() ? `[${title.trim()}]` : '';
        // Use a marker to distinguish GitHub callouts from manual directives
        return `:::__callout__admonitions_${typeLower}${titleAttr}`;
      }
    );

    // Close callout blocks (only for converted GitHub/Obsidian callouts)
    processed = this.closeCalloutBlocks(processed);

    // Remove the callout marker after processing
    processed = processed.replace(/:::__callout__/g, ':::');

    return processed;
  }

  /**
   * Close callout blocks that were opened from GitHub/Obsidian syntax
   * Only processes blocks that have the __callout__ marker (converted from > [!TYPE] syntax)
   * Manual :::admonitions_* directives are NOT modified
   */
  private closeCalloutBlocks(content: string): string {
    const lines = content.split('\n');
    const result: string[] = [];
    let inCallout = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Only process callouts that were converted from GitHub/Obsidian syntax
      // These have the __callout__ marker
      if (line.startsWith(':::__callout__')) {
        inCallout = true;
        result.push(line);
        continue;
      }

      // If we're in a converted callout and hit a non-blockquote line
      if (inCallout) {
        if (line.startsWith('> ') || line.startsWith('>')) {
          // Continue the callout, remove the > prefix
          result.push(line.replace(/^>[ ]?/, ''));
        } else if (line.trim() === '') {
          // Empty line might continue the callout, check next line
          const nextLine = lines[i + 1];
          if (nextLine && (nextLine.startsWith('> ') || nextLine.startsWith('>'))) {
            result.push(line);
          } else {
            // End the callout
            result.push(':::');
            result.push(line);
            inCallout = false;
          }
        } else {
          // Non-blockquote content, end the callout
          result.push(':::');
          result.push(line);
          inCallout = false;
        }
      } else {
        result.push(line);
      }
    }

    // Close any remaining open callout
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
   * Create the remark plugin for handling special code blocks (mermaid, math, etc.)
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
    // Always support these
    specialLanguages.add('mermaid');
    specialLanguages.add('math');
    specialLanguages.add('latex');
    specialLanguages.add('katex');

    return function codeBlockPlugin() {
      return (tree: any) => {
        // Handle code blocks
        visit(tree, 'code', (node: any) => {
          const lang = node.lang?.toLowerCase();

          if (lang && specialLanguages.has(lang)) {
            // Convert to HTML node for special rendering
            node.type = 'html';
            node.value = self.renderSpecialCodeBlock(lang, node.value);
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
   * Render a special code block (mermaid, math, etc.)
   */
  private renderSpecialCodeBlock(language: string, code: string): string {
    switch (language) {
      case 'mermaid':
        // Mermaid.js expects content in a <pre class="mermaid"> tag
        return `<pre class="mermaid">${this.escapeHtml(code)}</pre>`;
      case 'math':
      case 'latex':
      case 'katex':
        // KaTeX display math
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
    const { name, attributes = {}, children = [] } = node;

    // Skip if no name (can happen with malformed directives)
    if (!name) {
      return;
    }

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
   * Get list of loaded plugin names
   */
  private getPluginNames(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Handle AI context directive
   *
   * Visibility modes:
   * - 'visible': Content is shown in HTML and included in aiContexts
   * - 'hidden': Content is hidden via CSS (display:none) but still in HTML, included in aiContexts
   * - 'html-hidden': Content is completely removed from HTML, only included in aiContexts
   */
  private handleAIContext(node: any, attributes: Record<string, any>): void {
    // Get visibility mode from the directive label [hidden], [visible], [html-hidden]
    // or from attributes
    const directiveLabel = this.extractDirectiveLabel(node);
    const visibility = directiveLabel || attributes.visibility || 'hidden';

    // Extract content from children
    let content = '';
    if (node.children) {
      content = this.extractText(node.children);
    }

    // Always add to AI contexts
    this.aiContexts.push({
      visible: visibility === 'visible',
      content,
      metadata: {
        ...attributes,
        visibility,
      },
    });

    // Determine how to render based on visibility mode
    if (visibility === 'html-hidden') {
      // Completely remove from HTML output - render as empty/hidden comment
      node.type = 'html';
      node.value = '<!-- AI Context (html-hidden) -->';
      node.children = undefined;
    } else if (visibility === 'hidden' && !this.options.showAIContext) {
      // Hidden via CSS but still in HTML
      node.data = node.data || {};
      node.data.hName = 'div';
      node.data.hProperties = {
        className: ['mdpp-ai-context', 'mdpp-ai-hidden'],
        'data-ai-context': 'true',
        'data-visibility': 'hidden',
        style: 'display: none;',
      };
    } else {
      // Visible in HTML
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
   * Extract the label from a directive node (e.g., [hidden] from :::ai-context[hidden])
   */
  private extractDirectiveLabel(node: any): string | undefined {
    // Check for label in node attributes (remark-directive puts it there)
    if (node.attributes?.label) {
      return node.attributes.label;
    }

    // Check for first child text that looks like a label
    if (node.children && node.children.length > 0) {
      const firstChild = node.children[0];
      // If the first child is a text node with just [word], extract it
      if (firstChild.type === 'text' && firstChild.value) {
        const match = firstChild.value.match(/^\[([\w-]+)\]/);
        if (match) {
          // Remove the label from the text
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
   * Dangerous attributes that should be filtered for security
   * Event handlers and javascript: URLs can be exploited for XSS attacks
   */
  private static readonly DANGEROUS_ATTRIBUTES = new Set([
    // Event handlers
    'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
    'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
    'onkeydown', 'onkeyup', 'onkeypress',
    'onfocus', 'onblur', 'onchange', 'oninput', 'onsubmit', 'onreset',
    'onload', 'onerror', 'onabort', 'onunload', 'onbeforeunload',
    'onscroll', 'onresize', 'onhashchange', 'onpopstate',
    'ondrag', 'ondragstart', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover', 'ondrop',
    'oncopy', 'oncut', 'onpaste',
    'ontouchstart', 'ontouchmove', 'ontouchend', 'ontouchcancel',
    'oncontextmenu', 'onwheel',
    'onanimationstart', 'onanimationend', 'onanimationiteration',
    'ontransitionend',
    'onplay', 'onpause', 'onended', 'onvolumechange', 'ontimeupdate',
    // Potentially dangerous attributes
    'formaction', 'xlink:href',
  ]);

  /**
   * Filter dangerous attributes from user input
   * Returns filtered attributes and logs warnings if dangerous attrs were found
   */
  private filterDangerousAttributes(
    attributes: Record<string, any>
  ): Record<string, any> {
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(attributes)) {
      const lowerKey = key.toLowerCase();

      // Skip dangerous event handlers
      if (MDPlusPlus.DANGEROUS_ATTRIBUTES.has(lowerKey)) {
        if (this.security.warnOnCode) {
          console.warn(`[MD++ Security] Blocked dangerous attribute: ${key}`);
        }
        continue;
      }

      // Check for javascript: URLs in href/src/action attributes
      if (['href', 'src', 'action', 'data', 'poster', 'srcset'].includes(lowerKey)) {
        const strValue = String(value).trim().toLowerCase();
        if (strValue.startsWith('javascript:') || strValue.startsWith('vbscript:') || strValue.startsWith('data:text/html')) {
          if (this.security.warnOnCode) {
            console.warn(`[MD++ Security] Blocked dangerous URL in ${key}: ${value}`);
          }
          continue;
        }
      }

      // Check for javascript: in style attribute (expression() etc.)
      if (lowerKey === 'style') {
        const strValue = String(value).toLowerCase();
        if (strValue.includes('expression(') || strValue.includes('javascript:') || strValue.includes('vbscript:')) {
          if (this.security.warnOnCode) {
            console.warn(`[MD++ Security] Blocked dangerous style: ${value}`);
          }
          continue;
        }
      }

      filtered[key] = value;
    }

    return filtered;
  }

  /**
   * Build HAST node from directive using hastscript for proper attribute handling
   * Supports:
   * - {.class-name} shorthand for classes
   * - {#id-name} shorthand for IDs
   * - {key="value"} for custom attributes
   * - {data-*} for data attributes
   * - Boolean attributes like {disabled}
   */
  private buildHAST(
    node: any,
    componentDef: any,
    attributes: Record<string, any>
  ): { tagName: string; properties: Record<string, any>; wrapperTag?: string; wrapperProperties?: Record<string, any> } {
    const tagName = componentDef?.tag || 'div';

    // Filter dangerous attributes first
    const safeAttributes = this.filterDangerousAttributes(attributes);

    // Collect classes from component definition
    const componentClasses: string[] = componentDef?.classes ? [...componentDef.classes] : [];

    // Handle variant if specified (support both 'variant' and 'type' attributes)
    const variantValue = safeAttributes.variant || safeAttributes.type;
    if (variantValue && componentDef?.variants?.[variantValue]) {
      componentClasses.push(...componentDef.variants[variantValue]);
    }

    // Handle dynamic class based on type attribute (e.g., for admonitions)
    if (safeAttributes.type && !componentDef?.variants?.[safeAttributes.type]) {
      if (componentDef?.classes?.length > 0) {
        const baseClass = componentDef.classes[0];
        componentClasses.push(`${baseClass}-${safeAttributes.type}`);
      }
    }

    // Build attributes object for hastscript
    // hastscript's h() function automatically handles:
    // - .class-name -> className
    // - #id-name -> id
    // - boolean attributes
    const hastAttrs: Record<string, any> = {};

    // Process all attributes
    for (const [key, value] of Object.entries(safeAttributes)) {
      // Skip variant/type as we already processed them for classes
      if (key === 'variant') continue;

      if (key === 'class' || key === 'className') {
        // Add to component classes
        componentClasses.push(...String(value).split(/\s+/).filter(Boolean));
      } else if (key === 'id') {
        hastAttrs.id = value;
      } else if (key.startsWith('.')) {
        // Class shorthand: .my-class -> add to classes
        componentClasses.push(key.slice(1));
      } else if (key.startsWith('#')) {
        // ID shorthand: #my-id -> set id
        hastAttrs.id = key.slice(1);
      } else if (value === '' || value === true) {
        // Boolean attribute: disabled, readonly, etc.
        hastAttrs[key] = true;
      } else {
        // Regular attribute
        hastAttrs[key] = value;
      }
    }

    // Add collected classes
    if (componentClasses.length > 0) {
      // Use className array for proper hastscript handling
      hastAttrs.className = [...new Set(componentClasses)]; // Remove duplicates
    }

    // Use hastscript to build proper hast properties
    // This handles edge cases and normalizes attributes correctly
    const hastNode = h(tagName, hastAttrs);

    // Build result with optional wrapper
    const result: { tagName: string; properties: Record<string, any>; wrapperTag?: string; wrapperProperties?: Record<string, any> } = {
      tagName,
      properties: hastNode.properties || {},
    };

    // Handle wrapper element if defined
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
