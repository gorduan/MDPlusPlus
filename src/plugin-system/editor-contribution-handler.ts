/**
 * Editor Contribution Handler
 *
 * Handles TipTap extension contributions from plugins.
 * Enables dynamic loading/unloading of editor extensions based on enabled plugins.
 */

import type { Extension, Node as TipTapNode, Mark } from '@tiptap/core';
import type { EditorContribution } from './contribution-types';

/**
 * Resolved editor extension ready for use
 */
export interface ResolvedEditorExtension {
  /** Full ID including plugin prefix */
  fullId: string;
  /** Plugin that contributed this extension */
  pluginId: string;
  /** Extension name (unique identifier) */
  name: string;
  /** Type of extension */
  type: 'node' | 'mark' | 'extension';
  /** Module path for dynamic import */
  modulePath?: string;
  /** Loaded extension instance */
  extension?: Extension | TipTapNode | Mark;
  /** NodeView component path (for nodes with React views) */
  nodeViewPath?: string;
  /** Loaded NodeView component */
  nodeViewComponent?: React.ComponentType<unknown>;
  /** Whether the extension is loaded */
  loaded: boolean;
  /** Loading error if any */
  error?: string;
}

/**
 * Editor extension contribution definition in plugin manifest
 */
export interface EditorExtensionContribution {
  /** Extension name */
  name: string;
  /** Type of extension */
  type: 'node' | 'mark' | 'extension';
  /** Module path relative to plugin directory */
  module: string;
  /** NodeView component path (for nodes with custom views) */
  nodeView?: string;
  /** Extension priority (higher = loaded later, can override) */
  priority?: number;
}

/**
 * EditorContributionHandler
 *
 * Manages TipTap extension contributions from plugins.
 */
export class EditorContributionHandler {
  private contributions: Map<string, EditorContribution[]> = new Map();
  private resolvedExtensions: Map<string, ResolvedEditorExtension> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Register editor contributions from a plugin
   */
  register(pluginId: string, contribution: EditorContribution): void {
    const existing = this.contributions.get(pluginId) || [];
    existing.push(contribution);
    this.contributions.set(pluginId, existing);

    // Process extensions
    this.processContribution(pluginId, contribution);
    this.notifyListeners();
  }

  /**
   * Unregister all editor contributions from a plugin
   */
  unregister(pluginId: string): void {
    // Remove all resolved extensions from this plugin
    for (const [extId, ext] of this.resolvedExtensions) {
      if (ext.pluginId === pluginId) {
        this.resolvedExtensions.delete(extId);
      }
    }

    this.contributions.delete(pluginId);
    this.notifyListeners();
  }

  /**
   * Process an editor contribution
   */
  private processContribution(pluginId: string, contribution: EditorContribution): void {
    if (contribution.extensions) {
      for (const ext of contribution.extensions) {
        const fullId = `${pluginId}:${ext.name}`;

        this.resolvedExtensions.set(fullId, {
          fullId,
          pluginId,
          name: ext.name,
          type: ext.type,
          modulePath: ext.module,
          nodeViewPath: ext.nodeView,
          loaded: false,
        });
      }
    }
  }

  /**
   * Load extensions for a specific plugin
   * @param pluginId - Plugin ID to load extensions for
   * @param basePath - Base path to resolve module paths
   */
  async loadExtensions(pluginId: string, basePath: string): Promise<ResolvedEditorExtension[]> {
    const loaded: ResolvedEditorExtension[] = [];

    for (const [extId, ext] of this.resolvedExtensions) {
      if (ext.pluginId !== pluginId || ext.loaded) {
        continue;
      }

      try {
        // Build the full module path
        const modulePath = `${basePath}/${pluginId}/editor/${ext.modulePath || 'extension'}`;

        // Dynamic import of the extension module
        const module = await import(/* @vite-ignore */ modulePath);
        const ExtensionClass = module.default || module[ext.name] || Object.values(module)[0];

        if (!ExtensionClass) {
          throw new Error(`Extension ${ext.name} not found in module`);
        }

        // Load NodeView if specified
        let nodeViewComponent: React.ComponentType<unknown> | undefined;
        if (ext.nodeViewPath) {
          const nodeViewPath = `${basePath}/${pluginId}/editor/${ext.nodeViewPath}`;
          const nodeViewModule = await import(/* @vite-ignore */ nodeViewPath);
          nodeViewComponent = nodeViewModule.default || Object.values(nodeViewModule)[0];
        }

        // Update resolved extension
        this.resolvedExtensions.set(extId, {
          ...ext,
          extension: ExtensionClass,
          nodeViewComponent,
          loaded: true,
        });

        loaded.push(this.resolvedExtensions.get(extId)!);
      } catch (error) {
        console.error(`[EditorContributionHandler] Failed to load extension ${extId}:`, error);

        this.resolvedExtensions.set(extId, {
          ...ext,
          error: error instanceof Error ? error.message : String(error),
          loaded: false,
        });
      }
    }

    this.notifyListeners();
    return loaded;
  }

  /**
   * Get all resolved extensions
   */
  getResolvedExtensions(): ResolvedEditorExtension[] {
    return Array.from(this.resolvedExtensions.values());
  }

  /**
   * Get loaded extensions for specific plugins
   */
  getLoadedExtensions(enabledPlugins: string[]): ResolvedEditorExtension[] {
    return this.getResolvedExtensions()
      .filter((ext) => ext.loaded && enabledPlugins.includes(ext.pluginId));
  }

  /**
   * Get extension by name
   */
  getExtension(name: string): ResolvedEditorExtension | undefined {
    for (const ext of this.resolvedExtensions.values()) {
      if (ext.name === name) {
        return ext;
      }
    }
    return undefined;
  }

  /**
   * Check if a plugin has editor contributions
   */
  hasContributions(pluginId: string): boolean {
    return this.contributions.has(pluginId);
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Reset handler (for testing)
   */
  reset(): void {
    this.contributions.clear();
    this.resolvedExtensions.clear();
    this.notifyListeners();
  }
}

// Singleton instance
let _instance: EditorContributionHandler | null = null;

/**
 * Get the global editor contribution handler
 */
export function getEditorContributionHandler(): EditorContributionHandler {
  if (!_instance) {
    _instance = new EditorContributionHandler();
  }
  return _instance;
}

/**
 * Create a new editor contribution handler (for testing)
 */
export function createEditorContributionHandler(): EditorContributionHandler {
  return new EditorContributionHandler();
}
