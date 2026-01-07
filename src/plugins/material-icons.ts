/**
 * Material Icons Plugin for MD++
 * Transforms ![icon](google:icon-name) syntax to Material Icons spans
 *
 * Usage:
 * ![icon](google:home)                    - Basic icon
 * ![icon](google:home){.large}            - Large icon
 * ![icon](google:home){.text-primary}     - Colored icon
 * ![icon](google:search){.outlined}       - Outlined variant
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

// Define our own types to avoid dependency on @types/mdast
interface ImageNode {
  type: 'image';
  url: string;
  alt?: string | null;
  title?: string | null;
}

interface ParentNode {
  type: string;
  children: unknown[];
}

// Icon size mappings
const ICON_SIZES: Record<string, string> = {
  'small': 'font-size: 18px;',
  'md-18': 'font-size: 18px;',
  'medium': 'font-size: 24px;',
  'md-24': 'font-size: 24px;',
  'large': 'font-size: 36px;',
  'md-36': 'font-size: 36px;',
  'x-large': 'font-size: 48px;',
  'md-48': 'font-size: 48px;',
};

// Icon variants
const ICON_VARIANTS: Record<string, string> = {
  'outlined': 'material-icons-outlined',
  'round': 'material-icons-round',
  'sharp': 'material-icons-sharp',
  'two-tone': 'material-icons-two-tone',
  'filled': 'material-icons',
};

interface MaterialIconNode {
  type: 'html';
  value: string;
}

/**
 * Check if a URL is a Material Icons reference
 */
function isMaterialIconUrl(url: string): boolean {
  return url.startsWith('google:') || url.startsWith('material:') || url.startsWith('md:');
}

/**
 * Extract icon name from URL
 */
function extractIconName(url: string): string {
  // Remove prefix (google:, material:, md:)
  return url.replace(/^(google|material|md):/, '').trim();
}

/**
 * Parse classes from image alt or title
 */
function parseIconClasses(alt: string, title?: string | null): { classes: string[], styles: string[] } {
  const classes: string[] = [];
  const styles: string[] = [];

  // Check alt text for class hints
  const altClasses = alt.match(/\{([^}]+)\}/);
  if (altClasses) {
    const classStr = altClasses[1];
    classStr.split(/\s+/).forEach(cls => {
      const cleanClass = cls.replace(/^\./, '');
      if (ICON_SIZES[cleanClass]) {
        styles.push(ICON_SIZES[cleanClass]);
      } else if (ICON_VARIANTS[cleanClass]) {
        classes.push(ICON_VARIANTS[cleanClass]);
      } else {
        classes.push(cleanClass);
      }
    });
  }

  // Check title for additional classes
  if (title) {
    title.split(/\s+/).forEach(cls => {
      const cleanClass = cls.replace(/^\./, '');
      if (ICON_SIZES[cleanClass]) {
        styles.push(ICON_SIZES[cleanClass]);
      } else if (ICON_VARIANTS[cleanClass]) {
        classes.push(ICON_VARIANTS[cleanClass]);
      } else {
        classes.push(cleanClass);
      }
    });
  }

  return { classes, styles };
}

/**
 * Create Material Icons remark plugin
 */
export const remarkMaterialIcons: Plugin = () => {
  return (tree) => {
    visit(tree, 'image', (node: ImageNode, index: number | undefined, parent: ParentNode | undefined) => {
      if (!isMaterialIconUrl(node.url)) {
        return;
      }

      const iconName = extractIconName(node.url);
      const { classes, styles } = parseIconClasses(node.alt || '', node.title);

      // Determine base class (variant or default)
      let baseClass = 'material-icons';
      const variantClass = classes.find(c => c.startsWith('material-icons-'));
      if (variantClass) {
        baseClass = variantClass;
        classes.splice(classes.indexOf(variantClass), 1);
      }

      // Build class string
      const allClasses = [baseClass, 'mdpp-icon', ...classes].filter(Boolean).join(' ');

      // Build style string
      const styleStr = styles.length > 0 ? ` style="${styles.join(' ')}"` : '';

      // Create HTML node
      const htmlNode: MaterialIconNode = {
        type: 'html',
        value: `<span class="${allClasses}"${styleStr}>${iconName}</span>`,
      };

      // Replace the image node with HTML
      if (parent && typeof index === 'number') {
        (parent.children as unknown[])[index] = htmlNode;
      }
    });
  };
};

/**
 * Export default plugin
 */
export default remarkMaterialIcons;
