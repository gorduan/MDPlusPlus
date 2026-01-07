/**
 * Mermaid Preview Renderer
 *
 * Post-processes Mermaid diagram elements in the preview pane.
 * This replaces the hardcoded renderMermaid() function in Preview.tsx.
 */

import type { PreviewRenderer, PreviewContext } from '../../../src/plugin-system/contribution-types';

/**
 * Mermaid Preview Renderer
 * Converts mermaid code blocks into rendered SVG diagrams
 */
export const mermaidPreviewRenderer: PreviewRenderer = {
  // CSS selectors that identify Mermaid elements
  selectors: ['.mermaid', 'pre.mermaid', '[data-type="mermaid-block"]'],

  // Priority (higher = runs earlier)
  priority: 100,

  /**
   * Render Mermaid diagrams
   */
  async render(elements: Element[], context: PreviewContext): Promise<void> {
    if (elements.length === 0) return;

    // Dynamically import mermaid only when needed
    const mermaid = await import('mermaid');

    // Get settings from context
    const settings = context.getPluginSettings('mermaid');

    // Initialize with current theme and settings
    mermaid.default.initialize({
      startOnLoad: false,
      theme: context.theme === 'dark' ? 'dark' : 'default',
      securityLevel: (settings.securityLevel as 'strict' | 'loose' | 'sandbox' | 'antiscript') ?? 'loose',
      logLevel: (settings.logLevel as 'debug' | 'info' | 'warn' | 'error' | 'fatal') ?? 'error',
    });

    // Store original content and prepare for rendering
    elements.forEach((el, index) => {
      // Store original code if not already stored
      if (!el.getAttribute('data-original')) {
        el.setAttribute('data-original', el.textContent || '');
      }

      // Restore original code for re-rendering
      const originalCode = el.getAttribute('data-original');
      if (originalCode && el.getAttribute('data-processed')) {
        el.textContent = originalCode;
      }

      // Remove processed flag and set unique ID
      el.removeAttribute('data-processed');
      el.id = `mermaid-${Date.now()}-${index}`;
    });

    // Render diagrams
    try {
      await mermaid.default.run({ nodes: elements as unknown as ArrayLike<HTMLElement> });
    } catch (error) {
      console.error('[Mermaid] Rendering error:', error);
    }
  },

  /**
   * Reset elements to their original state
   * Called when the Mermaid plugin is disabled
   */
  reset(elements: Element[]): void {
    elements.forEach((el) => {
      const originalCode = el.getAttribute('data-original');
      if (originalCode) {
        // Clear SVG and show original code
        el.innerHTML = '';
        el.textContent = originalCode;
        el.removeAttribute('data-processed');
      }
    });
  },
};

// Default export for dynamic import
export default mermaidPreviewRenderer;
