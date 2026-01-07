/**
 * Theme Service for MD++
 *
 * Handles persistence and business logic for themes.
 * Themes are stored globally in localStorage and can be referenced by profiles.
 */

import {
  Theme,
  ThemesState,
  ThemeColors,
  BUILTIN_THEMES,
  THEME_IDS,
  DEFAULT_DARK_COLORS,
} from '../types/themes';

const STORAGE_KEY = 'mdpp-themes';

/**
 * Generate a unique ID for user-created themes
 */
function generateThemeId(): string {
  return `theme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Create initial state with built-in themes
 */
function createInitialState(): ThemesState {
  const themes: Record<string, Theme> = {};
  for (const theme of BUILTIN_THEMES) {
    themes[theme.id] = { ...theme };
  }

  return {
    version: 1,
    activeThemeId: THEME_IDS.DARK, // Default to dark theme
    themes,
  };
}

/**
 * Apply theme colors to document root
 */
function applyThemeToDocument(colors: ThemeColors): void {
  const root = document.documentElement;
  Object.entries(colors).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
}

/**
 * ThemeService - Static service for theme management
 *
 * All methods are static for easy access from any component.
 * State changes trigger localStorage updates automatically.
 */
export class ThemeService {
  private static state: ThemesState | null = null;
  private static listeners: Set<(state: ThemesState) => void> = new Set();

  /**
   * Load themes from localStorage
   * Returns cached state if already loaded
   */
  static loadThemes(): ThemesState {
    if (this.state) {
      return this.state;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ThemesState;

        // Ensure built-in themes exist and are up-to-date
        for (const builtin of BUILTIN_THEMES) {
          if (!parsed.themes[builtin.id]) {
            parsed.themes[builtin.id] = { ...builtin };
          } else {
            // Update built-in theme properties
            parsed.themes[builtin.id].isBuiltin = true;
            parsed.themes[builtin.id].isReadOnly = true;
            // Always update colors for built-in themes to latest defaults
            parsed.themes[builtin.id].colors = { ...builtin.colors };
          }
        }

        // Ensure active theme exists
        if (!parsed.themes[parsed.activeThemeId]) {
          parsed.activeThemeId = THEME_IDS.DARK;
        }

        this.state = parsed;
      } else {
        this.state = createInitialState();
        this.saveThemes(this.state);
      }
    } catch (error) {
      console.error('Failed to load themes, using defaults:', error);
      this.state = createInitialState();
      this.saveThemes(this.state);
    }

    return this.state;
  }

  /**
   * Save themes to localStorage
   */
  static saveThemes(state: ThemesState): void {
    // Create a deep copy to ensure React detects state changes
    this.state = JSON.parse(JSON.stringify(state));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save themes:', error);
    }
  }

  /**
   * Subscribe to state changes
   */
  static subscribe(listener: (state: ThemesState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(): void {
    if (this.state) {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }
  }

  /**
   * Get the currently active theme
   */
  static getActiveTheme(): Theme {
    const state = this.loadThemes();
    return state.themes[state.activeThemeId];
  }

  /**
   * Get a theme by ID without switching to it
   */
  static getThemeById(id: string): Theme | null {
    const state = this.loadThemes();
    return state.themes[id] || null;
  }

  /**
   * Get colors for a specific theme without switching to it
   */
  static getThemeColors(id: string): ThemeColors | null {
    const theme = this.getThemeById(id);
    return theme ? { ...theme.colors } : null;
  }

  /**
   * Get all themes as an array
   */
  static getAllThemes(): Theme[] {
    const state = this.loadThemes();
    return Object.values(state.themes);
  }

  /**
   * Create a new user theme
   */
  static createTheme(name: string, baseColors?: ThemeColors, baseType: 'light' | 'dark' = 'dark'): Theme {
    const state = this.loadThemes();

    const newTheme: Theme = {
      id: generateThemeId(),
      name,
      isBuiltin: false,
      isReadOnly: false,
      baseType,
      colors: baseColors ? { ...baseColors } : { ...DEFAULT_DARK_COLORS },
      createdAt: now(),
      modifiedAt: now(),
    };

    state.themes[newTheme.id] = newTheme;
    this.saveThemes(state);

    return newTheme;
  }

  /**
   * Delete a theme (only non-builtin themes can be deleted)
   * Returns true if deleted, false if theme doesn't exist or is builtin
   */
  static deleteTheme(id: string): boolean {
    const state = this.loadThemes();
    const theme = state.themes[id];

    if (!theme || theme.isBuiltin) {
      return false;
    }

    delete state.themes[id];

    // If we deleted the active theme, switch to default
    if (state.activeThemeId === id) {
      state.activeThemeId = THEME_IDS.DARK;
    }

    this.saveThemes(state);
    return true;
  }

  /**
   * Rename a theme (only non-builtin themes can be renamed)
   */
  static renameTheme(id: string, newName: string): boolean {
    const state = this.loadThemes();
    const theme = state.themes[id];

    if (!theme || theme.isBuiltin) {
      return false;
    }

    theme.name = newName;
    theme.modifiedAt = now();
    this.saveThemes(state);
    return true;
  }

  /**
   * Set the active theme and apply it to the document
   */
  static setActiveTheme(id: string): boolean {
    const state = this.loadThemes();
    const theme = state.themes[id];

    if (!theme) {
      return false;
    }

    state.activeThemeId = id;
    this.saveThemes(state);

    // Apply theme to document
    applyThemeToDocument(theme.colors);

    return true;
  }

  /**
   * Update colors in a specific theme
   * For read-only themes, this will fail (caller should handle custom theme creation)
   */
  static updateThemeColors(id: string, colors: Partial<ThemeColors>): boolean {
    const state = this.loadThemes();
    const theme = state.themes[id];

    if (!theme || theme.isReadOnly) {
      return false;
    }

    theme.colors = { ...theme.colors, ...colors };
    theme.modifiedAt = now();
    this.saveThemes(state);

    // If this is the active theme, apply changes immediately
    if (state.activeThemeId === id) {
      applyThemeToDocument(theme.colors);
    }

    return true;
  }

  /**
   * Update a single color in a theme
   */
  static updateThemeColor(id: string, variable: keyof ThemeColors, value: string): boolean {
    return this.updateThemeColors(id, { [variable]: value } as Partial<ThemeColors>);
  }

  /**
   * Check if a "Custom" theme exists
   */
  static hasCustomTheme(): boolean {
    const state = this.loadThemes();
    return Object.values(state.themes).some(
      (t) => t.name === 'Custom' && !t.isBuiltin
    );
  }

  /**
   * Get the "Custom" theme if it exists
   */
  static getCustomTheme(): Theme | null {
    const state = this.loadThemes();
    return Object.values(state.themes).find(
      (t) => t.name === 'Custom' && !t.isBuiltin
    ) || null;
  }

  /**
   * Create or update the "Custom" theme with given colors
   * Returns the custom theme
   */
  static upsertCustomTheme(colors: ThemeColors, baseType: 'light' | 'dark' = 'dark'): Theme {
    const existing = this.getCustomTheme();

    if (existing) {
      this.updateThemeColors(existing.id, colors);
      return this.getThemeById(existing.id)!;
    }

    return this.createTheme('Custom', colors, baseType);
  }

  /**
   * Check if a theme name is already taken
   */
  static isNameTaken(name: string, excludeId?: string): boolean {
    const state = this.loadThemes();
    return Object.values(state.themes).some(
      (t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== excludeId
    );
  }

  /**
   * Apply the active theme to the document
   * Call this on app startup
   */
  static applyActiveTheme(): void {
    const theme = this.getActiveTheme();
    applyThemeToDocument(theme.colors);
  }

  /**
   * Apply a specific theme to the document (without changing active theme)
   * Useful for the toolbar light/dark toggle
   */
  static applyThemeTemporarily(id: string): boolean {
    const theme = this.getThemeById(id);
    if (!theme) {
      return false;
    }
    applyThemeToDocument(theme.colors);
    return true;
  }

  /**
   * Export theme as CSS string
   */
  static exportThemeAsCSS(id: string): string | null {
    const theme = this.getThemeById(id);
    if (!theme) {
      return null;
    }

    const lines = Object.entries(theme.colors)
      .map(([variable, value]) => `  ${variable}: ${value};`)
      .join('\n');

    return `/* MD++ Custom Theme: ${theme.name} */\n:root {\n${lines}\n}\n`;
  }

  /**
   * Export theme as JSON
   */
  static exportThemeAsJSON(id: string): string | null {
    const theme = this.getThemeById(id);
    if (!theme) {
      return null;
    }

    return JSON.stringify({
      name: theme.name,
      baseType: theme.baseType,
      colors: theme.colors,
    }, null, 2);
  }

  /**
   * Import theme from CSS or JSON
   */
  static importTheme(content: string, name: string): Theme | null {
    let colors: Partial<ThemeColors> = {};
    let baseType: 'light' | 'dark' = 'dark';

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === 'object' && parsed.colors) {
        colors = parsed.colors;
        baseType = parsed.baseType || 'dark';
      } else if (typeof parsed === 'object') {
        // Assume it's just colors
        colors = parsed;
      }
    } catch {
      // Not JSON, try CSS
      const varRegex = /(--[\w-]+):\s*([^;]+);/g;
      let match;
      while ((match = varRegex.exec(content)) !== null) {
        const key = match[1] as keyof ThemeColors;
        if (key in DEFAULT_DARK_COLORS) {
          colors[key] = match[2].trim();
        }
      }
    }

    if (Object.keys(colors).length === 0) {
      return null;
    }

    // Merge with defaults
    const fullColors: ThemeColors = { ...DEFAULT_DARK_COLORS, ...colors };

    return this.createTheme(name, fullColors, baseType);
  }

  /**
   * Reset the service state (for testing or when clearing data)
   */
  static reset(): void {
    this.state = null;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default ThemeService;
