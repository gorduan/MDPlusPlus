/**
 * KaTeX Preview Renderer
 *
 * Post-processes math elements in the preview pane.
 * This replaces the hardcoded renderKaTeX() function in Preview.tsx.
 */

import type { PreviewRenderer, PreviewContext } from '../../../src/plugin-system/contribution-types';

/**
 * KaTeX Preview Renderer
 * Renders LaTeX math expressions using KaTeX
 */
export const katexPreviewRenderer: PreviewRenderer = {
  // CSS selectors that identify math elements
  selectors: ['.math', '.language-math', '.math-inline', '.math-display'],

  // Priority (higher = runs earlier)
  priority: 95,

  /**
   * Render math expressions with KaTeX
   */
  async render(elements: Element[], context: PreviewContext): Promise<void> {
    if (elements.length === 0) return;

    // Dynamically import katex only when needed
    const katex = await import('katex');

    // Get settings from context
    const settings = context.getPluginSettings('katex');

    // Process each math element
    for (const el of elements) {
      // Skip if already rendered
      if (el.querySelector('.katex')) continue;

      // Get the math content
      const mathContent = el.textContent || '';
      if (!mathContent.trim()) continue;

      // Determine display mode from class
      const isDisplay = el.classList.contains('math-display');

      try {
        katex.default.render(mathContent, el as HTMLElement, {
          displayMode: isDisplay,
          throwOnError: (settings.throwOnError as boolean) ?? false,
          strict: (settings.strict as boolean) ?? false,
          trust: (settings.trust as boolean) ?? false,
          macros: (settings.macros as Record<string, string>) ?? {},
          output: 'html',
        });
      } catch (error) {
        console.error('[KaTeX] Rendering error:', error);
        // Show error inline
        el.innerHTML = `<span class="katex-error" style="color: red;">${(error as Error).message}</span>`;
      }
    }
  },

  /**
   * Reset elements to their original state
   * Called when the KaTeX plugin is disabled
   */
  reset(elements: Element[]): void {
    elements.forEach((el) => {
      // Store original content before first render
      const original = el.getAttribute('data-original-math');
      if (original) {
        el.innerHTML = '';
        el.textContent = original;
      }
    });
  },
};

// Default export for dynamic import
export default katexPreviewRenderer;
