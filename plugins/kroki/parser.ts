/**
 * Kroki Parser Plugin for MD++
 *
 * Renders diagrams from text using the Kroki API.
 * Supports 30+ diagram types including:
 * - PlantUML, Graphviz (DOT), D2, Structurizr
 * - BPMN, Excalidraw, Mermaid (via Kroki)
 * - BlockDiag, SeqDiag, ActDiag, NwDiag
 * - DBML, Ditaa, ERD, Nomnoml, Pikchr
 * - SVGBob, TikZ, UMLet, Vega, WaveDrom
 *
 * Usage:
 * ```plantuml
 * @startuml
 * Alice -> Bob: Hello
 * @enduml
 * ```
 *
 * Or with kroki- prefix:
 * ```kroki-d2
 * x -> y: Hello
 * ```
 *
 * @see https://kroki.io/
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { MDPlusPlusPlugin, PluginContext } from '../../src/plugin-system/types';

// Supported Kroki diagram types
export const KROKI_DIAGRAM_TYPES = [
  'actdiag',
  'blockdiag',
  'bpmn',
  'bytefield',
  'c4plantuml',
  'd2',
  'dbml',
  'diagramsnet',
  'ditaa',
  'erd',
  'excalidraw',
  'graphviz',
  'dot', // Alias for graphviz
  'mermaid', // Will use kroki-mermaid to distinguish from built-in
  'nomnoml',
  'nwdiag',
  'packetdiag',
  'pikchr',
  'plantuml',
  'rackdiag',
  'seqdiag',
  'structurizr',
  'svgbob',
  'symbolator',
  'tikz',
  'umlet',
  'vega',
  'vegalite',
  'wavedrom',
  'wireviz',
] as const;

export type KrokiDiagramType = (typeof KROKI_DIAGRAM_TYPES)[number];
export type KrokiOutputFormat = 'svg' | 'png' | 'jpeg' | 'pdf';

/**
 * Plugin settings
 */
interface KrokiSettings {
  serverUrl: string;
  format: KrokiOutputFormat;
  cacheDiagrams: boolean;
  fallbackOnError: boolean;
}

// Current settings
let currentSettings: KrokiSettings = {
  serverUrl: 'https://kroki.io',
  format: 'svg',
  cacheDiagrams: true,
  fallbackOnError: true,
};

/**
 * Encode diagram source for Kroki API
 * Uses URL-safe base64 encoding
 */
function encodeKrokiDiagram(source: string): string {
  // Check for Buffer (Node.js) or btoa (browser)
  let base64: string;
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(source, 'utf-8').toString('base64');
  } else if (typeof btoa !== 'undefined') {
    base64 = btoa(unescape(encodeURIComponent(source)));
  } else {
    throw new Error('No base64 encoding available');
  }

  // Make URL-safe: replace + with -, / with _, remove =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Build Kroki API URL for a diagram
 */
function buildKrokiUrl(type: string, source: string): string {
  // Normalize type
  const normalizedType = type === 'dot' ? 'graphviz' : type;
  const encoded = encodeKrokiDiagram(source);
  return `${currentSettings.serverUrl}/${normalizedType}/${currentSettings.format}/${encoded}`;
}

/**
 * Check if a language is a Kroki diagram type
 */
function isKrokiLanguage(lang: string): boolean {
  const normalizedLang = lang.replace(/^kroki-/, '').toLowerCase();
  return KROKI_DIAGRAM_TYPES.includes(normalizedLang as KrokiDiagramType);
}

/**
 * Extract Kroki type from language string
 */
function extractKrokiType(lang: string): string | null {
  const normalizedLang = lang.replace(/^kroki-/, '').toLowerCase();
  if (KROKI_DIAGRAM_TYPES.includes(normalizedLang as KrokiDiagramType)) {
    return normalizedLang;
  }
  return null;
}

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
 * Generate HTML for Kroki diagram
 */
function generateKrokiHtml(type: string, source: string): string {
  const url = buildKrokiUrl(type, source);
  const escapedSource = escapeHtml(source);

  return `<div class="mdpp-kroki-diagram" data-kroki-type="${type}">
  <img src="${url}" alt="${type} diagram" loading="lazy" />
  ${currentSettings.fallbackOnError ? `<noscript><pre class="kroki-fallback">${escapedSource}</pre></noscript>` : ''}
</div>`;
}

/**
 * Remark plugin for Kroki diagram rendering
 */
function createRemarkKroki(): Plugin {
  return () => {
    return (tree: any) => {
      // Handle fenced code blocks
      visit(tree, 'code', (node: any) => {
        if (!node.lang) return;

        const krokiType = extractKrokiType(node.lang);
        if (!krokiType) return;

        // Don't process plain "mermaid" - let the mermaid plugin handle it
        // Only process "kroki-mermaid" for explicit Kroki rendering
        if (krokiType === 'mermaid' && !node.lang.startsWith('kroki-')) {
          return;
        }

        const html = generateKrokiHtml(krokiType, node.value);

        // Replace with HTML node
        node.type = 'html';
        node.value = html;
      });
    };
  };
}

/**
 * Kroki Plugin
 */
const krokiPlugin: MDPlusPlusPlugin = {
  id: 'kroki',

  /**
   * Remark plugins for Kroki diagram processing
   */
  remarkPlugins() {
    return [createRemarkKroki()];
  },

  /**
   * Handle Kroki code blocks
   */
  codeBlockHandler(language: string, code: string): string | null {
    const krokiType = extractKrokiType(language);

    if (!krokiType) return null;

    // Don't handle plain "mermaid" - let mermaid plugin handle it
    if (krokiType === 'mermaid' && !language.startsWith('kroki-')) {
      return null;
    }

    return generateKrokiHtml(krokiType, code);
  },

  /**
   * Called when the plugin is activated
   */
  async activate(context: PluginContext): Promise<void> {
    currentSettings = {
      ...currentSettings,
      ...context.settings,
    } as KrokiSettings;

    context.log.info(`Kroki plugin activated with server: ${currentSettings.serverUrl}`);
  },

  /**
   * Called when the plugin is deactivated
   */
  async deactivate(): Promise<void> {
    currentSettings = {
      serverUrl: 'https://kroki.io',
      format: 'svg',
      cacheDiagrams: true,
      fallbackOnError: true,
    };
  },

  /**
   * Called when settings change
   */
  onSettingsChange(settings: Record<string, unknown>): void {
    currentSettings = {
      ...currentSettings,
      ...settings,
    } as KrokiSettings;
  },

  /**
   * Public API for other plugins
   */
  api: {
    /**
     * Get supported diagram types
     */
    getDiagramTypes(): readonly string[] {
      return KROKI_DIAGRAM_TYPES;
    },

    /**
     * Build a Kroki URL for a diagram
     */
    buildUrl(type: string, source: string): string {
      return buildKrokiUrl(type, source);
    },

    /**
     * Check if a language is supported
     */
    isSupported(language: string): boolean {
      return isKrokiLanguage(language);
    },

    /**
     * Get current settings
     */
    getSettings(): KrokiSettings {
      return { ...currentSettings };
    },
  },
};

export default krokiPlugin;
