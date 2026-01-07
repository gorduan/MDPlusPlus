/**
 * MD++ Plugin Loader
 *
 * Loads plugins from various sources:
 * - File system (plugin folders)
 * - JSON files (legacy format)
 * - Runtime registration
 *
 * Supports both new manifest format and legacy JSON plugins.
 */

import type {
  PluginManifest,
  PluginLoadResult,
  LegacyPluginDefinition,
  MDPlusPlusPlugin,
} from './types';
import { convertLegacyPlugin } from './types';
import type { PluginRegistry } from './plugin-registry';

/**
 * Plugin loader configuration
 */
export interface PluginLoaderConfig {
  /** Base path for plugins */
  pluginsPath?: string;

  /** Whether to load legacy JSON plugins */
  loadLegacy?: boolean;

  /** Validate manifests against schema */
  validateSchema?: boolean;
}

/**
 * Plugin Loader
 */
export class PluginLoader {
  private config: PluginLoaderConfig;

  constructor(
    private registry: PluginRegistry,
    config: PluginLoaderConfig = {}
  ) {
    this.config = {
      loadLegacy: true,
      validateSchema: false,
      ...config,
    };
  }

  /**
   * Load a plugin from a manifest object
   */
  loadFromManifest(manifest: PluginManifest, pluginPath: string = ''): PluginLoadResult {
    try {
      // Validate manifest
      const errors = this.validateManifest(manifest);
      if (errors.length > 0) {
        return {
          success: false,
          error: `Invalid manifest: ${errors.join(', ')}`,
        };
      }

      // Register plugin
      const plugin = this.registry.register(manifest, pluginPath);

      return {
        success: true,
        plugin,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load a plugin from legacy JSON format
   */
  loadFromLegacyJSON(json: unknown, pluginPath: string = ''): PluginLoadResult {
    try {
      // Validate basic structure
      if (!json || typeof json !== 'object') {
        return {
          success: false,
          error: 'Plugin must be an object',
        };
      }

      const obj = json as Record<string, unknown>;

      // Check for required fields
      if (!obj.framework || typeof obj.framework !== 'string') {
        return {
          success: false,
          error: 'Plugin must have a "framework" string',
        };
      }

      if (!obj.components || typeof obj.components !== 'object') {
        return {
          success: false,
          error: 'Plugin must have a "components" object',
        };
      }

      // Convert to legacy format
      const legacy = obj as unknown as LegacyPluginDefinition;

      // Register using registry's legacy method
      const plugin = this.registry.registerLegacy(legacy, pluginPath);

      return {
        success: true,
        plugin,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load a plugin instance (runtime module)
   */
  loadInstance(pluginId: string, instance: MDPlusPlusPlugin): PluginLoadResult {
    try {
      const plugin = this.registry.get(pluginId);
      if (!plugin) {
        return {
          success: false,
          error: `Plugin "${pluginId}" is not registered. Register manifest first.`,
        };
      }

      // Validate instance
      if (instance.id !== pluginId) {
        return {
          success: false,
          error: `Plugin instance ID "${instance.id}" doesn't match registered ID "${pluginId}"`,
        };
      }

      this.registry.setInstance(pluginId, instance);

      return {
        success: true,
        plugin,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Load multiple plugins from JSON array (legacy format)
   */
  loadFromLegacyJSONArray(jsons: unknown[]): PluginLoadResult[] {
    return jsons.map((json) => this.loadFromLegacyJSON(json));
  }

  /**
   * Validate a plugin manifest
   */
  private validateManifest(manifest: PluginManifest): string[] {
    const errors: string[] = [];

    // Required fields
    if (!manifest.id) {
      errors.push('Missing required field: id');
    } else if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push('id must be lowercase alphanumeric with hyphens only');
    }

    if (!manifest.name) {
      errors.push('Missing required field: name');
    }

    if (!manifest.version) {
      errors.push('Missing required field: version');
    } else if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('version must follow semver format (e.g., 1.0.0)');
    }

    if (!manifest.type) {
      errors.push('Missing required field: type');
    } else if (!['parser', 'components', 'hybrid', 'theme'].includes(manifest.type)) {
      errors.push('type must be one of: parser, components, hybrid, theme');
    }

    // Parser plugins need parser config
    if ((manifest.type === 'parser' || manifest.type === 'hybrid') && !manifest.parser) {
      // Parser config is optional for built-in plugins
      // errors.push('Parser/hybrid plugins must have parser config');
    }

    // Component plugins need components
    if ((manifest.type === 'components' || manifest.type === 'hybrid') && !manifest.components) {
      // Components are optional
      // errors.push('Component/hybrid plugins should have components defined');
    }

    // Validate components if present
    if (manifest.components) {
      for (const [name, def] of Object.entries(manifest.components)) {
        if (!def.tag) {
          errors.push(`Component "${name}" must have a tag`);
        }
      }
    }

    return errors;
  }

  /**
   * Create plugin manifest from minimal config
   * Useful for quick plugin creation
   */
  static createManifest(config: {
    id: string;
    name: string;
    type: 'parser' | 'components' | 'hybrid' | 'theme';
    version?: string;
    components?: PluginManifest['components'];
    assets?: PluginManifest['assets'];
    parser?: PluginManifest['parser'];
  }): PluginManifest {
    return {
      id: config.id,
      name: config.name,
      version: config.version || '1.0.0',
      type: config.type,
      components: config.components || {},
      assets: config.assets,
      parser: config.parser,
    };
  }
}

/**
 * Create a new plugin loader
 */
export function createPluginLoader(
  registry: PluginRegistry,
  config?: PluginLoaderConfig
): PluginLoader {
  return new PluginLoader(registry, config);
}
