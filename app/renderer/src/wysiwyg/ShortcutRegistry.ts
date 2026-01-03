/**
 * ShortcutRegistry - Registry for WYSIWYG keyboard shortcuts
 * Plugins can register their own keyboard shortcuts
 */

import { Editor } from '@tiptap/react';

export interface ShortcutDefinition {
  id: string;
  keys: string; // e.g., "Mod-Shift-C", "Ctrl+Alt+T"
  description: string;
  category: string;
  action: (editor: Editor) => boolean;
  pluginId?: string;
}

export interface ShortcutCategory {
  id: string;
  label: string;
  shortcuts: ShortcutDefinition[];
}

class ShortcutRegistryClass {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private categories: Map<string, string> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.registerDefaultCategories();
  }

  private registerDefaultCategories() {
    this.categories.set('format', 'Formatting');
    this.categories.set('insert', 'Insert');
    this.categories.set('navigation', 'Navigation');
    this.categories.set('mdpp', 'MD++');
    this.categories.set('plugin', 'Plugins');
  }

  /**
   * Register a category
   */
  registerCategory(id: string, label: string): void {
    this.categories.set(id, label);
    this.notifyListeners();
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: ShortcutDefinition): void {
    const id = shortcut.pluginId ? `${shortcut.pluginId}:${shortcut.id}` : shortcut.id;
    this.shortcuts.set(id, { ...shortcut, id });
    this.notifyListeners();
  }

  /**
   * Register multiple shortcuts at once
   */
  registerMany(shortcuts: ShortcutDefinition[]): void {
    for (const shortcut of shortcuts) {
      const id = shortcut.pluginId ? `${shortcut.pluginId}:${shortcut.id}` : shortcut.id;
      this.shortcuts.set(id, { ...shortcut, id });
    }
    this.notifyListeners();
  }

  /**
   * Unregister a shortcut
   */
  unregister(id: string): void {
    this.shortcuts.delete(id);
    this.notifyListeners();
  }

  /**
   * Unregister all shortcuts from a plugin
   */
  unregisterPlugin(pluginId: string): void {
    for (const [id] of this.shortcuts) {
      if (id.startsWith(`${pluginId}:`)) {
        this.shortcuts.delete(id);
      }
    }
    this.notifyListeners();
  }

  /**
   * Get a shortcut by ID
   */
  get(id: string): ShortcutDefinition | undefined {
    return this.shortcuts.get(id);
  }

  /**
   * Get all shortcuts grouped by category
   */
  getGroupedShortcuts(): ShortcutCategory[] {
    const groupMap = new Map<string, ShortcutDefinition[]>();

    // Initialize categories
    for (const [categoryId] of this.categories) {
      groupMap.set(categoryId, []);
    }

    // Add shortcuts to their categories
    for (const shortcut of this.shortcuts.values()) {
      const categoryShortcuts = groupMap.get(shortcut.category) || [];
      categoryShortcuts.push(shortcut);
      groupMap.set(shortcut.category, categoryShortcuts);
    }

    // Build result
    const result: ShortcutCategory[] = [];
    for (const [categoryId, label] of this.categories) {
      const shortcuts = groupMap.get(categoryId) || [];
      if (shortcuts.length > 0) {
        result.push({
          id: categoryId,
          label,
          shortcuts,
        });
      }
    }

    return result;
  }

  /**
   * Get all shortcuts as a flat array
   */
  getAllShortcuts(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Find shortcut by key combination
   */
  findByKeys(keys: string): ShortcutDefinition | undefined {
    const normalizedKeys = this.normalizeKeys(keys);
    for (const shortcut of this.shortcuts.values()) {
      if (this.normalizeKeys(shortcut.keys) === normalizedKeys) {
        return shortcut;
      }
    }
    return undefined;
  }

  /**
   * Normalize key string for comparison
   */
  private normalizeKeys(keys: string): string {
    return keys
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/mod/g, 'ctrl')
      .replace(/command/g, 'ctrl')
      .replace(/\+/g, '-');
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
    this.shortcuts.clear();
    this.categories.clear();
    this.registerDefaultCategories();
    this.notifyListeners();
  }
}

// Singleton instance
export const shortcutRegistry = new ShortcutRegistryClass();

export default shortcutRegistry;
