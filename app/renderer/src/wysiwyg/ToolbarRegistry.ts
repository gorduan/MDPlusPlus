/**
 * ToolbarRegistry - Centralized registry for WYSIWYG toolbar items
 * Plugins can register their own toolbar items which appear in the WYSIWYG toolbar
 */

import { Editor } from '@tiptap/react';
import { LucideIcon } from 'lucide-react';

export type ToolbarItemType = 'button' | 'dropdown' | 'separator' | 'divider';

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  group: string;
  priority: number;
  icon?: LucideIcon;
  label: string;
  tooltip?: string;
  shortcut?: string;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  action?: (editor: Editor) => void;
  options?: ToolbarDropdownOption[];
  pluginId?: string;
}

export interface ToolbarDropdownOption {
  id: string;
  label: string;
  icon?: LucideIcon;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
}

export interface ToolbarGroup {
  id: string;
  label: string;
  priority: number;
  items: ToolbarItem[];
}

class ToolbarRegistryClass {
  private items: Map<string, ToolbarItem> = new Map();
  private groups: Map<string, { label: string; priority: number }> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.registerDefaultGroups();
  }

  private registerDefaultGroups() {
    // Default toolbar groups in order
    this.groups.set('history', { label: 'History', priority: 0 });
    this.groups.set('format', { label: 'Format', priority: 10 });
    this.groups.set('heading', { label: 'Heading', priority: 20 });
    this.groups.set('list', { label: 'List', priority: 30 });
    this.groups.set('insert', { label: 'Insert', priority: 40 });
    this.groups.set('mdpp', { label: 'MD++', priority: 50 });
    this.groups.set('plugin', { label: 'Plugins', priority: 100 });
  }

  /**
   * Register a toolbar group
   */
  registerGroup(id: string, label: string, priority: number = 100): void {
    this.groups.set(id, { label, priority });
    this.notifyListeners();
  }

  /**
   * Register a toolbar item
   */
  register(item: ToolbarItem): void {
    const id = item.pluginId ? `${item.pluginId}:${item.id}` : item.id;
    this.items.set(id, { ...item, id });
    this.notifyListeners();
  }

  /**
   * Register multiple toolbar items at once
   */
  registerMany(items: ToolbarItem[]): void {
    for (const item of items) {
      const id = item.pluginId ? `${item.pluginId}:${item.id}` : item.id;
      this.items.set(id, { ...item, id });
    }
    this.notifyListeners();
  }

  /**
   * Register toolbar items from a plugin definition
   */
  registerFromPlugin(pluginId: string, toolbarConfig: PluginToolbarConfig): void {
    if (!toolbarConfig.groups) return;

    for (const group of toolbarConfig.groups) {
      // Ensure the group exists
      if (!this.groups.has(group.id)) {
        this.registerGroup(group.id, group.label || group.id, group.priority || 100);
      }

      for (const itemId of group.items) {
        // Create placeholder items for plugin toolbar buttons
        this.register({
          id: itemId,
          type: 'button',
          group: group.id,
          priority: group.priority || 100,
          label: itemId,
          pluginId,
          action: (editor) => {
            // Default action: insert directive for this component
            editor.chain().focus().setDirective({
              framework: pluginId,
              component: itemId,
            }).run();
          },
        });
      }
    }
  }

  /**
   * Unregister a toolbar item
   */
  unregister(id: string): void {
    this.items.delete(id);
    this.notifyListeners();
  }

  /**
   * Unregister all items from a specific plugin
   */
  unregisterPlugin(pluginId: string): void {
    for (const [id] of this.items) {
      if (id.startsWith(`${pluginId}:`)) {
        this.items.delete(id);
      }
    }
    this.notifyListeners();
  }

  /**
   * Get a toolbar item by ID
   */
  get(id: string): ToolbarItem | undefined {
    return this.items.get(id);
  }

  /**
   * Get all toolbar items grouped by their group
   */
  getGroupedItems(): ToolbarGroup[] {
    const groupMap = new Map<string, ToolbarItem[]>();

    // Initialize groups
    for (const [groupId] of this.groups) {
      groupMap.set(groupId, []);
    }

    // Add items to their groups
    for (const item of this.items.values()) {
      const groupItems = groupMap.get(item.group) || [];
      groupItems.push(item);
      groupMap.set(item.group, groupItems);
    }

    // Build sorted groups with sorted items
    const result: ToolbarGroup[] = [];
    const sortedGroups = Array.from(this.groups.entries())
      .sort((a, b) => a[1].priority - b[1].priority);

    for (const [groupId, groupInfo] of sortedGroups) {
      const items = groupMap.get(groupId) || [];
      if (items.length > 0) {
        items.sort((a, b) => a.priority - b.priority);
        result.push({
          id: groupId,
          label: groupInfo.label,
          priority: groupInfo.priority,
          items,
        });
      }
    }

    return result;
  }

  /**
   * Get all items as a flat sorted array
   */
  getAllItems(): ToolbarItem[] {
    return Array.from(this.items.values())
      .sort((a, b) => {
        const groupA = this.groups.get(a.group)?.priority || 100;
        const groupB = this.groups.get(b.group)?.priority || 100;
        if (groupA !== groupB) return groupA - groupB;
        return a.priority - b.priority;
      });
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Reset to default state
   */
  reset(): void {
    this.items.clear();
    this.groups.clear();
    this.registerDefaultGroups();
    this.notifyListeners();
  }
}

// Plugin toolbar configuration interface
export interface PluginToolbarConfig {
  enabled?: boolean;
  groups?: Array<{
    id: string;
    label?: string;
    priority?: number;
    items: string[];
  }>;
}

// Singleton instance
export const toolbarRegistry = new ToolbarRegistryClass();

// Default export
export default toolbarRegistry;
