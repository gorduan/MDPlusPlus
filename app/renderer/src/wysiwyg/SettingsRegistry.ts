/**
 * SettingsRegistry - Registry for WYSIWYG plugin settings
 * Plugins can register their own settings panels
 */

export type SettingFieldType = 'text' | 'number' | 'boolean' | 'select' | 'color' | 'range';

export interface SettingFieldOption {
  value: string;
  label: string;
}

export interface SettingField {
  id: string;
  type: SettingFieldType;
  label: string;
  description?: string;
  defaultValue: unknown;
  options?: SettingFieldOption[]; // For select fields
  min?: number; // For number/range fields
  max?: number;
  step?: number;
}

export interface SettingsSection {
  id: string;
  label: string;
  description?: string;
  fields: SettingField[];
  pluginId?: string;
}

export interface PluginSettings {
  pluginId: string;
  sections: SettingsSection[];
}

class SettingsRegistryClass {
  private sections: Map<string, SettingsSection> = new Map();
  private values: Map<string, unknown> = new Map();
  private listeners: Set<() => void> = new Set();
  private storageKey = 'mdpp-wysiwyg-settings';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Register a settings section
   */
  registerSection(section: SettingsSection): void {
    const id = section.pluginId ? `${section.pluginId}:${section.id}` : section.id;
    this.sections.set(id, { ...section, id });

    // Initialize default values for new fields
    for (const field of section.fields) {
      const fieldId = `${id}.${field.id}`;
      if (!this.values.has(fieldId)) {
        this.values.set(fieldId, field.defaultValue);
      }
    }

    this.notifyListeners();
  }

  /**
   * Register multiple sections from a plugin
   */
  registerFromPlugin(pluginId: string, sections: SettingsSection[]): void {
    for (const section of sections) {
      this.registerSection({ ...section, pluginId });
    }
  }

  /**
   * Unregister a settings section
   */
  unregisterSection(id: string): void {
    this.sections.delete(id);
    this.notifyListeners();
  }

  /**
   * Unregister all sections from a plugin
   */
  unregisterPlugin(pluginId: string): void {
    for (const [id] of this.sections) {
      if (id.startsWith(`${pluginId}:`)) {
        this.sections.delete(id);
      }
    }
    this.notifyListeners();
  }

  /**
   * Get a settings section by ID
   */
  getSection(id: string): SettingsSection | undefined {
    return this.sections.get(id);
  }

  /**
   * Get all settings sections
   */
  getAllSections(): SettingsSection[] {
    return Array.from(this.sections.values());
  }

  /**
   * Get sections grouped by plugin
   */
  getSectionsByPlugin(): Map<string, SettingsSection[]> {
    const grouped = new Map<string, SettingsSection[]>();

    for (const section of this.sections.values()) {
      const pluginId = section.pluginId || 'builtin';
      const sections = grouped.get(pluginId) || [];
      sections.push(section);
      grouped.set(pluginId, sections);
    }

    return grouped;
  }

  /**
   * Get a setting value
   */
  getValue<T>(sectionId: string, fieldId: string): T | undefined {
    const fullId = `${sectionId}.${fieldId}`;
    return this.values.get(fullId) as T | undefined;
  }

  /**
   * Set a setting value
   */
  setValue(sectionId: string, fieldId: string, value: unknown): void {
    const fullId = `${sectionId}.${fieldId}`;
    this.values.set(fullId, value);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Get all values for a section
   */
  getSectionValues(sectionId: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const prefix = `${sectionId}.`;

    for (const [key, value] of this.values) {
      if (key.startsWith(prefix)) {
        const fieldId = key.slice(prefix.length);
        result[fieldId] = value;
      }
    }

    return result;
  }

  /**
   * Reset a section to default values
   */
  resetSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (!section) return;

    for (const field of section.fields) {
      const fullId = `${sectionId}.${field.id}`;
      this.values.set(fullId, field.defaultValue);
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Reset all settings to defaults
   */
  resetAll(): void {
    this.values.clear();

    for (const section of this.sections.values()) {
      for (const field of section.fields) {
        const fullId = `${section.id}.${field.id}`;
        this.values.set(fullId, field.defaultValue);
      }
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to settings changes
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
   * Save settings to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.values);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        for (const [key, value] of Object.entries(data)) {
          this.values.set(key, value);
        }
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
  }

  /**
   * Export all settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(Object.fromEntries(this.values), null, 2);
  }

  /**
   * Import settings from JSON
   */
  importSettings(json: string): void {
    try {
      const data = JSON.parse(json);
      for (const [key, value] of Object.entries(data)) {
        this.values.set(key, value);
      }
      this.saveToStorage();
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Invalid settings JSON');
    }
  }
}

// Singleton instance
export const settingsRegistry = new SettingsRegistryClass();

export default settingsRegistry;
