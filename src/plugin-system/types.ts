/**
 * MD++ Plugin System - Type Definitions
 *
 * Based on best practices from:
 * - VS Code Extension API (https://code.visualstudio.com/api/references/extension-manifest)
 * - Obsidian Plugin System (https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
 * - Unified.js Plugin Architecture (https://unifiedjs.com)
 */

import type { Plugin } from 'unified';

// ============================================
// Plugin Types
// ============================================

/**
 * Plugin type determines what the plugin provides
 * - 'parser': Provides remark/rehype plugins for parsing
 * - 'components': Provides UI components only (no parser logic)
 * - 'hybrid': Both parser logic and components
 * - 'theme': Visual theme only (CSS/styling)
 */
export type PluginType = 'parser' | 'components' | 'hybrid' | 'theme';

/**
 * Parser phase where the plugin operates
 * - 'remark': Operates on Markdown AST (mdast)
 * - 'rehype': Operates on HTML AST (hast)
 * - 'both': Provides plugins for both phases
 */
export type ParserPhase = 'remark' | 'rehype' | 'both';

/**
 * Plugin status in the registry
 */
export type PluginStatus = 'inactive' | 'activating' | 'active' | 'deactivating' | 'error';

// ============================================
// Plugin Manifest (plugin.json)
// ============================================

/**
 * Plugin manifest - the plugin.json file
 * Inspired by VS Code's package.json extension manifest
 */
export interface PluginManifest {
  /** Schema URL for validation */
  $schema?: string;

  /** Unique plugin identifier (lowercase, alphanumeric, hyphens) */
  id: string;

  /** Human-readable name */
  name: string;

  /** Semantic version (e.g., "1.0.0") */
  version: string;

  /** Plugin author */
  author?: string;

  /** Short description */
  description?: string;

  /** Plugin type */
  type: PluginType;

  /** Plugin dependencies */
  dependencies?: PluginDependencies;

  /** Optional dependencies (don't block activation) */
  optionalDependencies?: PluginDependencies;

  /** Plugins that conflict with this one */
  conflicts?: string[];

  /** Activation configuration */
  activation?: ActivationConfig;

  /** Parser configuration (for 'parser' and 'hybrid' types) */
  parser?: ParserConfig;

  /** External assets (CSS, JS from CDN) */
  assets?: AssetConfig;

  /** Plugin settings schema */
  settings?: SettingsConfig;

  /** Component definitions (for 'components' and 'hybrid' types) */
  components?: Record<string, ComponentDefinition>;

  /** Lifecycle hook method names */
  lifecycle?: LifecycleConfig;

  /** Minimum MD++ version required */
  minAppVersion?: string;

  /** Plugin categories for discovery */
  categories?: string[];

  /** Keywords for search */
  keywords?: string[];

  /** Documentation URL */
  documentation?: string;

  /** Repository URL */
  repository?: string;

  /** License identifier (SPDX) */
  license?: string;
}

/**
 * Plugin dependencies
 */
export interface PluginDependencies {
  /** Other MD++ plugins required */
  plugins?: string[];

  /** NPM packages required (for bundled plugins) */
  npm?: string[];
}

/**
 * Plugin activation configuration
 * Controls when the plugin is enabled by default
 */
export interface ActivationConfig {
  /** Whether the plugin is enabled by default (default: true for most plugins) */
  enabledByDefault?: boolean;

  /** File extensions that enable this plugin automatically (e.g., [".mdpp", ".mpsc"]) */
  enabledForExtensions?: string[];
}

/**
 * Parser configuration in manifest
 */
export interface ParserConfig {
  /** Path to parser entry file (relative to plugin folder) */
  entry: string;

  /** Which phase(s) the parser operates in */
  phase: ParserPhase;

  /** Priority (higher = runs earlier, default: 100) */
  priority?: number;

  /** Code block languages this plugin handles */
  codeBlockLanguages?: string[];
}

/**
 * External asset configuration
 */
export interface AssetConfig {
  /** CSS URLs to load */
  css?: string[];

  /** JavaScript URLs to load */
  js?: string[];

  /** Initialization script (runs after assets load) */
  init?: string;
}

/**
 * Settings configuration
 */
export interface SettingsConfig {
  /** Path to JSON schema file */
  schema?: string;

  /** Default settings values */
  defaults?: Record<string, unknown>;
}

/**
 * Lifecycle hook configuration
 */
export interface LifecycleConfig {
  /** Function name to call on activation */
  onActivate?: string;

  /** Function name to call on deactivation */
  onDeactivate?: string;
}

/**
 * Component definition (UI components)
 */
export interface ComponentDefinition {
  /** HTML tag to render */
  tag: string;

  /** CSS classes to apply */
  classes: string[];

  /** Allow nested directives */
  allowNesting?: boolean;

  /** Nested structure definitions */
  structure?: Record<string, StructureDefinition>;

  /** Variant class mappings */
  variants?: Record<string, string[]>;

  /** Hide from component browser */
  hidden?: boolean;

  /** Include in AI context */
  aiVisible?: boolean;

  /** Component description */
  description?: string;
}

/**
 * Structure definition for nested elements
 */
export interface StructureDefinition {
  tag: string;
  classes: string[];
  titleTag?: string;
  contentTag?: string;
}

// ============================================
// Plugin Runtime Interface
// ============================================

/**
 * Context provided to plugins during activation
 */
export interface PluginContext {
  /** Plugin's current settings */
  settings: Record<string, unknown>;

  /** Register a component at runtime */
  registerComponent: (name: string, definition: ComponentDefinition) => void;

  /** Get another plugin's public API */
  getPluginApi: <T = unknown>(pluginId: string) => T | undefined;

  /** Log messages with plugin prefix */
  log: {
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
    error: (message: string, ...args: unknown[]) => void;
  };

  /** Plugin's data directory path */
  dataPath?: string;
}

/**
 * MD++ Plugin Interface
 * Plugins export a default object implementing this interface
 */
export interface MDPlusPlusPlugin {
  /** Plugin ID (must match manifest) */
  id: string;

  /** Remark plugins to add to the pipeline */
  remarkPlugins?: () => Array<Plugin | [Plugin, unknown]>;

  /** Rehype plugins to add to the pipeline */
  rehypePlugins?: () => Array<Plugin | [Plugin, unknown]>;

  /** Custom code block handler */
  codeBlockHandler?: (language: string, code: string, meta?: string) => string | null;

  /** Called when plugin is activated */
  activate?: (context: PluginContext) => void | Promise<void>;

  /** Called when plugin is deactivated */
  deactivate?: () => void | Promise<void>;

  /** Called when settings change */
  onSettingsChange?: (settings: Record<string, unknown>) => void;

  /** Public API exposed to other plugins */
  api?: Record<string, unknown>;
}

// ============================================
// Plugin Registry Types
// ============================================

/**
 * Registered plugin entry in the registry
 */
export interface RegisteredPlugin {
  /** Plugin manifest */
  manifest: PluginManifest;

  /** Plugin runtime instance (if loaded) */
  instance?: MDPlusPlusPlugin;

  /** Current status */
  status: PluginStatus;

  /** Error message if status is 'error' */
  error?: string;

  /** Path to plugin folder */
  path: string;

  /** When the plugin was last activated */
  activatedAt?: Date;
}

/**
 * Plugin load result
 */
export interface PluginLoadResult {
  success: boolean;
  plugin?: RegisteredPlugin;
  error?: string;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
  /** Whether all dependencies can be satisfied */
  resolved: boolean;

  /** Plugins in activation order (dependencies first) */
  order: string[];

  /** Missing dependencies */
  missing: Array<{
    plugin: string;
    dependency: string;
    type: 'required' | 'optional';
  }>;

  /** Detected conflicts */
  conflicts: Array<{
    plugin1: string;
    plugin2: string;
    reason: string;
  }>;

  /** Circular dependency chains */
  circular: string[][];
}

// ============================================
// Events
// ============================================

/**
 * Plugin event types
 */
export type PluginEventType =
  | 'plugin:registered'
  | 'plugin:activated'
  | 'plugin:deactivated'
  | 'plugin:error'
  | 'plugin:settings-changed';

/**
 * Plugin event data
 */
export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: Date;
  data?: unknown;
}

/**
 * Plugin event listener
 */
export type PluginEventListener = (event: PluginEvent) => void;

// ============================================
// Legacy Compatibility
// ============================================

/**
 * Legacy plugin definition (for backwards compatibility with existing JSON plugins)
 * Maps to the old PluginDefinition interface
 */
export interface LegacyPluginDefinition {
  framework: string;
  version?: string;
  author?: string;
  description?: string;
  css?: string[];
  js?: string[];
  init?: string;
  codeBlockLanguages?: string[];
  components: Record<string, ComponentDefinition>;
}

/**
 * Convert legacy plugin definition to new manifest format
 */
export function convertLegacyPlugin(legacy: LegacyPluginDefinition): PluginManifest {
  const hasComponents = Object.keys(legacy.components).length > 0;
  const hasCodeBlocks = legacy.codeBlockLanguages && legacy.codeBlockLanguages.length > 0;

  return {
    id: legacy.framework,
    name: legacy.framework.charAt(0).toUpperCase() + legacy.framework.slice(1),
    version: legacy.version || '1.0.0',
    author: legacy.author,
    description: legacy.description,
    type: hasCodeBlocks ? (hasComponents ? 'hybrid' : 'parser') : 'components',
    assets: {
      css: legacy.css,
      js: legacy.js,
      init: legacy.init,
    },
    parser: hasCodeBlocks
      ? {
          entry: '', // Legacy plugins don't have separate parser files
          phase: 'remark',
          codeBlockLanguages: legacy.codeBlockLanguages,
        }
      : undefined,
    components: legacy.components,
  };
}
