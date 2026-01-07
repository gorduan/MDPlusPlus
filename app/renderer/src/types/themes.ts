/**
 * Theme Types for MD++
 *
 * Themes store color, font, and size settings.
 * Built-in themes (Light, Dark) cannot be deleted or modified.
 * User-created themes can be created, modified, and deleted.
 *
 * Themes are stored globally and can be referenced by Settings Profiles.
 */

/**
 * Theme color values - all CSS custom properties
 */
export interface ThemeColors {
  // Backgrounds
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-card': string;
  '--bg-hover': string;
  '--bg-code': string;
  // Text
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--text-code': string;
  // Accent
  '--accent': string;
  '--accent-hover': string;
  '--accent-light': string;
  // Semantic
  '--color-success': string;
  '--color-warning': string;
  '--color-error': string;
  '--color-info': string;
  // Border
  '--border-color': string;
  // Syntax Highlighting
  '--syntax-keyword': string;
  '--syntax-string': string;
  '--syntax-function': string;
  '--syntax-variable': string;
  '--syntax-comment': string;
  '--syntax-number': string;
}

/**
 * A complete theme definition
 */
export interface Theme {
  /** Unique identifier (e.g., 'light', 'dark', uuid) */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** True for built-in themes (cannot be deleted or modified) */
  isBuiltin: boolean;
  /** True for read-only themes (changes create a new theme) */
  isReadOnly: boolean;
  /** Base theme type - used for toolbar toggle */
  baseType: 'light' | 'dark';
  /** All color values */
  colors: ThemeColors;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  modifiedAt: string;
}

/**
 * State structure stored in localStorage
 */
export interface ThemesState {
  /** Schema version for migrations */
  version: 1;
  /** Currently active theme ID */
  activeThemeId: string;
  /** All themes indexed by ID */
  themes: Record<string, Theme>;
}

/**
 * Built-in theme IDs
 */
export const THEME_IDS = {
  LIGHT: 'light',
  DARK: 'dark',
} as const;

/**
 * Default Dark theme colors
 */
export const DEFAULT_DARK_COLORS: ThemeColors = {
  // Backgrounds
  '--bg-primary': '#0F172A',
  '--bg-secondary': '#1E293B',
  '--bg-card': '#334155',
  '--bg-hover': '#475569',
  '--bg-code': '#1E293B',
  // Text
  '--text-primary': '#F8FAFC',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--text-code': '#E2E8F0',
  // Accent
  '--accent': '#7C3AED',
  '--accent-hover': '#6D28D9',
  '--accent-light': '#A78BFA',
  // Semantic
  '--color-success': '#10B981',
  '--color-warning': '#F59E0B',
  '--color-error': '#EF4444',
  '--color-info': '#3B82F6',
  // Border
  '--border-color': '#475569',
  // Syntax
  '--syntax-keyword': '#c678dd',
  '--syntax-string': '#98c379',
  '--syntax-function': '#61aeee',
  '--syntax-variable': '#e06c75',
  '--syntax-comment': '#5c6370',
  '--syntax-number': '#d19a66',
};

/**
 * Default Light theme colors
 */
export const DEFAULT_LIGHT_COLORS: ThemeColors = {
  // Backgrounds
  '--bg-primary': '#FFFFFF',
  '--bg-secondary': '#F8FAFC',
  '--bg-card': '#F1F5F9',
  '--bg-hover': '#E2E8F0',
  '--bg-code': '#F8FAFC',
  // Text
  '--text-primary': '#1E293B',
  '--text-secondary': '#64748B',
  '--text-muted': '#94A3B8',
  '--text-code': '#1E293B',
  // Accent
  '--accent': '#7C3AED',
  '--accent-hover': '#6D28D9',
  '--accent-light': '#6D28D9',
  // Semantic
  '--color-success': '#059669',
  '--color-warning': '#D97706',
  '--color-error': '#DC2626',
  '--color-info': '#2563EB',
  // Border
  '--border-color': '#E2E8F0',
  // Syntax
  '--syntax-keyword': '#a626a4',
  '--syntax-string': '#50a14f',
  '--syntax-function': '#4078f2',
  '--syntax-variable': '#e45649',
  '--syntax-comment': '#a0a1a7',
  '--syntax-number': '#986801',
};

/**
 * Built-in themes that cannot be deleted
 */
export const BUILTIN_THEMES: Theme[] = [
  {
    id: THEME_IDS.DARK,
    name: 'Dark',
    isBuiltin: true,
    isReadOnly: true,
    baseType: 'dark',
    colors: DEFAULT_DARK_COLORS,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: THEME_IDS.LIGHT,
    name: 'Light',
    isBuiltin: true,
    isReadOnly: true,
    baseType: 'light',
    colors: DEFAULT_LIGHT_COLORS,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * User action when modifying a read-only theme
 */
export type ThemeModificationAction =
  | { type: 'overwrite-custom' }
  | { type: 'create-new'; name: string }
  | { type: 'cancel' };
