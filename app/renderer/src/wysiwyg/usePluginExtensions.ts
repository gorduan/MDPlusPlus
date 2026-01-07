/**
 * usePluginExtensions Hook
 *
 * Dynamically loads TipTap extensions from enabled plugins.
 * Provides a mechanism for plugins to contribute editor extensions
 * that are only loaded when the plugin is enabled.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Extension, Node as TipTapNode, Mark } from '@tiptap/core';

// Import extension classes directly from plugins
// These are loaded statically but only used when the plugin is enabled
import { MermaidBlock } from '../../../../plugins/mermaid/editor/extension';
import MermaidNodeView from '../../../../plugins/mermaid/editor/nodeview';
import { AdmonitionBlock } from '../../../../plugins/admonitions/editor/extension';

/**
 * Registered plugin extension
 */
export interface PluginExtension {
  /** Plugin ID that provides this extension */
  pluginId: string;
  /** Extension name */
  name: string;
  /** The TipTap extension instance */
  extension: Extension | TipTapNode | Mark;
  /** Priority for ordering (higher = later in the chain) */
  priority?: number;
}

/**
 * Extension registry - maps plugin IDs to their extension factories
 */
const PLUGIN_EXTENSIONS: Record<string, () => PluginExtension[]> = {
  mermaid: () => [
    {
      pluginId: 'mermaid',
      name: 'mermaidBlock',
      extension: MermaidBlock.configure({
        nodeViewComponent: MermaidNodeView,
      }),
      priority: 100,
    },
  ],
  admonitions: () => [
    {
      pluginId: 'admonitions',
      name: 'admonitionBlock',
      extension: AdmonitionBlock.configure({}),
      priority: 100,
    },
  ],
};

/**
 * Hook to get TipTap extensions from enabled plugins
 *
 * @param enabledPlugins - List of currently enabled plugin IDs
 * @returns Object with extensions array and loading state
 */
export function usePluginExtensions(enabledPlugins: string[]) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Compute extensions based on enabled plugins
  const extensions = useMemo(() => {
    const result: PluginExtension[] = [];

    for (const pluginId of enabledPlugins) {
      const factory = PLUGIN_EXTENSIONS[pluginId];
      if (factory) {
        try {
          const pluginExtensions = factory();
          result.push(...pluginExtensions);
        } catch (err) {
          console.error(`[usePluginExtensions] Failed to load extensions for ${pluginId}:`, err);
        }
      }
    }

    // Sort by priority
    result.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

    return result;
  }, [enabledPlugins]);

  // Mark as loaded after initial render
  useEffect(() => {
    setLoading(false);
  }, []);

  // Get just the extension instances
  const extensionInstances = useMemo(() => {
    return extensions.map((ext) => ext.extension);
  }, [extensions]);

  // Get set of available node type names (for content transformation)
  const availableNodeTypes = useMemo(() => {
    const types = new Set<string>();
    for (const ext of extensions) {
      types.add(ext.name);
    }
    return types;
  }, [extensions]);

  // Get extension by name
  const getExtension = useCallback(
    (name: string): PluginExtension | undefined => {
      return extensions.find((ext) => ext.name === name);
    },
    [extensions]
  );

  // Check if a specific extension is available
  const hasExtension = useCallback(
    (name: string): boolean => {
      return extensions.some((ext) => ext.name === name);
    },
    [extensions]
  );

  return {
    /** Loading state */
    loading,
    /** Error if any occurred during loading */
    error,
    /** All plugin extensions with metadata */
    extensions,
    /** Just the TipTap extension instances (for useEditor) */
    extensionInstances,
    /** Set of available node type names (for content transformation) */
    availableNodeTypes,
    /** Get a specific extension by name */
    getExtension,
    /** Check if an extension is available */
    hasExtension,
    /** Number of loaded extensions */
    count: extensions.length,
  };
}

/**
 * Get the list of available plugin extension IDs
 */
export function getAvailablePluginExtensions(): string[] {
  return Object.keys(PLUGIN_EXTENSIONS);
}

/**
 * Register a custom plugin extension factory
 * This can be used to add extensions at runtime
 */
export function registerPluginExtension(
  pluginId: string,
  factory: () => PluginExtension[]
): void {
  PLUGIN_EXTENSIONS[pluginId] = factory;
}

export default usePluginExtensions;
