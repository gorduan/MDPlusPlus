/**
 * MD++ Plugin Registry
 *
 * Central registry for plugin management:
 * - Plugin registration and discovery
 * - Activation and deactivation
 * - Status tracking
 * - Event emission
 *
 * Based on patterns from:
 * - VS Code Extension Host
 * - Obsidian Plugin Manager
 */

import type {
  PluginManifest,
  RegisteredPlugin,
  PluginStatus,
  MDPlusPlusPlugin,
  PluginContext,
  PluginEvent,
  PluginEventListener,
  PluginEventType,
  ComponentDefinition,
  LegacyPluginDefinition,
} from './types';
import { convertLegacyPlugin } from './types';
import { PluginResolver } from './plugin-resolver';

/**
 * Plugin Registry
 * Manages all registered plugins and their lifecycle
 */
export class PluginRegistry {
  /** Registered plugins by ID */
  private plugins: Map<string, RegisteredPlugin> = new Map();

  /** Event listeners */
  private listeners: Map<PluginEventType, Set<PluginEventListener>> = new Map();

  /** Plugin settings storage */
  private settings: Map<string, Record<string, unknown>> = new Map();

  /** Runtime-registered components (from plugins) */
  private runtimeComponents: Map<string, { pluginId: string; definition: ComponentDefinition }> =
    new Map();

  /** Dependency resolver */
  private resolver: PluginResolver;

  constructor() {
    this.resolver = new PluginResolver(this);
  }

  // ============================================
  // Registration
  // ============================================

  /**
   * Register a plugin from its manifest
   */
  register(manifest: PluginManifest, pluginPath: string): RegisteredPlugin {
    // Check for duplicate
    if (this.plugins.has(manifest.id)) {
      const existing = this.plugins.get(manifest.id)!;
      console.warn(
        `[PluginRegistry] Plugin "${manifest.id}" already registered. ` +
          `Existing: ${existing.manifest.version}, New: ${manifest.version}`
      );
    }

    const plugin: RegisteredPlugin = {
      manifest,
      status: 'inactive',
      path: pluginPath,
    };

    this.plugins.set(manifest.id, plugin);

    // Initialize settings with defaults
    if (manifest.settings?.defaults) {
      this.settings.set(manifest.id, { ...manifest.settings.defaults });
    }

    this.emit({
      type: 'plugin:registered',
      pluginId: manifest.id,
      timestamp: new Date(),
    });

    return plugin;
  }

  /**
   * Register a legacy plugin (JSON format)
   */
  registerLegacy(legacy: LegacyPluginDefinition, pluginPath: string = ''): RegisteredPlugin {
    const manifest = convertLegacyPlugin(legacy);
    return this.register(manifest, pluginPath);
  }

  /**
   * Unregister a plugin
   */
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }

    // Deactivate if active
    if (plugin.status === 'active') {
      await this.deactivate(pluginId);
    }

    this.plugins.delete(pluginId);
    this.settings.delete(pluginId);

    // Remove runtime components from this plugin
    for (const [name, comp] of this.runtimeComponents) {
      if (comp.pluginId === pluginId) {
        this.runtimeComponents.delete(name);
      }
    }
  }

  // ============================================
  // Activation / Deactivation
  // ============================================

  /**
   * Activate a plugin
   */
  async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }

    if (plugin.status === 'active') {
      return; // Already active
    }

    if (plugin.status === 'activating') {
      throw new Error(`Plugin "${pluginId}" is already activating`);
    }

    // Check dependencies
    const resolution = this.resolver.resolve([pluginId]);
    if (!resolution.resolved) {
      const missing = resolution.missing
        .filter((m) => m.type === 'required')
        .map((m) => m.dependency);

      if (missing.length > 0) {
        throw new Error(
          `Plugin "${pluginId}" has missing dependencies: ${missing.join(', ')}`
        );
      }
    }

    // Check conflicts
    if (resolution.conflicts.length > 0) {
      const conflict = resolution.conflicts[0];
      throw new Error(
        `Plugin "${pluginId}" conflicts with "${conflict.plugin2}": ${conflict.reason}`
      );
    }

    plugin.status = 'activating';

    try {
      // Create plugin context
      const context = this.createContext(pluginId);

      // Call activate if plugin instance exists
      if (plugin.instance?.activate) {
        await plugin.instance.activate(context);
      }

      plugin.status = 'active';
      plugin.activatedAt = new Date();
      plugin.error = undefined;

      this.emit({
        type: 'plugin:activated',
        pluginId,
        timestamp: new Date(),
      });
    } catch (error) {
      plugin.status = 'error';
      plugin.error = error instanceof Error ? error.message : String(error);

      this.emit({
        type: 'plugin:error',
        pluginId,
        timestamp: new Date(),
        data: { error: plugin.error },
      });

      throw error;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }

    if (plugin.status !== 'active') {
      return; // Not active
    }

    // Check if other plugins depend on this one
    const dependents = this.getDependents(pluginId);
    const activeDependents = dependents.filter((id) => this.getStatus(id) === 'active');

    if (activeDependents.length > 0) {
      throw new Error(
        `Cannot deactivate "${pluginId}": required by active plugins: ${activeDependents.join(', ')}`
      );
    }

    plugin.status = 'deactivating';

    try {
      // Call deactivate if plugin instance exists
      if (plugin.instance?.deactivate) {
        await plugin.instance.deactivate();
      }

      // Remove runtime components
      for (const [name, comp] of this.runtimeComponents) {
        if (comp.pluginId === pluginId) {
          this.runtimeComponents.delete(name);
        }
      }

      plugin.status = 'inactive';
      plugin.activatedAt = undefined;

      this.emit({
        type: 'plugin:deactivated',
        pluginId,
        timestamp: new Date(),
      });
    } catch (error) {
      plugin.status = 'error';
      plugin.error = error instanceof Error ? error.message : String(error);

      this.emit({
        type: 'plugin:error',
        pluginId,
        timestamp: new Date(),
        data: { error: plugin.error },
      });

      throw error;
    }
  }

  /**
   * Activate multiple plugins in dependency order
   */
  async activateAll(pluginIds: string[]): Promise<void> {
    const resolution = this.resolver.resolve(pluginIds);

    if (!resolution.resolved) {
      const missing = resolution.missing.filter((m) => m.type === 'required');
      if (missing.length > 0) {
        throw new Error(
          `Cannot activate plugins: missing dependencies:\n` +
            missing.map((m) => `  - ${m.plugin} requires ${m.dependency}`).join('\n')
        );
      }
    }

    // Activate in order
    for (const pluginId of resolution.order) {
      if (pluginIds.includes(pluginId) || this.isRequiredDependency(pluginId, pluginIds)) {
        await this.activate(pluginId);
      }
    }
  }

  /**
   * Check if a plugin is required by any of the given plugins
   */
  private isRequiredDependency(pluginId: string, requestedPlugins: string[]): boolean {
    for (const reqId of requestedPlugins) {
      const plugin = this.plugins.get(reqId);
      if (plugin?.manifest.dependencies?.plugins?.includes(pluginId)) {
        return true;
      }
    }
    return false;
  }

  // ============================================
  // Queries
  // ============================================

  /**
   * Get a plugin by ID
   */
  get(pluginId: string): RegisteredPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAll(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all active plugins
   */
  getActive(): RegisteredPlugin[] {
    return this.getAll().filter((p) => p.status === 'active');
  }

  /**
   * Get plugin status
   */
  getStatus(pluginId: string): PluginStatus | undefined {
    return this.plugins.get(pluginId)?.status;
  }

  /**
   * Check if a plugin is registered
   */
  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugins that depend on the given plugin
   */
  getDependents(pluginId: string): string[] {
    const dependents: string[] = [];

    for (const [id, plugin] of this.plugins) {
      const deps = plugin.manifest.dependencies?.plugins || [];
      if (deps.includes(pluginId)) {
        dependents.push(id);
      }
    }

    return dependents;
  }

  /**
   * Get all components (from manifests and runtime)
   */
  getAllComponents(): Map<string, { pluginId: string; definition: ComponentDefinition }> {
    const components = new Map<string, { pluginId: string; definition: ComponentDefinition }>();

    // Manifest components
    for (const [pluginId, plugin] of this.plugins) {
      if (plugin.status === 'active' && plugin.manifest.components) {
        for (const [name, def] of Object.entries(plugin.manifest.components)) {
          components.set(`${pluginId}:${name}`, { pluginId, definition: def });
        }
      }
    }

    // Runtime components
    for (const [name, comp] of this.runtimeComponents) {
      components.set(name, comp);
    }

    return components;
  }

  // ============================================
  // Settings
  // ============================================

  /**
   * Get plugin settings
   */
  getSettings(pluginId: string): Record<string, unknown> {
    return this.settings.get(pluginId) || {};
  }

  /**
   * Update plugin settings
   */
  setSettings(pluginId: string, newSettings: Record<string, unknown>): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }

    const merged = {
      ...(plugin.manifest.settings?.defaults || {}),
      ...this.settings.get(pluginId),
      ...newSettings,
    };

    this.settings.set(pluginId, merged);

    // Notify plugin of settings change
    if (plugin.instance?.onSettingsChange) {
      plugin.instance.onSettingsChange(merged);
    }

    this.emit({
      type: 'plugin:settings-changed',
      pluginId,
      timestamp: new Date(),
      data: { settings: merged },
    });
  }

  // ============================================
  // Plugin Instance Management
  // ============================================

  /**
   * Set the plugin instance (runtime module)
   */
  setInstance(pluginId: string, instance: MDPlusPlusPlugin): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" is not registered`);
    }

    plugin.instance = instance;
  }

  /**
   * Create plugin context for activation
   */
  private createContext(pluginId: string): PluginContext {
    const self = this;

    return {
      settings: this.getSettings(pluginId),

      registerComponent(name: string, definition: ComponentDefinition) {
        self.runtimeComponents.set(`${pluginId}:${name}`, {
          pluginId,
          definition,
        });
      },

      getPluginApi<T = unknown>(targetPluginId: string): T | undefined {
        const plugin = self.plugins.get(targetPluginId);
        if (plugin?.status === 'active' && plugin.instance?.api) {
          return plugin.instance.api as T;
        }
        return undefined;
      },

      log: {
        info: (message: string, ...args: unknown[]) =>
          console.info(`[${pluginId}] ${message}`, ...args),
        warn: (message: string, ...args: unknown[]) =>
          console.warn(`[${pluginId}] ${message}`, ...args),
        error: (message: string, ...args: unknown[]) =>
          console.error(`[${pluginId}] ${message}`, ...args),
      },
    };
  }

  // ============================================
  // Events
  // ============================================

  /**
   * Subscribe to plugin events
   */
  on(type: PluginEventType, listener: PluginEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  /**
   * Emit a plugin event
   */
  private emit(event: PluginEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`[PluginRegistry] Event listener error:`, error);
        }
      }
    }
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Deactivate all plugins and clear registry
   */
  async dispose(): Promise<void> {
    // Deactivate in reverse dependency order
    const active = this.getActive();
    const resolution = this.resolver.resolve(active.map((p) => p.manifest.id));

    for (const pluginId of resolution.order.reverse()) {
      if (this.getStatus(pluginId) === 'active') {
        try {
          await this.deactivate(pluginId);
        } catch (error) {
          console.error(`[PluginRegistry] Error deactivating "${pluginId}":`, error);
        }
      }
    }

    this.plugins.clear();
    this.settings.clear();
    this.runtimeComponents.clear();
    this.listeners.clear();
  }
}

/**
 * Create a new plugin registry
 */
export function createPluginRegistry(): PluginRegistry {
  return new PluginRegistry();
}
