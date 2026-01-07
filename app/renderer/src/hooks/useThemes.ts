/**
 * useThemes Hook - React integration for ThemeService
 *
 * Provides reactive state management for themes.
 * Automatically syncs with localStorage and notifies on changes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Theme, ThemesState, ThemeColors, ThemeModificationAction } from '../types/themes';
import { ThemeService } from '../services/ThemeService';

export interface UseThemesReturn {
  /** All available themes */
  themes: Theme[];
  /** The currently active theme */
  activeTheme: Theme;
  /** Colors from the active theme */
  activeColors: ThemeColors;
  /** Whether the active theme is read-only */
  isActiveReadOnly: boolean;

  /** Switch to a different theme */
  selectTheme: (id: string) => void;
  /** Create a new theme */
  createTheme: (name: string, baseColors?: ThemeColors, baseType?: 'light' | 'dark') => Theme;
  /** Delete a theme (returns false if builtin) */
  deleteTheme: (id: string) => boolean;
  /** Rename a theme (returns false if builtin) */
  renameTheme: (id: string, newName: string) => boolean;

  /**
   * Update colors in the active theme
   * - For non-read-only themes: updates directly
   * - For read-only themes: returns false (caller must show dialog)
   */
  updateColors: (colors: Partial<ThemeColors>) => boolean;

  /**
   * Update a single color in the active theme
   */
  updateColor: (variable: keyof ThemeColors, value: string) => boolean;

  /**
   * Handle modification action from user dialog
   * Called after user chooses what to do when modifying a read-only theme
   */
  handleModificationAction: (action: ThemeModificationAction, pendingColors: ThemeColors) => void;

  /** Check if "Custom" theme exists */
  hasCustomTheme: boolean;
  /** Check if a theme name is already taken */
  isNameTaken: (name: string, excludeId?: string) => boolean;

  /** Get colors for a specific theme (without switching) */
  getThemeColors: (id: string) => ThemeColors | null;

  /** Apply a theme temporarily (for toolbar toggle) without changing active theme */
  applyThemeTemporarily: (id: string) => boolean;

  /** Export theme as CSS */
  exportThemeAsCSS: (id: string) => string | null;

  /** Export theme as JSON */
  exportThemeAsJSON: (id: string) => string | null;

  /** Import theme from CSS or JSON content */
  importTheme: (content: string, name: string) => Theme | null;
}

/**
 * Hook for managing themes
 */
export function useThemes(): UseThemesReturn {
  const [state, setState] = useState<ThemesState>(() => ThemeService.loadThemes());

  // Subscribe to ThemeService changes
  useEffect(() => {
    const unsubscribe = ThemeService.subscribe((newState) => {
      // Create a new object reference to ensure React detects the change
      setState({ ...newState, themes: { ...newState.themes } });
    });

    return unsubscribe;
  }, []);

  // Apply active theme on mount
  useEffect(() => {
    ThemeService.applyActiveTheme();
  }, []);

  // Memoized derived values
  const themes = useMemo(() => Object.values(state.themes), [state.themes]);

  const activeTheme = useMemo(
    () => state.themes[state.activeThemeId],
    [state.themes, state.activeThemeId]
  );

  const activeColors = useMemo(
    () => ({ ...activeTheme.colors }),
    [activeTheme.colors]
  );

  const isActiveReadOnly = activeTheme.isReadOnly;

  const hasCustomTheme = useMemo(
    () => ThemeService.hasCustomTheme(),
    [state.themes]
  );

  // Actions
  const selectTheme = useCallback((id: string) => {
    ThemeService.setActiveTheme(id);
  }, []);

  const createTheme = useCallback((
    name: string,
    baseColors?: ThemeColors,
    baseType: 'light' | 'dark' = 'dark'
  ): Theme => {
    return ThemeService.createTheme(name, baseColors, baseType);
  }, []);

  const deleteTheme = useCallback((id: string): boolean => {
    return ThemeService.deleteTheme(id);
  }, []);

  const renameTheme = useCallback((id: string, newName: string): boolean => {
    return ThemeService.renameTheme(id, newName);
  }, []);

  const updateColors = useCallback((colors: Partial<ThemeColors>): boolean => {
    if (activeTheme.isReadOnly) {
      // Caller must show dialog and then call handleModificationAction
      return false;
    }

    return ThemeService.updateThemeColors(activeTheme.id, colors);
  }, [activeTheme]);

  const updateColor = useCallback((variable: keyof ThemeColors, value: string): boolean => {
    if (activeTheme.isReadOnly) {
      return false;
    }

    return ThemeService.updateThemeColor(activeTheme.id, variable, value);
  }, [activeTheme]);

  const handleModificationAction = useCallback(
    (action: ThemeModificationAction, pendingColors: ThemeColors) => {
      switch (action.type) {
        case 'overwrite-custom': {
          const customTheme = ThemeService.upsertCustomTheme(pendingColors, activeTheme.baseType);
          ThemeService.setActiveTheme(customTheme.id);
          break;
        }
        case 'create-new': {
          const newTheme = ThemeService.createTheme(action.name, pendingColors, activeTheme.baseType);
          ThemeService.setActiveTheme(newTheme.id);
          break;
        }
        case 'cancel':
          // Do nothing, color change is discarded
          // Re-apply current theme to reset any preview changes
          ThemeService.applyActiveTheme();
          break;
      }
    },
    [activeTheme.baseType]
  );

  const isNameTaken = useCallback((name: string, excludeId?: string): boolean => {
    return ThemeService.isNameTaken(name, excludeId);
  }, [state.themes]);

  const getThemeColors = useCallback((id: string): ThemeColors | null => {
    return ThemeService.getThemeColors(id);
  }, [state.themes]);

  const applyThemeTemporarily = useCallback((id: string): boolean => {
    return ThemeService.applyThemeTemporarily(id);
  }, []);

  const exportThemeAsCSS = useCallback((id: string): string | null => {
    return ThemeService.exportThemeAsCSS(id);
  }, []);

  const exportThemeAsJSON = useCallback((id: string): string | null => {
    return ThemeService.exportThemeAsJSON(id);
  }, []);

  const importTheme = useCallback((content: string, name: string): Theme | null => {
    return ThemeService.importTheme(content, name);
  }, []);

  return {
    themes,
    activeTheme,
    activeColors,
    isActiveReadOnly,
    selectTheme,
    createTheme,
    deleteTheme,
    renameTheme,
    updateColors,
    updateColor,
    handleModificationAction,
    hasCustomTheme,
    isNameTaken,
    getThemeColors,
    applyThemeTemporarily,
    exportThemeAsCSS,
    exportThemeAsJSON,
    importTheme,
  };
}

export default useThemes;
