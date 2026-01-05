/**
 * MD++ Theme Hook
 *
 * Provides theme management using the modern CSS light-dark() function.
 * Based on: https://web.dev/articles/light-dark
 *
 * Features:
 * - Three modes: 'system', 'light', 'dark'
 * - Automatic system preference detection
 * - Persistent theme preference (localStorage)
 * - Real-time theme switching without page reload
 */

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  /** User's theme preference */
  mode: ThemeMode;
  /** The actual resolved theme (after applying system preference) */
  resolvedTheme: ResolvedTheme;
  /** Whether the system prefers dark mode */
  systemPrefersDark: boolean;
}

const STORAGE_KEY = 'mdpp-theme-mode';

/**
 * Get the system color scheme preference
 */
function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Get saved theme mode from localStorage
 */
function getSavedMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

/**
 * Apply theme to the document
 */
function applyTheme(mode: ThemeMode, systemPrefersDark: boolean): void {
  const root = document.documentElement;

  // Remove existing theme classes
  document.body.classList.remove('light', 'dark');

  if (mode === 'system') {
    // Let the browser handle it with color-scheme
    root.style.colorScheme = 'light dark';
    root.removeAttribute('data-theme');

    // Add body class for Mermaid compatibility
    document.body.classList.add(systemPrefersDark ? 'dark' : 'light');
  } else {
    // Force specific theme
    root.style.colorScheme = mode;
    root.setAttribute('data-theme', mode);

    // Add body class for Mermaid compatibility
    document.body.classList.add(mode);
  }
}

/**
 * React hook for theme management
 */
export function useTheme() {
  const [state, setState] = useState<ThemeState>(() => {
    const mode = getSavedMode();
    const systemPrefersDark = getSystemPreference();
    const resolvedTheme: ResolvedTheme =
      mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

    return { mode, resolvedTheme, systemPrefersDark };
  });

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setState((prev) => {
        const systemPrefersDark = e.matches;
        const resolvedTheme: ResolvedTheme =
          prev.mode === 'system'
            ? (systemPrefersDark ? 'dark' : 'light')
            : prev.mode;

        return { ...prev, systemPrefersDark, resolvedTheme };
      });
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Apply theme when state changes
  useEffect(() => {
    applyTheme(state.mode, state.systemPrefersDark);
  }, [state.mode, state.systemPrefersDark]);

  // Set theme mode
  const setMode = useCallback((mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setState((prev) => {
      const resolvedTheme: ResolvedTheme =
        mode === 'system'
          ? (prev.systemPrefersDark ? 'dark' : 'light')
          : mode;

      return { ...prev, mode, resolvedTheme };
    });
  }, []);

  // Toggle between light and dark (ignores system)
  const toggleTheme = useCallback(() => {
    setState((prev) => {
      // If currently system, switch to opposite of resolved
      // If currently light/dark, switch to the other
      const newMode: ResolvedTheme =
        prev.mode === 'system'
          ? (prev.resolvedTheme === 'dark' ? 'light' : 'dark')
          : (prev.mode === 'dark' ? 'light' : 'dark');

      localStorage.setItem(STORAGE_KEY, newMode);

      return {
        ...prev,
        mode: newMode,
        resolvedTheme: newMode,
      };
    });
  }, []);

  // Cycle through all three modes: system -> light -> dark -> system
  const cycleTheme = useCallback(() => {
    setState((prev) => {
      const modes: ThemeMode[] = ['system', 'light', 'dark'];
      const currentIndex = modes.indexOf(prev.mode);
      const newMode = modes[(currentIndex + 1) % modes.length];

      localStorage.setItem(STORAGE_KEY, newMode);

      return {
        ...prev,
        mode: newMode,
        resolvedTheme: newMode === 'system'
          ? (prev.systemPrefersDark ? 'dark' : 'light')
          : newMode,
      };
    });
  }, []);

  return {
    /** Current theme mode preference */
    mode: state.mode,
    /** Resolved theme after applying system preference */
    theme: state.resolvedTheme,
    /** Whether system prefers dark mode */
    systemPrefersDark: state.systemPrefersDark,
    /** Set specific theme mode */
    setMode,
    /** Toggle between light and dark */
    toggleTheme,
    /** Cycle through all three modes */
    cycleTheme,
    /** Check if a specific mode is active */
    isMode: (mode: ThemeMode) => state.mode === mode,
    /** Check if resolved theme matches */
    isDark: state.resolvedTheme === 'dark',
    isLight: state.resolvedTheme === 'light',
  };
}

export default useTheme;
