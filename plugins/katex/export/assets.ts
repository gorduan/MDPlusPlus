/**
 * KaTeX Export Assets
 *
 * Defines CDN resources needed when exporting documents with math equations.
 * This replaces the hardcoded KaTeX CDN links in the export system.
 */

import type { ExportAssets } from '../../../src/plugin-system/contribution-types';

/**
 * KaTeX Export Assets Configuration
 */
export const katexExportAssets: ExportAssets = {
  // KaTeX CSS for math styling
  css: [
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
  ],

  // KaTeX JavaScript libraries
  js: [
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
  ],

  /**
   * Generate initialization script for KaTeX
   * @param settings - Plugin settings
   * @param theme - Export theme (light/dark)
   * @returns JavaScript initialization code
   */
  initScript: (settings: Record<string, unknown>, _theme: string): string => {
    const throwOnError = settings.throwOnError ?? false;
    const strict = settings.strict ?? false;
    const trust = settings.trust ?? false;
    const macros = settings.macros ?? {};

    return `
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\\\[', right: '\\\\]', display: true },
            { left: '\\\\(', right: '\\\\)', display: false }
          ],
          throwOnError: ${throwOnError},
          strict: ${strict},
          trust: ${trust},
          macros: ${JSON.stringify(macros)}
        });
      }
    `.trim();
  },

  /**
   * Check if KaTeX assets are needed for this content
   * Detects math delimiters and math classes in the HTML
   */
  isNeeded: (html: string): boolean => {
    // Check for KaTeX class markers
    if (html.includes('class="katex"') || html.includes('class="math')) {
      return true;
    }

    // Check for math delimiters that would need processing
    if (html.includes('$$') || html.includes('\\[') || html.includes('\\(')) {
      return true;
    }

    // Check for math code blocks
    if (html.includes('language-math') || html.includes('language-latex') || html.includes('language-katex')) {
      return true;
    }

    return false;
  },
};

// Default export for dynamic import
export default katexExportAssets;
