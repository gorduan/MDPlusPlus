/**
 * MD++ Pipeline Builder
 *
 * Builds unified.js processing pipelines from activated plugins.
 * Handles plugin ordering, dependency resolution, and code block registration.
 */

import type { Plugin } from 'unified';
import type { PluginRegistry } from './plugin-registry';
import type { MDPlusPlusPlugin, RegisteredPlugin } from './types';

/**
 * Pipeline configuration generated from plugins
 */
export interface PipelinePlugins {
  /** Remark plugins in priority order */
  remarkPlugins: Array<Plugin | [Plugin, unknown]>;

  /** Rehype plugins in priority order */
  rehypePlugins: Array<Plugin | [Plugin, unknown]>;

  /** Code block languages and their handlers */
  codeBlockHandlers: Map<string, CodeBlockHandler>;

  /** All CSS assets required */
  cssAssets: string[];

  /** All JS assets required */
  jsAssets: string[];

  /** Initialization scripts */
  initScripts: string[];
}

/**
 * Code block handler function
 */
export interface CodeBlockHandler {
  pluginId: string;
  handler: (language: string, code: string, meta?: string) => string | null;
}

/**
 * Pipeline builder options
 */
export interface PipelineBuilderOptions {
  /** Include inactive plugins' assets (for preloading) */
  includeInactiveAssets?: boolean;

  /** Filter by plugin type */
  pluginTypes?: ('parser' | 'components' | 'hybrid' | 'theme')[];
}

/**
 * Build pipeline configuration from registry
 */
export class PipelineBuilder {
  constructor(private registry: PluginRegistry) {}

  /**
   * Build pipeline plugins from active plugins
   */
  build(options: PipelineBuilderOptions = {}): PipelinePlugins {
    const result: PipelinePlugins = {
      remarkPlugins: [],
      rehypePlugins: [],
      codeBlockHandlers: new Map(),
      cssAssets: [],
      jsAssets: [],
      initScripts: [],
    };

    // Get active plugins with instances
    const activePlugins = this.getOrderedPlugins(options);

    for (const registered of activePlugins) {
      const { manifest, instance } = registered;

      // Skip if no instance
      if (!instance) continue;

      // Collect remark plugins
      if (instance.remarkPlugins) {
        try {
          const plugins = instance.remarkPlugins();
          result.remarkPlugins.push(...plugins);
        } catch (error) {
          console.error(`[PipelineBuilder] Error getting remark plugins from ${manifest.id}:`, error);
        }
      }

      // Collect rehype plugins
      if (instance.rehypePlugins) {
        try {
          const plugins = instance.rehypePlugins();
          result.rehypePlugins.push(...plugins);
        } catch (error) {
          console.error(`[PipelineBuilder] Error getting rehype plugins from ${manifest.id}:`, error);
        }
      }

      // Collect code block handlers
      if (instance.codeBlockHandler && manifest.parser?.codeBlockLanguages) {
        for (const lang of manifest.parser.codeBlockLanguages) {
          result.codeBlockHandlers.set(lang.toLowerCase(), {
            pluginId: manifest.id,
            handler: instance.codeBlockHandler,
          });
        }
      }

      // Collect assets
      if (manifest.assets) {
        if (manifest.assets.css) {
          result.cssAssets.push(...manifest.assets.css);
        }
        if (manifest.assets.js) {
          result.jsAssets.push(...manifest.assets.js);
        }
        if (manifest.assets.init) {
          result.initScripts.push(manifest.assets.init);
        }
      }
    }

    // Deduplicate assets
    result.cssAssets = [...new Set(result.cssAssets)];
    result.jsAssets = [...new Set(result.jsAssets)];
    result.initScripts = [...new Set(result.initScripts)];

    return result;
  }

  /**
   * Get plugins in priority order
   */
  private getOrderedPlugins(options: PipelineBuilderOptions): RegisteredPlugin[] {
    let plugins = this.registry.getActive();

    // Filter by type if specified
    if (options.pluginTypes && options.pluginTypes.length > 0) {
      plugins = plugins.filter((p) => options.pluginTypes!.includes(p.manifest.type));
    }

    // Sort by priority (higher priority first)
    return plugins.sort((a, b) => {
      const priorityA = a.manifest.parser?.priority ?? 100;
      const priorityB = b.manifest.parser?.priority ?? 100;
      return priorityB - priorityA;
    });
  }

  /**
   * Get all assets (including inactive plugins if requested)
   */
  getAllAssets(includeInactive: boolean = false): { css: string[]; js: string[] } {
    const css: string[] = [];
    const js: string[] = [];

    const plugins = includeInactive ? this.registry.getAll() : this.registry.getActive();

    for (const plugin of plugins) {
      if (plugin.manifest.assets?.css) {
        css.push(...plugin.manifest.assets.css);
      }
      if (plugin.manifest.assets?.js) {
        js.push(...plugin.manifest.assets.js);
      }
    }

    return {
      css: [...new Set(css)],
      js: [...new Set(js)],
    };
  }

  /**
   * Check if a code block language is handled by any plugin
   */
  hasCodeBlockHandler(language: string): boolean {
    const lang = language.toLowerCase();

    for (const plugin of this.registry.getActive()) {
      if (plugin.manifest.parser?.codeBlockLanguages?.includes(lang)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the plugin that handles a code block language
   */
  getCodeBlockHandler(language: string): CodeBlockHandler | undefined {
    const lang = language.toLowerCase();

    for (const plugin of this.registry.getActive()) {
      if (
        plugin.instance?.codeBlockHandler &&
        plugin.manifest.parser?.codeBlockLanguages?.includes(lang)
      ) {
        return {
          pluginId: plugin.manifest.id,
          handler: plugin.instance.codeBlockHandler,
        };
      }
    }

    return undefined;
  }
}

/**
 * Create a pipeline builder for a registry
 */
export function createPipelineBuilder(registry: PluginRegistry): PipelineBuilder {
  return new PipelineBuilder(registry);
}
