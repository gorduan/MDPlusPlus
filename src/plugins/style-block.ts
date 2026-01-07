/**
 * Style Block Plugin for MD++
 * Handles :::style and :::link-css directives
 *
 * Usage:
 * :::style
 * .my-class { color: red; }
 * :::
 *
 * :::link-css
 * https://example.com/styles.css
 * :::
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { StyleBlockData } from '../types';

export type { StyleBlockData };

// Define VFile type inline to avoid import issues
interface VFileData {
  data: Record<string, unknown>;
}

interface DirectiveNode {
  type: string;
  name: string;
  attributes?: Record<string, string>;
  children?: Array<{ type: string; value?: string }>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

let styleBlockCounter = 0;

/**
 * Generate unique ID for style blocks
 */
function generateStyleId(): string {
  return `mdpp-style-${++styleBlockCounter}`;
}

/**
 * Reset counter (useful for testing)
 */
export function resetStyleBlockCounter(): void {
  styleBlockCounter = 0;
}

/**
 * Create remark plugin for style blocks
 */
export const remarkStyleBlock: Plugin = () => {
  return (tree, file: VFileData) => {
    const styles: StyleBlockData[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    visit(tree, (node: any) => {
      // Handle containerDirective nodes
      if (node.type !== 'containerDirective') return;

      const name = node.name?.toLowerCase() || '';

      // :::style - Inline CSS
      if (name === 'style') {
        const id = node.attributes?.id || generateStyleId();
        const scoped = node.attributes?.scoped !== undefined;

        // Extract CSS content from children
        let cssContent = '';
        if (node.children) {
          for (const child of node.children) {
            if (child.type === 'paragraph' || child.type === 'text') {
              // Get text content
              if ('value' in child && child.value) {
                cssContent += child.value + '\n';
              } else if ('children' in child) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const children = (child as any).children;
                if (Array.isArray(children)) {
                  for (const textNode of children) {
                    if (textNode.type === 'text' && textNode.value) {
                      cssContent += textNode.value + '\n';
                    }
                  }
                }
              }
            }
          }
        }

        // Store style data
        styles.push({
          id,
          type: 'inline',
          content: cssContent.trim(),
          scoped,
        });

        // Convert to HTML style element
        node.data = node.data || {};
        node.data.hName = 'style';
        node.data.hProperties = {
          id,
          ...(scoped ? { scoped: true } : {}),
        };

        // Replace children with raw CSS
        node.children = [{
          type: 'text',
          value: cssContent.trim(),
        }];

        return;
      }

      // :::link-css - External CSS
      if (name === 'link-css' || name === 'linkcss' || name === 'css-link') {
        const id = node.attributes?.id || generateStyleId();

        // Extract URL from children
        let cssUrl = '';
        if (node.children) {
          for (const child of node.children) {
            if ('value' in child && child.value) {
              cssUrl = child.value.trim();
              break;
            } else if ('children' in child) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const children = (child as any).children;
              if (Array.isArray(children)) {
                for (const textNode of children) {
                  if (textNode.type === 'text' && textNode.value) {
                    cssUrl = textNode.value.trim();
                    break;
                  }
                }
              }
              if (cssUrl) break;
            }
          }
        }

        // Also check attributes for url
        if (!cssUrl && node.attributes?.url) {
          cssUrl = node.attributes.url;
        }
        if (!cssUrl && node.attributes?.href) {
          cssUrl = node.attributes.href;
        }

        if (cssUrl) {
          // Store style data
          styles.push({
            id,
            type: 'external',
            content: cssUrl,
          });

          // Convert to HTML link element
          node.data = node.data || {};
          node.data.hName = 'link';
          node.data.hProperties = {
            id,
            rel: 'stylesheet',
            href: cssUrl,
          };

          // Clear children (link is self-closing)
          node.children = [];
        }

        return;
      }
    });

    // Store styles in file data for extraction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (file.data as any).styles = styles;
  };
};

/**
 * Extract style blocks from processed file
 */
export function extractStylesFromFile(file: VFileData): StyleBlockData[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((file.data as any)?.styles as StyleBlockData[]) || [];
}

/**
 * Export default plugin
 */
export default remarkStyleBlock;
