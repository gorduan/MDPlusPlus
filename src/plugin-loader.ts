/**
 * MD++ Plugin Loader
 * Loads and validates plugin definitions
 */

import type { PluginDefinition, ComponentDefinition } from './types';

/**
 * Plugin Loader class
 */
export class PluginLoader {
  private plugins: Map<string, PluginDefinition> = new Map();

  /**
   * Load a plugin from a JSON object
   */
  loadFromJSON(json: unknown): PluginDefinition {
    const plugin = this.validatePlugin(json);
    this.plugins.set(plugin.framework, plugin);
    return plugin;
  }

  /**
   * Load multiple plugins
   */
  loadPlugins(jsons: unknown[]): PluginDefinition[] {
    return jsons.map(json => this.loadFromJSON(json));
  }

  /**
   * Get a loaded plugin by framework name
   */
  getPlugin(framework: string): PluginDefinition | undefined {
    return this.plugins.get(framework);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Check if a plugin is loaded
   */
  hasPlugin(framework: string): boolean {
    return this.plugins.has(framework);
  }

  /**
   * Clear all loaded plugins
   */
  clear(): void {
    this.plugins.clear();
  }

  /**
   * Validate and parse a plugin definition
   */
  private validatePlugin(json: unknown): PluginDefinition {
    if (!json || typeof json !== 'object') {
      throw new Error('Plugin must be an object');
    }

    const obj = json as Record<string, unknown>;

    // Validate required fields
    if (!obj.framework || typeof obj.framework !== 'string') {
      throw new Error('Plugin must have a "framework" string');
    }

    if (!obj.components || typeof obj.components !== 'object') {
      throw new Error('Plugin must have a "components" object');
    }

    // Validate components
    const components: Record<string, ComponentDefinition> = {};
    for (const [name, def] of Object.entries(obj.components as Record<string, unknown>)) {
      components[name] = this.validateComponent(name, def);
    }

    // Parse CSS/JS arrays
    const css = Array.isArray(obj.css)
      ? obj.css.filter((c): c is string => typeof c === 'string')
      : undefined;

    const js = Array.isArray(obj.js)
      ? obj.js.filter((j): j is string => typeof j === 'string')
      : undefined;

    // Parse code block languages
    const codeBlockLanguages = Array.isArray(obj.codeBlockLanguages)
      ? obj.codeBlockLanguages.filter((l): l is string => typeof l === 'string')
      : undefined;

    return {
      framework: obj.framework,
      version: typeof obj.version === 'string' ? obj.version : '1.0.0',
      author: typeof obj.author === 'string' ? obj.author : undefined,
      description: typeof obj.description === 'string' ? obj.description : undefined,
      css,
      js,
      init: typeof obj.init === 'string' ? obj.init : undefined,
      codeBlockLanguages,
      components,
    };
  }

  /**
   * Validate a component definition
   */
  private validateComponent(name: string, def: unknown): ComponentDefinition {
    if (!def || typeof def !== 'object') {
      throw new Error(`Component "${name}" must be an object`);
    }

    const obj = def as Record<string, unknown>;

    return {
      tag: typeof obj.tag === 'string' ? obj.tag : 'div',
      classes: Array.isArray(obj.classes)
        ? obj.classes.filter((c): c is string => typeof c === 'string')
        : [],
      allowNesting: typeof obj.allowNesting === 'boolean' ? obj.allowNesting : true,
      structure: obj.structure as Record<string, any> | undefined,
      variants: obj.variants as Record<string, string[]> | undefined,
      hidden: typeof obj.hidden === 'boolean' ? obj.hidden : false,
      aiVisible: typeof obj.aiVisible === 'boolean' ? obj.aiVisible : false,
    };
  }
}

/**
 * Create a new plugin loader
 */
export function createPluginLoader(): PluginLoader {
  return new PluginLoader();
}
