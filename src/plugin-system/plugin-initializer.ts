/**
 * Plugin Initializer
 *
 * Handles the initialization of the plugin system on app startup.
 * Loads plugin manifests, processes contributions, and registers with handlers.
 */

import type { PluginContributions } from './contribution-types';
import type { PluginManifest } from './types';
import { getContributionRegistry } from './contribution-registry';
import { getToolbarContributionHandler } from './toolbar-contribution-handler';
import { getExportContributionHandler } from './export-contribution-handler';
import { getPreviewContributionHandler } from './preview-contribution-handler';
import { getEditorContributionHandler } from './editor-contribution-handler';

/**
 * Extended plugin manifest with contributes field
 */
export interface ExtendedPluginManifest extends PluginManifest {
  contributes?: PluginContributions;
}

/**
 * Plugin initialization state
 */
export interface PluginInitState {
  pluginId: string;
  loaded: boolean;
  enabled: boolean;
  error?: string;
}

/**
 * Plugin Initializer
 *
 * Manages the lifecycle of plugins:
 * 1. Load plugin manifests from plugins/ folder
 * 2. Process contributions from enabled plugins
 * 3. Register with contribution handlers
 * 4. Handle enable/disable at runtime
 */
export class PluginInitializer {
  private plugins: Map<string, ExtendedPluginManifest> = new Map();
  private enabledPlugins: Set<string> = new Set();
  private initState: Map<string, PluginInitState> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Load a plugin manifest
   */
  loadPlugin(manifest: ExtendedPluginManifest): void {
    const pluginId = manifest.id;
    this.plugins.set(pluginId, manifest);

    this.initState.set(pluginId, {
      pluginId,
      loaded: true,
      enabled: false,
    });

    console.log(`[PluginInitializer] Loaded plugin: ${pluginId}`);
  }

  /**
   * Load multiple plugin manifests
   */
  loadPlugins(manifests: ExtendedPluginManifest[]): void {
    for (const manifest of manifests) {
      this.loadPlugin(manifest);
    }
  }

  /**
   * Enable a plugin and process its contributions
   */
  enablePlugin(pluginId: string): boolean {
    const manifest = this.plugins.get(pluginId);
    if (!manifest) {
      console.error(`[PluginInitializer] Plugin not found: ${pluginId}`);
      return false;
    }

    if (this.enabledPlugins.has(pluginId)) {
      return true; // Already enabled
    }

    try {
      // Process contributions
      if (manifest.contributes) {
        this.processContributions(pluginId, manifest.contributes);
      }

      this.enabledPlugins.add(pluginId);

      const state = this.initState.get(pluginId);
      if (state) {
        state.enabled = true;
        delete state.error;
      }

      console.log(`[PluginInitializer] Enabled plugin: ${pluginId}`);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error(`[PluginInitializer] Failed to enable plugin ${pluginId}:`, error);

      const state = this.initState.get(pluginId);
      if (state) {
        state.error = error instanceof Error ? error.message : String(error);
      }

      return false;
    }
  }

  /**
   * Disable a plugin and remove its contributions
   */
  disablePlugin(pluginId: string): boolean {
    if (!this.enabledPlugins.has(pluginId)) {
      return true; // Already disabled
    }

    try {
      // Remove contributions
      this.removeContributions(pluginId);

      this.enabledPlugins.delete(pluginId);

      const state = this.initState.get(pluginId);
      if (state) {
        state.enabled = false;
      }

      console.log(`[PluginInitializer] Disabled plugin: ${pluginId}`);
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error(`[PluginInitializer] Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Process contributions from a plugin manifest
   */
  private processContributions(pluginId: string, contributes: PluginContributions): void {
    const registry = getContributionRegistry();
    registry.processPluginContributions(pluginId, contributes);

    // Process toolbar contributions with icon resolution
    if (contributes.toolbar) {
      const toolbarHandler = getToolbarContributionHandler();
      toolbarHandler.register(pluginId, contributes.toolbar);
    }

    // Register preview contribution for later loading
    if (contributes.preview) {
      const previewHandler = getPreviewContributionHandler();
      previewHandler.register(pluginId, contributes.preview);
    }

    // Register export contribution
    if (contributes.export) {
      const exportHandler = getExportContributionHandler();
      exportHandler.register(pluginId, contributes.export);
    }

    // Register editor contribution
    if (contributes.editor) {
      const editorHandler = getEditorContributionHandler();
      editorHandler.register(pluginId, contributes.editor);
    }
  }

  /**
   * Remove contributions from a plugin
   */
  private removeContributions(pluginId: string): void {
    const registry = getContributionRegistry();
    registry.removePluginContributions(pluginId);

    // Remove from toolbar handler
    const toolbarHandler = getToolbarContributionHandler();
    toolbarHandler.unregister(pluginId);

    // Remove from preview handler
    const previewHandler = getPreviewContributionHandler();
    previewHandler.unregister(pluginId);

    // Remove from export handler
    const exportHandler = getExportContributionHandler();
    exportHandler.unregister(pluginId);

    // Remove from editor handler
    const editorHandler = getEditorContributionHandler();
    editorHandler.unregister(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): ExtendedPluginManifest[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin manifest
   */
  getPlugin(pluginId: string): ExtendedPluginManifest | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all enabled plugin IDs
   */
  getEnabledPlugins(): string[] {
    return Array.from(this.enabledPlugins);
  }

  /**
   * Check if a plugin is enabled
   */
  isEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }

  /**
   * Get initialization state for all plugins
   */
  getInitState(): PluginInitState[] {
    return Array.from(this.initState.values());
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Reset all state (for testing)
   */
  reset(): void {
    // Disable all plugins first
    for (const pluginId of this.enabledPlugins) {
      this.removeContributions(pluginId);
    }

    this.plugins.clear();
    this.enabledPlugins.clear();
    this.initState.clear();
    this.notifyListeners();
  }
}

// Singleton instance
let _instance: PluginInitializer | null = null;

/**
 * Get the global plugin initializer
 */
export function getPluginInitializer(): PluginInitializer {
  if (!_instance) {
    _instance = new PluginInitializer();
  }
  return _instance;
}

/**
 * Create a new plugin initializer (for testing)
 */
export function createPluginInitializer(): PluginInitializer {
  return new PluginInitializer();
}

/**
 * Initialize the plugin system with a list of manifests and enabled plugins
 */
export async function initializePluginSystem(
  manifests: ExtendedPluginManifest[],
  enabledPluginIds: string[]
): Promise<PluginInitState[]> {
  const initializer = getPluginInitializer();

  // Load all manifests
  initializer.loadPlugins(manifests);

  // Enable specified plugins
  for (const pluginId of enabledPluginIds) {
    initializer.enablePlugin(pluginId);
  }

  return initializer.getInitState();
}
