/**
 * Export Contribution Handler
 *
 * Handles export contributions from plugins.
 * Dynamically loads export assets and builds export bundles based on content.
 */

import type {
  ExportContribution,
  ExportAssets,
  ExportBundle,
} from './contribution-types';

/**
 * Loaded export assets from a plugin
 */
interface LoadedExportAssets {
  pluginId: string;
  assets: ExportAssets;
}

/**
 * ExportContributionHandler
 *
 * Manages export contributions from plugins and provides
 * export bundles for HTML/PDF export.
 */
export class ExportContributionHandler {
  private contributions: Map<string, ExportContribution[]> = new Map();
  private loadedAssets: Map<string, LoadedExportAssets> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Register an export contribution from a plugin
   */
  register(pluginId: string, contribution: ExportContribution): void {
    const existing = this.contributions.get(pluginId) || [];
    existing.push(contribution);
    this.contributions.set(pluginId, existing);
    this.notifyListeners();
  }

  /**
   * Unregister all export contributions from a plugin
   */
  unregister(pluginId: string): void {
    this.contributions.delete(pluginId);
    this.loadedAssets.delete(pluginId);
    this.notifyListeners();
  }

  /**
   * Get all contributions
   */
  getAll(): Map<string, ExportContribution[]> {
    return new Map(this.contributions);
  }

  /**
   * Load export assets for a plugin
   */
  async loadAssets(pluginId: string, assetsPath: string): Promise<ExportAssets | null> {
    // Check cache first
    const cached = this.loadedAssets.get(pluginId);
    if (cached) {
      return cached.assets;
    }

    try {
      // Dynamic import of the assets module
      // In production, this would be a proper module path
      const assetsModule = await import(/* @vite-ignore */ assetsPath);
      const assets: ExportAssets = assetsModule.default || assetsModule;

      this.loadedAssets.set(pluginId, { pluginId, assets });
      return assets;
    } catch (error) {
      console.error(`[ExportContributionHandler] Failed to load assets for ${pluginId}:`, error);
      return null;
    }
  }

  /**
   * Register pre-loaded assets (for bundled plugins)
   */
  registerAssets(pluginId: string, assets: ExportAssets): void {
    this.loadedAssets.set(pluginId, { pluginId, assets });
  }

  /**
   * Build an export bundle for the given HTML content
   *
   * @param html - The HTML content being exported
   * @param enabledPlugins - List of enabled plugin IDs
   * @param pluginSettings - Settings for each plugin
   * @param theme - Export theme ('light' or 'dark')
   * @returns Export bundle with all needed assets
   */
  buildBundle(
    html: string,
    enabledPlugins: string[],
    pluginSettings: Map<string, Record<string, unknown>>,
    theme: string = 'default'
  ): ExportBundle {
    const bundle: ExportBundle = {
      cssLinks: [],
      jsLinks: [],
      inlineStyles: [],
      initScripts: [],
    };

    for (const [pluginId, loaded] of this.loadedAssets) {
      // Skip disabled plugins
      if (!enabledPlugins.includes(pluginId)) {
        continue;
      }

      const { assets } = loaded;

      // Check if this plugin's assets are needed
      if (assets.isNeeded && !assets.isNeeded(html)) {
        continue;
      }

      // Add CSS links
      if (assets.css) {
        bundle.cssLinks.push(...assets.css);
      }

      // Add JS links
      if (assets.js) {
        bundle.jsLinks.push(...assets.js);
      }

      // Add inline styles
      if (assets.inlineStyles) {
        bundle.inlineStyles.push(assets.inlineStyles);
      }

      // Generate init script
      if (assets.initScript) {
        const settings = pluginSettings.get(pluginId) || {};
        const initScript = assets.initScript(settings, theme);
        if (initScript) {
          bundle.initScripts.push(initScript);
        }
      }
    }

    return bundle;
  }

  /**
   * Generate HTML head content for export
   */
  generateHeadHtml(bundle: ExportBundle): string {
    const parts: string[] = [];

    // CSS links
    for (const href of bundle.cssLinks) {
      parts.push(`<link rel="stylesheet" href="${escapeHtml(href)}">`);
    }

    // Inline styles
    if (bundle.inlineStyles.length > 0) {
      parts.push('<style>');
      parts.push(bundle.inlineStyles.join('\n\n'));
      parts.push('</style>');
    }

    return parts.join('\n');
  }

  /**
   * Generate HTML script content for export (end of body)
   */
  generateScriptsHtml(bundle: ExportBundle): string {
    const parts: string[] = [];

    // JS links
    for (const src of bundle.jsLinks) {
      parts.push(`<script src="${escapeHtml(src)}"></script>`);
    }

    // Init scripts (wrapped in DOMContentLoaded)
    if (bundle.initScripts.length > 0) {
      parts.push('<script>');
      parts.push('document.addEventListener("DOMContentLoaded", function() {');
      for (const script of bundle.initScripts) {
        parts.push(`  try { ${script} } catch(e) { console.error('Init script error:', e); }`);
      }
      parts.push('});');
      parts.push('</script>');
    }

    return parts.join('\n');
  }

  /**
   * Get all loaded assets
   */
  getLoadedAssets(): Map<string, LoadedExportAssets> {
    return new Map(this.loadedAssets);
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /**
   * Clear all contributions (for testing)
   */
  reset(): void {
    this.contributions.clear();
    this.loadedAssets.clear();
    this.notifyListeners();
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Singleton instance
let _instance: ExportContributionHandler | null = null;

/**
 * Get the global export contribution handler
 */
export function getExportContributionHandler(): ExportContributionHandler {
  if (!_instance) {
    _instance = new ExportContributionHandler();
  }
  return _instance;
}

/**
 * Create a new export contribution handler (for testing)
 */
export function createExportContributionHandler(): ExportContributionHandler {
  return new ExportContributionHandler();
}
