/**
 * usePluginToolbar Hook
 *
 * Integrates plugin toolbar contributions with the ToolbarRegistry.
 * Dynamically registers toolbar items from enabled plugins.
 */

import { useEffect, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { toolbarRegistry, ToolbarItem } from './ToolbarRegistry';
import {
  getToolbarContributionHandler,
  type ResolvedToolbarItem,
} from '../../../../src/plugin-system';
import type { AdmonitionType } from '../tiptap/extensions/AdmonitionBlock';

/**
 * Map of command names to their handler functions
 * This bridges the gap between plugin command names and TipTap editor commands
 */
type CommandHandler = (editor: Editor, args?: unknown) => void;

const COMMAND_HANDLERS: Record<string, CommandHandler> = {
  // Mermaid commands
  setMermaid: (editor) => editor.chain().focus().setMermaid().run(),

  // Math commands (from katex plugin)
  insertInlineMath: (editor) => {
    const math = window.prompt('Enter inline math:', 'E = mc^2');
    if (math) {
      editor.chain().focus().insertContent(`$${math}$`).run();
    }
  },
  insertDisplayMath: (editor) => {
    const math = window.prompt('Enter display math:', '\\int_0^\\infty e^{-x^2} dx');
    if (math) {
      editor.chain().focus().insertContent(`$$\n${math}\n$$`).run();
    }
  },

  // Admonition commands
  toggleAdmonition: (editor, args) => {
    const type = (typeof args === 'string' ? args : 'note') as AdmonitionType;
    editor.chain().focus().toggleAdmonition(type).run();
  },
};

/**
 * Convert a resolved plugin toolbar item to a ToolbarItem for the registry
 */
function convertToToolbarItem(resolved: ResolvedToolbarItem): ToolbarItem {
  const { pluginId, item, icon, commandArgs } = resolved;

  return {
    id: resolved.fullId,
    type: 'button',
    group: item.group,
    priority: item.priority ?? 100,
    icon: icon || undefined,
    label: item.label,
    tooltip: item.tooltip || item.label,
    shortcut: item.shortcut,
    pluginId,
    action: (editor) => {
      const handler = COMMAND_HANDLERS[item.command];
      if (handler) {
        handler(editor, commandArgs);
      } else {
        console.warn(`[PluginToolbar] Unknown command: ${item.command}`);
      }
    },
    isActive: createIsActiveHandler(item.command, commandArgs),
  };
}

/**
 * Create an isActive handler based on the command type
 */
function createIsActiveHandler(
  command: string,
  args?: unknown
): ((editor: Editor) => boolean) | undefined {
  switch (command) {
    case 'toggleAdmonition': {
      const type = typeof args === 'string' ? args : 'note';
      return (editor) => {
        const { selection } = editor.state;
        const node = editor.state.doc.nodeAt(selection.from);
        return node?.type.name === 'admonitionBlock' && node.attrs.type === type;
      };
    }
    default:
      return undefined;
  }
}

/**
 * Hook to integrate plugin toolbar contributions
 *
 * @param enabledPlugins - List of currently enabled plugin IDs
 * @returns Object with refresh function and loading state
 */
export function usePluginToolbar(enabledPlugins: string[]) {
  const [loading, setLoading] = useState(true);
  const [registeredItems, setRegisteredItems] = useState<Set<string>>(new Set());

  const refreshToolbar = useCallback(() => {
    const handler = getToolbarContributionHandler();
    const currentItems = new Set<string>();

    // Get all resolved items from enabled plugins
    const resolvedItems = handler.getResolvedItems();

    for (const resolved of resolvedItems) {
      // Only register items from enabled plugins
      if (!enabledPlugins.includes(resolved.pluginId)) {
        continue;
      }

      currentItems.add(resolved.fullId);

      // Skip if already registered
      if (registeredItems.has(resolved.fullId)) {
        continue;
      }

      // Convert and register
      const toolbarItem = convertToToolbarItem(resolved);
      toolbarRegistry.register(toolbarItem);
    }

    // Unregister items from disabled plugins
    for (const itemId of registeredItems) {
      if (!currentItems.has(itemId)) {
        toolbarRegistry.unregister(itemId);
      }
    }

    setRegisteredItems(currentItems);
    setLoading(false);
  }, [enabledPlugins, registeredItems]);

  // Initial registration and subscription
  useEffect(() => {
    const handler = getToolbarContributionHandler();

    // Register groups from plugins
    const groups = handler.getResolvedGroups();
    for (const group of groups) {
      if (enabledPlugins.includes(group.pluginId)) {
        toolbarRegistry.registerGroup(group.id, group.label, group.priority);
      }
    }

    // Initial refresh
    refreshToolbar();

    // Subscribe to changes
    const unsubscribe = handler.subscribe(refreshToolbar);

    return () => {
      unsubscribe();
      // Clean up registered items on unmount
      for (const itemId of registeredItems) {
        toolbarRegistry.unregister(itemId);
      }
    };
  }, [enabledPlugins]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading,
    refresh: refreshToolbar,
    registeredCount: registeredItems.size,
  };
}

/**
 * Initialize plugin toolbar contributions from manifests
 */
export function initializePluginToolbar(
  manifests: Array<{ id: string; contributes?: { toolbar?: unknown } }>,
  enabledPlugins: string[]
): void {
  const handler = getToolbarContributionHandler();

  for (const manifest of manifests) {
    if (manifest.contributes?.toolbar && enabledPlugins.includes(manifest.id)) {
      handler.register(manifest.id, manifest.contributes.toolbar as Parameters<typeof handler.register>[1]);
    }
  }
}

export default usePluginToolbar;
