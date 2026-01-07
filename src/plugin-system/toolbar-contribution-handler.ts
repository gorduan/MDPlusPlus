/**
 * Toolbar Contribution Handler
 *
 * Handles toolbar contributions from plugins and integrates with the existing ToolbarRegistry.
 * This replaces hardcoded toolbar items with dynamically loaded plugin contributions.
 */

import type {
  ToolbarContribution,
  ToolbarItemContribution,
  ToolbarGroupContribution,
} from './contribution-types';

// Icon type - plugins reference icons by name, resolved at runtime in the renderer
import type { LucideIcon } from 'lucide-react';

// Lazy-loaded icon registry - populated when first needed
let iconRegistry: Record<string, LucideIcon> | null = null;

async function loadIconRegistry(): Promise<Record<string, LucideIcon>> {
  if (!iconRegistry) {
    const LucideIcons = await import('lucide-react');
    iconRegistry = LucideIcons as unknown as Record<string, LucideIcon>;
  }
  return iconRegistry;
}

/**
 * Resolved toolbar item ready for use in the UI
 */
export interface ResolvedToolbarItem {
  /** Full ID including plugin prefix */
  fullId: string;
  /** Plugin that contributed this item */
  pluginId: string;
  /** Original item definition */
  item: ToolbarItemContribution;
  /** Resolved icon component */
  icon: LucideIcon | null;
  /** Arguments to pass to the command */
  commandArgs?: unknown;
}

/**
 * ToolbarContributionHandler
 *
 * Manages toolbar contributions from plugins and provides
 * resolved items for the ToolbarRegistry.
 */
export class ToolbarContributionHandler {
  private contributions: Map<string, ToolbarContribution[]> = new Map();
  private listeners: Set<() => void> = new Set();

  // Cache for resolved items
  private resolvedItems: Map<string, ResolvedToolbarItem> = new Map();
  private resolvedGroups: Map<string, ToolbarGroupContribution & { pluginId: string }> = new Map();

  /**
   * Register a toolbar contribution from a plugin
   */
  register(pluginId: string, contribution: ToolbarContribution): void {
    const existing = this.contributions.get(pluginId) || [];
    existing.push(contribution);
    this.contributions.set(pluginId, existing);

    // Process the contribution
    this.processContribution(pluginId, contribution);
    this.notifyListeners();
  }

  /**
   * Unregister all toolbar contributions from a plugin
   */
  unregister(pluginId: string): void {
    // Remove all resolved items from this plugin
    for (const [itemId, item] of this.resolvedItems) {
      if (item.pluginId === pluginId) {
        this.resolvedItems.delete(itemId);
      }
    }

    // Remove all resolved groups from this plugin
    for (const [groupId, group] of this.resolvedGroups) {
      if (group.pluginId === pluginId) {
        this.resolvedGroups.delete(groupId);
      }
    }

    this.contributions.delete(pluginId);
    this.notifyListeners();
  }

  /**
   * Get all contributions
   */
  getAll(): Map<string, ToolbarContribution[]> {
    return new Map(this.contributions);
  }

  /**
   * Process a toolbar contribution and resolve icons
   */
  private processContribution(pluginId: string, contribution: ToolbarContribution): void {
    // Process groups
    if (contribution.groups) {
      for (const group of contribution.groups) {
        // Only add if not already registered (by another plugin or core)
        if (!this.resolvedGroups.has(group.id)) {
          this.resolvedGroups.set(group.id, { ...group, pluginId });
        }
      }
    }

    // Process items
    if (contribution.items) {
      for (const item of contribution.items) {
        const fullId = `${pluginId}:${item.id}`;

        // Resolve icon from string to component
        const icon = this.resolveIcon(item.icon);

        // Extract command arguments from the item ID if it follows a pattern
        // e.g., "callout-note" -> command: "toggleAdmonition", args: { type: "note" }
        const commandArgs = this.extractCommandArgs(pluginId, item);

        this.resolvedItems.set(fullId, {
          fullId,
          pluginId,
          item,
          icon,
          commandArgs,
        });
      }
    }
  }

  /**
   * Resolve an icon name to a Lucide icon component
   * Note: This is synchronous but icons will be null until loadIcons() is called
   */
  private resolveIcon(iconName?: string): LucideIcon | null {
    if (!iconName) return null;

    // Check cached registry
    if (iconRegistry) {
      const lucideIcon = iconRegistry[iconName];
      if (lucideIcon) {
        return lucideIcon;
      }
    }

    // Icon will be resolved later when loadIcons() is called
    return null;
  }

  /**
   * Load all icons asynchronously and update resolved items
   */
  async loadIcons(): Promise<void> {
    const registry = await loadIconRegistry();

    // Update all resolved items with their icons
    for (const [itemId, resolved] of this.resolvedItems) {
      if (resolved.item.icon && !resolved.icon) {
        const icon = registry[resolved.item.icon];
        if (icon !== undefined) {
          this.resolvedItems.set(itemId, { ...resolved, icon });
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * Extract command arguments from item configuration
   */
  private extractCommandArgs(pluginId: string, item: ToolbarItemContribution): unknown | undefined {
    // Special handling for admonition callouts
    if (pluginId === 'admonitions' && item.command === 'toggleAdmonition') {
      // Extract type from item ID (e.g., "callout-note" -> "note")
      const match = item.id.match(/^callout-(\w+)$/);
      if (match) {
        return match[1]; // Return just the type string for toggleAdmonition
      }
    }

    return undefined;
  }

  /**
   * Get all resolved toolbar items
   */
  getResolvedItems(): ResolvedToolbarItem[] {
    return Array.from(this.resolvedItems.values());
  }

  /**
   * Get all resolved groups
   */
  getResolvedGroups(): Array<ToolbarGroupContribution & { pluginId: string }> {
    return Array.from(this.resolvedGroups.values());
  }

  /**
   * Get items for a specific group
   */
  getItemsForGroup(groupId: string): ResolvedToolbarItem[] {
    return this.getResolvedItems()
      .filter((item) => item.item.group === groupId)
      .sort((a, b) => (a.item.priority ?? 100) - (b.item.priority ?? 100));
  }

  /**
   * Check if a plugin has toolbar contributions
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
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Clear all contributions (for testing)
   */
  reset(): void {
    this.contributions.clear();
    this.resolvedItems.clear();
    this.resolvedGroups.clear();
    this.notifyListeners();
  }
}

// Singleton instance
let _instance: ToolbarContributionHandler | null = null;

/**
 * Get the global toolbar contribution handler
 */
export function getToolbarContributionHandler(): ToolbarContributionHandler {
  if (!_instance) {
    _instance = new ToolbarContributionHandler();
  }
  return _instance;
}

/**
 * Create a new toolbar contribution handler (for testing)
 */
export function createToolbarContributionHandler(): ToolbarContributionHandler {
  return new ToolbarContributionHandler();
}
