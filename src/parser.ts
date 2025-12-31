/**
 * MD++ Parser - Markdown Plus Plus
 * Converts MD++ syntax to HTML with plugin support
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
  ParserOptions
} from './types';

/**
 * MD++ Parser class
 */
export class MDPlusPlus {
  private plugins: Map<string, PluginDefinition> = new Map();
  private errors: RenderError[] = [];
  private aiContexts: AIContext[] = [];
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = options;

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

    // Create processor
    const processor = unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(this.createDirectivePlugin())
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true });

    // Process markdown
    const result = await processor.process(content);

    return {
      html: String(result),
      aiContexts: this.aiContexts,
      frontmatter: Object.keys(frontmatter).length > 0 ? frontmatter : undefined,
      errors: this.errors,
    };
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
   * Process a directive node
   */
  private processDirective(node: any): void {
    const { name, attributes = {}, children = [] } = node;

    // Parse framework:component from name
    let framework: string | undefined;
    let component: string;

    if (name.includes(':')) {
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
          message: `Plugin "${framework}" is not registered`,
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
      this.errors.push({
        type: 'unknown-component',
        message: `Component "${component}" not found in plugin "${framework}"`,
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
