/**
 * MD++ Plugin System - Preview Contribution Handler
 *
 * Handles dynamic loading and execution of preview renderers from plugins.
 * This replaces the hardcoded mermaid/katex/hljs rendering in Preview.tsx.
 *
 * See: docs/concepts/plugin-system-refactoring.md (Section 9)
 */

import type {
  PreviewContribution,
  PreviewRenderer,
  PreviewContext,
  ContributionHandler,
} from './contribution-types';

/**
 * Manages preview renderers contributed by plugins
 */
export class PreviewContributionHandler implements ContributionHandler<PreviewContribution> {
  private contributions: Map<string, PreviewContribution[]> = new Map();
  private loadedRenderers: Map<string, PreviewRenderer[]> = new Map();
  private loadingPromises: Map<string, Promise<PreviewRenderer | null>> = new Map();

  register(pluginId: string, contribution: PreviewContribution): void {
    const existing = this.contributions.get(pluginId) || [];
    existing.push(contribution);
    this.contributions.set(pluginId, existing);
  }

  unregister(pluginId: string): void {
    this.contributions.delete(pluginId);
    this.loadedRenderers.delete(pluginId);
    // Clear loading promises for this plugin
    for (const key of this.loadingPromises.keys()) {
      if (key.startsWith(`${pluginId}:`)) {
        this.loadingPromises.delete(key);
      }
    }
  }

  getAll(): Map<string, PreviewContribution[]> {
    return new Map(this.contributions);
  }

  /**
   * Load a preview renderer from a plugin
   * Uses dynamic import for lazy loading
   */
  async loadRenderer(pluginId: string, rendererPath: string): Promise<PreviewRenderer | null> {
    const cacheKey = `${pluginId}:${rendererPath}`;

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey)!;
    }

    // Check if already loaded
    const cached = this.loadedRenderers.get(pluginId);
    if (cached) {
      const found = cached.find(r => r.selectors.length > 0);
      if (found) return found;
    }

    // Start loading
    const loadPromise = this.doLoadRenderer(pluginId, rendererPath);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const renderer = await loadPromise;
      if (renderer) {
        const existing = this.loadedRenderers.get(pluginId) || [];
        existing.push(renderer);
        this.loadedRenderers.set(pluginId, existing);
      }
      return renderer;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Actually load the renderer module
   */
  private async doLoadRenderer(pluginId: string, rendererPath: string): Promise<PreviewRenderer | null> {
    try {
      // Build the full path to the renderer
      // In production, this would be resolved differently
      const fullPath = `../../../plugins/${pluginId}/${rendererPath.replace('./', '')}`;

      // Dynamic import
      const module = await import(/* @vite-ignore */ fullPath);

      // Get the default export or named export
      const renderer = module.default || module.renderer || module;

      // Validate it has the required interface
      if (this.isValidRenderer(renderer)) {
        return renderer;
      }

      console.warn(`[Preview] Invalid renderer from plugin ${pluginId}: missing required properties`);
      return null;
    } catch (error) {
      console.error(`[Preview] Failed to load renderer from plugin ${pluginId}:`, error);
      return null;
    }
  }

  /**
   * Type guard for PreviewRenderer
   */
  private isValidRenderer(obj: unknown): obj is PreviewRenderer {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'selectors' in obj &&
      Array.isArray((obj as PreviewRenderer).selectors) &&
      'render' in obj &&
      typeof (obj as PreviewRenderer).render === 'function'
    );
  }

  /**
   * Get all selectors from enabled plugins
   */
  getAllSelectors(enabledPlugins: string[]): string[] {
    const selectors: string[] = [];

    for (const pluginId of enabledPlugins) {
      const contributions = this.contributions.get(pluginId);
      if (contributions) {
        for (const contribution of contributions) {
          if (contribution.selectors) {
            selectors.push(...contribution.selectors);
          }
        }
      }
    }

    return selectors;
  }

  /**
   * Render all matching elements using enabled plugin renderers
   */
  async renderAll(container: HTMLElement, context: PreviewContext): Promise<void> {
    const enabledPlugins = context.getEnabledPlugins();

    // Collect all renderers and their priorities
    const renderTasks: Array<{
      pluginId: string;
      renderer: PreviewRenderer;
      priority: number;
    }> = [];

    for (const pluginId of enabledPlugins) {
      const renderers = this.loadedRenderers.get(pluginId) || [];
      for (const renderer of renderers) {
        renderTasks.push({
          pluginId,
          renderer,
          priority: renderer.priority ?? 100,
        });
      }
    }

    // Sort by priority (higher first)
    renderTasks.sort((a, b) => b.priority - a.priority);

    // Execute renderers
    for (const task of renderTasks) {
      try {
        const elements = Array.from(
          container.querySelectorAll(task.renderer.selectors.join(', '))
        );

        if (elements.length > 0) {
          await task.renderer.render(elements, context);
        }
      } catch (error) {
        console.error(`[Preview] Renderer error in plugin ${task.pluginId}:`, error);
      }
    }
  }

  /**
   * Reset elements for a disabled plugin
   */
  resetPlugin(pluginId: string, container: HTMLElement): void {
    const renderers = this.loadedRenderers.get(pluginId) || [];

    for (const renderer of renderers) {
      if (renderer.reset) {
        try {
          const elements = Array.from(
            container.querySelectorAll(renderer.selectors.join(', '))
          );
          renderer.reset(elements);
        } catch (error) {
          console.error(`[Preview] Reset error in plugin ${pluginId}:`, error);
        }
      }
    }
  }

  /**
   * Reset elements for all disabled plugins
   */
  resetDisabledPlugins(container: HTMLElement, enabledPlugins: string[]): void {
    for (const pluginId of this.loadedRenderers.keys()) {
      if (!enabledPlugins.includes(pluginId)) {
        this.resetPlugin(pluginId, container);
      }
    }
  }
}

// ============================================
// Built-in Renderers (Fallbacks)
// ============================================

/**
 * Built-in renderer for syntax highlighting (always active)
 * This uses highlight.js which is considered a core dependency
 */
export const syntaxHighlightRenderer: PreviewRenderer = {
  selectors: ['pre code:not(.hljs):not(.language-math)'],
  priority: 50, // Lower priority, runs after plugin renderers

  async render(elements: Element[]): Promise<void> {
    // Dynamically import hljs only when needed
    try {
      const hljs = await import('highlight.js');
      for (const el of elements) {
        // Skip mermaid blocks
        if (el.closest('.mermaid')) continue;
        hljs.default.highlightElement(el as HTMLElement);
      }
    } catch {
      console.warn('[Preview] highlight.js not available');
    }
  },
};

// ============================================
// Preview Context Factory
// ============================================

/**
 * Create a preview context from settings
 */
export function createPreviewContext(
  theme: 'light' | 'dark',
  enabledPlugins: string[],
  getPluginSettings: (pluginId: string) => Record<string, unknown>
): PreviewContext {
  return {
    theme,
    getEnabledPlugins: () => enabledPlugins,
    getPluginSettings,
  };
}

// ============================================
// Singleton Instance
// ============================================

let _instance: PreviewContributionHandler | null = null;

/**
 * Get the global preview contribution handler
 */
export function getPreviewContributionHandler(): PreviewContributionHandler {
  if (!_instance) {
    _instance = new PreviewContributionHandler();
  }
  return _instance;
}

/**
 * Create a new preview contribution handler (for testing)
 */
export function createPreviewContributionHandler(): PreviewContributionHandler {
  return new PreviewContributionHandler();
}
