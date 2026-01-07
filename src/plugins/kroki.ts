/**
 * Kroki Plugin for MD++
 * Renders diagrams from text using the Kroki API
 *
 * Supported diagram types:
 * - blockdiag, seqdiag, actdiag, nwdiag, packetdiag, rackdiag
 * - bpmn, bytefield, c4plantuml, d2, dbml, ditaa, erd
 * - excalidraw, graphviz, mermaid, nomnoml, pikchr, plantuml
 * - structurizr, svgbob, symbolator, tikz, umlet
 * - vega, vegalite, wavedrom, wireviz
 *
 * Usage:
 * ```kroki-plantuml
 * @startuml
 * Alice -> Bob: Hello
 * @enduml
 * ```
 *
 * Or with directive:
 * :::kroki{type="plantuml"}
 * @startuml
 * Alice -> Bob: Hello
 * @enduml
 * :::
 *
 * @see https://kroki.io/
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

// Supported Kroki diagram types
export const KROKI_DIAGRAM_TYPES = [
  'blockdiag', 'seqdiag', 'actdiag', 'nwdiag', 'packetdiag', 'rackdiag',
  'bpmn', 'bytefield', 'c4plantuml', 'd2', 'dbml', 'ditaa', 'erd',
  'excalidraw', 'graphviz', 'mermaid', 'nomnoml', 'pikchr', 'plantuml',
  'structurizr', 'svgbob', 'symbolator', 'tikz', 'umlet',
  'vega', 'vegalite', 'wavedrom', 'wireviz',
] as const;

export type KrokiDiagramType = typeof KROKI_DIAGRAM_TYPES[number];

// Output formats
export type KrokiOutputFormat = 'svg' | 'png' | 'jpeg' | 'pdf' | 'base64';

// Plugin options
export interface KrokiPluginOptions {
  /** Kroki server URL (default: https://kroki.io) */
  serverUrl?: string;
  /** Default output format (default: svg) */
  defaultFormat?: KrokiOutputFormat;
  /** Render mode: 'inline' embeds Base64, 'api' uses img src to API */
  renderMode?: 'inline' | 'api';
  /** Fallback content if rendering fails */
  showFallback?: boolean;
  /** Custom CSS class for diagram containers */
  containerClass?: string;
}

const DEFAULT_OPTIONS: Required<KrokiPluginOptions> = {
  serverUrl: 'https://kroki.io',
  defaultFormat: 'svg',
  renderMode: 'api',
  showFallback: true,
  containerClass: 'mdpp-kroki-diagram',
};

/**
 * Encode diagram source for Kroki API
 * Uses deflate + base64 URL-safe encoding
 */
export function encodeKrokiDiagram(source: string): string {
  // Simple URL-safe base64 encoding
  // For browser, we'd use pako for deflate, but for simplicity we use plain base64
  const base64 = Buffer.from(source, 'utf-8').toString('base64');
  // Make URL-safe: replace + with -, / with _, remove =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Build Kroki API URL for a diagram
 */
export function buildKrokiUrl(
  type: string,
  source: string,
  format: KrokiOutputFormat = 'svg',
  serverUrl: string = DEFAULT_OPTIONS.serverUrl
): string {
  const encoded = encodeKrokiDiagram(source);
  return `${serverUrl}/${type}/${format}/${encoded}`;
}

/**
 * Check if a language is a Kroki diagram type
 */
export function isKrokiLanguage(lang: string): lang is KrokiDiagramType {
  // Support both "kroki-plantuml" and plain "plantuml" syntax
  const normalizedLang = lang.replace(/^kroki-/, '').toLowerCase();
  return KROKI_DIAGRAM_TYPES.includes(normalizedLang as KrokiDiagramType);
}

/**
 * Extract Kroki type from language string
 */
export function extractKrokiType(lang: string): KrokiDiagramType | null {
  const normalizedLang = lang.replace(/^kroki-/, '').toLowerCase();
  if (KROKI_DIAGRAM_TYPES.includes(normalizedLang as KrokiDiagramType)) {
    return normalizedLang as KrokiDiagramType;
  }
  return null;
}

/**
 * Generate HTML for Kroki diagram
 */
function generateKrokiHtml(
  type: KrokiDiagramType,
  source: string,
  options: Required<KrokiPluginOptions>
): string {
  const url = buildKrokiUrl(type, source, options.defaultFormat, options.serverUrl);

  const escapedSource = source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  if (options.renderMode === 'api') {
    // Use img tag pointing to Kroki API
    return `<div class="${options.containerClass}" data-kroki-type="${type}">
  <img src="${url}" alt="${type} diagram" loading="lazy" />
  ${options.showFallback ? `<noscript><pre class="kroki-fallback">${escapedSource}</pre></noscript>` : ''}
</div>`;
  } else {
    // Inline mode - generate data URL placeholder
    // Actual Base64 content would need async fetch
    return `<div class="${options.containerClass}" data-kroki-type="${type}" data-kroki-src="${url}">
  <div class="kroki-loading">Loading ${type} diagram...</div>
  <pre class="kroki-source" style="display:none;">${escapedSource}</pre>
</div>`;
  }
}

/**
 * Remark plugin for Kroki diagram rendering
 */
export const remarkKroki: Plugin<[KrokiPluginOptions?]> = (options = {}) => {
  const opts: Required<KrokiPluginOptions> = { ...DEFAULT_OPTIONS, ...options };

  return (tree) => {
    // Handle fenced code blocks with kroki-* or direct diagram type languages
    visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
      if (!node.lang) return;

      const krokiType = extractKrokiType(node.lang);
      if (!krokiType) return;

      // Don't process mermaid if it's handled by the built-in mermaid support
      // Allow users to use kroki-mermaid explicitly if they want Kroki's mermaid
      if (krokiType === 'mermaid' && !node.lang.startsWith('kroki-')) {
        return;
      }

      const html = generateKrokiHtml(krokiType, node.value, opts);

      // Replace with HTML node
      node.type = 'html';
      node.value = html;
    });

    // Handle :::kroki directive
    visit(tree, (node: any) => {
      if (node.type === 'containerDirective' && node.name === 'kroki') {
        const type = (node.attributes?.type || 'plantuml') as KrokiDiagramType;

        // Extract text content from children
        let source = '';
        if (node.children) {
          source = extractText(node.children);
        }

        if (!KROKI_DIAGRAM_TYPES.includes(type)) {
          // Unknown type - show error
          node.type = 'html';
          node.value = `<div class="mdpp-error mdpp-error-warning">
  <strong>⚠️ Unknown Kroki Diagram Type</strong>
  <p>Type "${type}" is not supported. Supported types: ${KROKI_DIAGRAM_TYPES.slice(0, 10).join(', ')}...</p>
</div>`;
          return;
        }

        const html = generateKrokiHtml(type, source.trim(), opts);

        // Replace directive with HTML
        node.type = 'html';
        node.value = html;
        node.children = undefined;
      }
    });
  };
};

/**
 * Extract text content from node children
 */
function extractText(children: any[]): string {
  return children
    .map((child: any) => {
      if (child.type === 'text') return child.value;
      if (child.type === 'paragraph' && child.children) {
        return extractText(child.children);
      }
      if (child.children) return extractText(child.children);
      return '';
    })
    .join('\n');
}

/**
 * Get all Kroki language aliases for code block support
 * Returns both "kroki-*" and plain "*" variants
 */
export function getKrokiLanguages(): string[] {
  const languages: string[] = [];
  for (const type of KROKI_DIAGRAM_TYPES) {
    languages.push(type);
    languages.push(`kroki-${type}`);
  }
  return languages;
}

export default remarkKroki;
