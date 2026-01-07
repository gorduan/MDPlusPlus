/**
 * Admonitions Preview Renderer
 *
 * Post-processes admonition elements in the preview pane.
 * Handles styling, icons, and collapsible functionality.
 */

import type { PreviewRenderer, PreviewContext } from '../../../src/plugin-system/contribution-types';

/**
 * Admonition type to icon mapping
 * Uses Material Design Icons or similar icon set
 */
const ADMONITION_ICONS: Record<string, string> = {
  note: '📝',
  tip: '💡',
  warning: '⚠️',
  danger: '🚨',
  info: 'ℹ️',
  success: '✅',
  question: '❓',
  quote: '💬',
  example: '📋',
  bug: '🐛',
  abstract: '📄',
};

/**
 * Admonitions Preview Renderer
 */
export const admonitionsPreviewRenderer: PreviewRenderer = {
  // CSS selectors for admonition elements
  selectors: [
    '.admonition',
    '[data-type="admonition"]',
    '.callout',
    'blockquote[data-callout]', // GitHub-style callouts
  ],

  // Priority (run after basic HTML rendering)
  priority: 80,

  /**
   * Render/enhance admonition elements
   */
  async render(elements: Element[], context: PreviewContext): Promise<void> {
    if (elements.length === 0) return;

    const settings = context.getPluginSettings('admonitions');
    const showIcons = (settings.showIcons as boolean) ?? true;
    const collapsible = (settings.collapsible as boolean) ?? false;

    for (const el of elements) {
      // Skip if already processed
      if (el.hasAttribute('data-admonition-processed')) continue;
      el.setAttribute('data-admonition-processed', 'true');

      // Determine admonition type
      const type = getAdmonitionType(el);
      if (!type) continue;

      // Store original content for reset
      if (!el.hasAttribute('data-original-content')) {
        el.setAttribute('data-original-content', el.innerHTML);
      }

      // Add type class if not present
      if (!el.classList.contains(`admonition-${type}`)) {
        el.classList.add('admonition', `admonition-${type}`);
      }

      // Add icon if enabled and not present
      if (showIcons && !el.querySelector('.admonition-icon')) {
        const icon = ADMONITION_ICONS[type] || ADMONITION_ICONS.note;
        const iconSpan = document.createElement('span');
        iconSpan.className = 'admonition-icon';
        iconSpan.setAttribute('aria-hidden', 'true');
        iconSpan.textContent = icon;

        // Insert at the beginning of the title or the element
        const title = el.querySelector('.admonition-title');
        if (title) {
          title.insertBefore(iconSpan, title.firstChild);
        } else {
          el.insertBefore(iconSpan, el.firstChild);
        }
      }

      // Make collapsible if enabled
      if (collapsible && !el.classList.contains('admonition-collapsible')) {
        makeCollapsible(el);
      }

      // Apply theme-specific styling
      applyThemeStyles(el, context.theme);
    }
  },

  /**
   * Reset elements to their original state
   */
  reset(elements: Element[]): void {
    elements.forEach((el) => {
      // Restore original content
      const original = el.getAttribute('data-original-content');
      if (original) {
        el.innerHTML = original;
      }

      // Remove processing marker
      el.removeAttribute('data-admonition-processed');

      // Remove added classes
      el.classList.remove('admonition-collapsible', 'admonition-collapsed');

      // Remove inline theme styles
      (el as HTMLElement).style.removeProperty('--admonition-bg');
      (el as HTMLElement).style.removeProperty('--admonition-border');
    });
  },
};

/**
 * Get admonition type from element
 */
function getAdmonitionType(el: Element): string | null {
  // Check class-based type (admonition-note, admonition-tip, etc.)
  for (const cls of el.classList) {
    if (cls.startsWith('admonition-') && cls !== 'admonition-title') {
      return cls.replace('admonition-', '');
    }
  }

  // Check data attribute
  const dataType = el.getAttribute('data-type') || el.getAttribute('data-callout');
  if (dataType) {
    return dataType.toLowerCase();
  }

  // Check blockquote callout syntax [!NOTE]
  const firstLine = el.textContent?.trim().split('\n')[0] || '';
  const calloutMatch = firstLine.match(/^\[!(\w+)\]/i);
  if (calloutMatch) {
    return calloutMatch[1].toLowerCase();
  }

  return null;
}

/**
 * Make an admonition collapsible
 */
function makeCollapsible(el: Element): void {
  el.classList.add('admonition-collapsible');

  const title = el.querySelector('.admonition-title');
  if (title) {
    // Add toggle indicator
    const toggle = document.createElement('span');
    toggle.className = 'admonition-toggle';
    toggle.textContent = '▼';
    title.appendChild(toggle);

    // Add click handler
    title.addEventListener('click', () => {
      el.classList.toggle('admonition-collapsed');
      toggle.textContent = el.classList.contains('admonition-collapsed') ? '▶' : '▼';
    });

    // Make title focusable for keyboard navigation
    (title as HTMLElement).tabIndex = 0;
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', 'true');

    title.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        (title as HTMLElement).click();
      }
    });
  }
}

/**
 * Apply theme-specific styles
 */
function applyThemeStyles(el: Element, theme: 'light' | 'dark'): void {
  const htmlEl = el as HTMLElement;
  const type = getAdmonitionType(el);

  // Theme-aware color adjustments could be applied here
  // For now, we rely on CSS custom properties
  if (theme === 'dark') {
    htmlEl.classList.add('admonition-dark');
  } else {
    htmlEl.classList.remove('admonition-dark');
  }
}

// Default export for dynamic import
export default admonitionsPreviewRenderer;
