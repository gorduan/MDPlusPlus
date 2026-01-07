/**
 * Mermaid Parser Plugin for MD++
 *
 * Provides Mermaid diagram support for:
 * - Flowcharts
 * - Sequence diagrams
 * - Class diagrams
 * - State diagrams
 * - Entity Relationship diagrams
 * - Gantt charts
 * - Pie charts
 * - And more...
 *
 * @see https://mermaid.js.org/
 */

import type { MDPlusPlusPlugin, PluginContext } from '../../src/plugin-system/types';

/**
 * Mermaid plugin settings
 */
interface MermaidSettings {
  /** Mermaid theme */
  theme: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  /** Security level */
  securityLevel: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  /** Auto-initialize on page load */
  startOnLoad: boolean;
  /** Log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

// Current settings
let currentSettings: MermaidSettings = {
  theme: 'default',
  securityLevel: 'loose',
  startOnLoad: true,
  logLevel: 'error',
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
 * Mermaid Plugin
 */
const mermaidPlugin: MDPlusPlusPlugin = {
  id: 'mermaid',

  /**
   * Handle mermaid code blocks
   */
  codeBlockHandler(language: string, code: string): string | null {
    if (language.toLowerCase() === 'mermaid') {
      // Mermaid.js expects content in a <pre class="mermaid"> tag
      // The mermaid library will find and render these automatically
      return `<pre class="mermaid">${escapeHtml(code)}</pre>`;
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
    } as MermaidSettings;

    context.log.info('Mermaid plugin activated');
  },

  /**
   * Called when the plugin is deactivated
   */
  async deactivate(): Promise<void> {
    currentSettings = {
      theme: 'default',
      securityLevel: 'loose',
      startOnLoad: true,
      logLevel: 'error',
    };
  },

  /**
   * Called when settings change
   */
  onSettingsChange(settings: Record<string, unknown>): void {
    currentSettings = {
      ...currentSettings,
      ...settings,
    } as MermaidSettings;
  },

  /**
   * Public API for other plugins
   */
  api: {
    /**
     * Get supported diagram types
     */
    getDiagramTypes(): string[] {
      return [
        'flowchart',
        'sequenceDiagram',
        'classDiagram',
        'stateDiagram',
        'erDiagram',
        'gantt',
        'pie',
        'journey',
        'gitGraph',
        'mindmap',
        'timeline',
        'quadrantChart',
        'requirement',
        'sankey',
        'block',
        'packet',
        'architecture',
      ];
    },

    /**
     * Get current settings
     */
    getSettings(): MermaidSettings {
      return { ...currentSettings };
    },

    /**
     * Get initialization config for mermaid.initialize()
     */
    getInitConfig(): Record<string, unknown> {
      return {
        startOnLoad: currentSettings.startOnLoad,
        theme: currentSettings.theme,
        securityLevel: currentSettings.securityLevel,
        logLevel: currentSettings.logLevel,
      };
    },
  },
};

export default mermaidPlugin;
