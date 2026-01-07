/**
 * Mermaid Export Assets
 *
 * Defines what resources are needed when exporting documents with Mermaid diagrams.
 * This replaces the hardcoded CDN links in App.tsx export functions.
 */

import type { ExportAssets } from '../../../src/plugin-system/contribution-types';

/**
 * Mermaid Export Assets
 */
export const mermaidExportAssets: ExportAssets = {
  // CSS (none needed for mermaid)
  css: [],

  // External JavaScript CDN URLs
  js: [
    'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js',
  ],

  /**
   * Generate initialization script for exported documents
   */
  initScript: (settings: Record<string, unknown>, theme: string): string => {
    const mermaidTheme = theme === 'dark' ? 'dark' : 'default';
    const securityLevel = (settings.securityLevel as string) ?? 'loose';

    return `
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
          startOnLoad: false,
          theme: '${mermaidTheme}',
          securityLevel: '${securityLevel}'
        });
        mermaid.run({ nodes: document.querySelectorAll('.mermaid') });
      }
    `.trim();
  },

  // Inline CSS styles for export
  inlineStyles: `
    .mermaid {
      text-align: center;
      margin: 1em 0;
      background-color: transparent;
    }
    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  `.trim(),

  /**
   * Check if Mermaid assets are needed for the given content
   */
  isNeeded: (html: string): boolean => {
    return (
      html.includes('class="mermaid"') ||
      html.includes("class='mermaid'") ||
      html.includes('data-type="mermaid-block"')
    );
  },
};

// Default export for dynamic import
export default mermaidExportAssets;
