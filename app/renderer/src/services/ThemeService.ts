/**
 * Theme Service for MD++
 *
 * Handles persistence and business logic for themes.
 * Themes are stored as JSON files in the app data directory and shared between instances.
 */

import {
  Theme,
  ThemesState,
  ThemeColors,
  BUILTIN_THEMES,
  THEME_IDS,
  DEFAULT_DARK_COLORS,
} from '../types/themes';

const STORAGE_KEY = 'themes';

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
 * List of CSS custom properties that may have been set by previous versions
 */
const THEME_CSS_VARIABLES = [
  '--bg-primary', '--bg-secondary', '--bg-card', '--bg-hover', '--bg-code',
  '--text-primary', '--text-secondary', '--text-muted', '--text-code',
  '--accent', '--accent-hover', '--accent-light',
  '--color-success', '--color-warning', '--color-error', '--color-info',
  '--border-color',
  '--syntax-keyword', '--syntax-string', '--syntax-function',
  '--syntax-variable', '--syntax-comment', '--syntax-number',
];

/**
 * Remove any theme CSS variables from document root
 * This cleans up variables that may have been set by previous app versions
 */
function cleanupDocumentThemeVariables(): void {
  const root = document.documentElement;
  THEME_CSS_VARIABLES.forEach((variable) => {
    root.style.removeProperty(variable);
  });
}

/**
 * Apply theme colors to document root
 *
 * NOTE: This function is now a NO-OP.
 * - UI theme is controlled via data-theme attribute and SCSS light-dark() function
 * - Preview theme is applied via inline styles on the preview-container (themeColors prop)
 *
 * We intentionally do NOT set CSS variables on :root because that would
 * override the SCSS-based light/dark theme system for the app UI.
 */
function applyThemeToDocument(_colors: ThemeColors): void {
  // NO-OP: Do not apply theme colors to document root
  // The Preview component receives themeColors as a prop and applies them via inline styles
  // The app UI uses data-theme attribute with CSS light-dark() function from SCSS
}

/**
 * ThemeService - Static service for theme management
 *
 * All methods are static for easy access from any component.
 * State changes trigger file saves via Electron IPC automatically.
 * State is cached in memory and synced to disk asynchronously.
 */
export class ThemeService {
  private static state: ThemesState | null = null;
  private static listeners: Set<(state: ThemesState) => void> = new Set();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  /**
   * Initialize the service - loads themes from file storage
   * Must be called before using other methods
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    // Clean up any CSS variables from previous app versions
    // The UI now uses data-theme attribute with SCSS light-dark() function
    cleanupDocumentThemeVariables();

    this.initPromise = this.loadFromFile();
    await this.initPromise;
    this.initialized = true;
  }

  /**
   * Refresh themes from file storage
   * Use this to sync themes that may have been created by other instances
   */
  static async refresh(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
      return;
    }

    // Remember current active theme ID
    const currentActiveId = this.state?.activeThemeId;

    await this.loadFromFile();

    // If current active theme still exists, keep it active
    if (currentActiveId && this.state?.themes[currentActiveId]) {
      this.state.activeThemeId = currentActiveId;
    }

    // Notify listeners of the refresh
    this.notifyListeners();
    console.log('[ThemeService] Themes refreshed from file');
  }

  /**
   * Load themes from file storage via Electron IPC
   */
  private static async loadFromFile(): Promise<void> {
    try {
      const stored = await window.electronAPI.loadSettings(STORAGE_KEY);
      console.log('[ThemeService] Loading themes from file, found:', stored ? 'data' : 'nothing');

      if (stored) {
        const parsed = stored as ThemesState;
        console.log('[ThemeService] Parsed themes:', Object.keys(parsed.themes));

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
        // No stored data - create initial state
        this.state = createInitialState();
        await this.saveToFile();
      }
    } catch (error) {
      console.error('[ThemeService] Failed to load themes, using defaults:', error);
      // IMPORTANT: Do NOT save to file here - this would overwrite any existing
      // themes file with only built-in themes, causing data loss!
      // Just use defaults in memory for this session.
      this.state = createInitialState();
      // The user can still create new themes, which will be saved normally
    }
  }

  /**
   * Save themes to file storage via Electron IPC
   */
  private static async saveToFile(): Promise<void> {
    if (!this.state) return;

    try {
      const success = await window.electronAPI.saveSettings(STORAGE_KEY, this.state);
      if (success) {
        console.log('[ThemeService] Saved themes to file:', Object.keys(this.state.themes));
      } else {
        console.error('[ThemeService] Failed to save themes to file');
      }
    } catch (error) {
      console.error('[ThemeService] Failed to save themes:', error);
    }
  }

  /**
   * Load themes - returns cached state, initializing if needed
   * For synchronous access after initialization
   */
  static loadThemes(): ThemesState {
    if (!this.state) {
      // Return initial state if not initialized yet
      // The async initialize() should be called first in App.tsx
      // NOTE: We do NOT set this.state here to prevent data loss!
      // If loadThemes is called before initialization, we return defaults
      // but don't cache them to avoid overwriting the file later.
      console.warn('[ThemeService] loadThemes called before initialization, returning defaults (not cached)');
      return createInitialState();
    }
    return this.state;
  }

  /**
   * Save themes - updates cache and persists to file
   */
  static saveThemes(state: ThemesState): void {
    // IMPORTANT: Don't save if not initialized yet!
    // This prevents overwriting the themes file with default values
    // if saveThemes is called before the file has been loaded.
    if (!this.initialized) {
      console.warn('[ThemeService] saveThemes called before initialization, ignoring to prevent data loss');
      return;
    }

    // Create a deep copy to ensure React detects state changes
    this.state = JSON.parse(JSON.stringify(state));
    this.notifyListeners();
    // Save to file asynchronously
    this.saveToFile();
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
    this.initialized = false;
    this.initPromise = null;
    // Note: File deletion would need a separate IPC call if needed
  }

  /**
   * Check if service is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }
}

export default ThemeService;
