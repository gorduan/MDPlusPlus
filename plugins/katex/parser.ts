/**
 * KaTeX Parser Plugin for MD++
 *
 * Provides math/LaTeX support using remark-math and rehype-katex.
 *
 * Supported syntax:
 * - Inline math: $E = mc^2$
 * - Display math: $$\sum_{i=1}^{n} i$$
 * - Code blocks: ```math, ```latex, ```katex
 */

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { MDPlusPlusPlugin, PluginContext } from '../../src/plugin-system/types';

/**
 * KaTeX plugin settings
 */
interface KaTeXSettings {
  /** Whether to render in display mode by default */
  displayMode: boolean;
  /** Throw on parse errors */
  throwOnError: boolean;
  /** Strict mode */
  strict: boolean | 'warn' | 'error';
  /** Trust input (allows some commands) */
  trust: boolean;
  /** Custom macros */
  macros: Record<string, string>;
}

// Current settings (updated on activation and settings change)
let currentSettings: KaTeXSettings = {
  displayMode: true,
  throwOnError: false,
  strict: false,
  trust: false,
  macros: {},
};

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * KaTeX Plugin
 */
const katexPlugin: MDPlusPlusPlugin = {
  id: 'katex',

  /**
   * Remark plugins for markdown AST processing
   * Adds math node types to the AST
   */
  remarkPlugins() {
    return [remarkMath];
  },

  /**
   * Rehype plugins for HTML AST processing
   * Renders math nodes to KaTeX HTML
   */
  rehypePlugins() {
    return [
      [
        rehypeKatex,
        {
          throwOnError: currentSettings.throwOnError,
          strict: currentSettings.strict,
          trust: currentSettings.trust,
          macros: currentSettings.macros,
        },
      ],
    ];
  },

  /**
   * Handle math code blocks (```math, ```latex, ```katex)
   */
  codeBlockHandler(language: string, code: string): string | null {
    const lang = language.toLowerCase();

    if (lang === 'math' || lang === 'latex' || lang === 'katex') {
      // Return a div that will be processed by KaTeX auto-render
      // or by rehype-katex if it's still in the pipeline
      return `<div class="math math-display" data-math-style="display">${escapeHtml(code)}</div>`;
    }

    return null;
  },

  /**
   * Called when the plugin is activated
   */
  async activate(context: PluginContext): Promise<void> {
    currentSettings = {
      ...currentSettings,
      ...context.settings,
    } as KaTeXSettings;

    context.log.info('KaTeX plugin activated');
  },

  /**
   * Called when the plugin is deactivated
   */
  async deactivate(): Promise<void> {
    // Reset settings
    currentSettings = {
      displayMode: true,
      throwOnError: false,
      strict: false,
      trust: false,
      macros: {},
    };
  },

  /**
   * Called when settings change
   */
  onSettingsChange(settings: Record<string, unknown>): void {
    currentSettings = {
      ...currentSettings,
      ...settings,
    } as KaTeXSettings;
  },

  /**
   * Public API for other plugins
   */
  api: {
    /**
     * Render a LaTeX string to HTML
     */
    render(latex: string, displayMode: boolean = false): string {
      // This would use KaTeX directly if available
      // For now, return the escaped content in a math wrapper
      return displayMode
        ? `<div class="math math-display">${escapeHtml(latex)}</div>`
        : `<span class="math math-inline">${escapeHtml(latex)}</span>`;
    },

    /**
     * Get current settings
     */
    getSettings(): KaTeXSettings {
      return { ...currentSettings };
    },
  },
};

export default katexPlugin;
