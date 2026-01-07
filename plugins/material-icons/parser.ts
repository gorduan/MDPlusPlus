/**
 * Material Icons Parser Plugin for MD++
 *
 * Transforms ![icon](google:icon-name) syntax to Material Icons spans.
 *
 * Usage:
 * ![icon](google:home)                    - Basic icon
 * ![icon](google:home){.large}            - Large icon
 * ![icon](google:home){.text-primary}     - Colored icon
 * ![icon](google:search){.outlined}       - Outlined variant
 *
 * Supported prefixes: google:, material:, md:
 * Supported variants: filled, outlined, round, sharp, two-tone
 *
 * @see https://fonts.google.com/icons
 */

import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { MDPlusPlusPlugin, PluginContext } from '../../src/plugin-system/types';

/**
 * Plugin settings
 */
interface MaterialIconsSettings {
  /** Default icon style */
  defaultStyle: 'filled' | 'outlined' | 'round' | 'sharp' | 'two-tone';
  /** Default icon size */
  defaultSize: string;
  /** Additional CSS class */
  customClass: string;
}

// Current settings
let currentSettings: MaterialIconsSettings = {
  defaultStyle: 'filled',
  defaultSize: '24px',
  customClass: '',
};

// Icon size mappings
const ICON_SIZES: Record<string, string> = {
  small: 'font-size: 18px;',
  'md-18': 'font-size: 18px;',
  medium: 'font-size: 24px;',
  'md-24': 'font-size: 24px;',
  large: 'font-size: 36px;',
  'md-36': 'font-size: 36px;',
  'x-large': 'font-size: 48px;',
  'md-48': 'font-size: 48px;',
};

// Icon variants
const ICON_VARIANTS: Record<string, string> = {
  outlined: 'material-icons-outlined',
  round: 'material-icons-round',
  sharp: 'material-icons-sharp',
  'two-tone': 'material-icons-two-tone',
  filled: 'material-icons',
};

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
  return url.replace(/^(google|material|md):/, '').trim();
}

/**
 * Parse classes from image alt or title
 */
function parseIconClasses(
  alt: string,
  title?: string | null
): { classes: string[]; styles: string[] } {
  const classes: string[] = [];
  const styles: string[] = [];

  // Check alt text for class hints
  const altClasses = alt.match(/\{([^}]+)\}/);
  if (altClasses) {
    const classStr = altClasses[1];
    classStr.split(/\s+/).forEach((cls) => {
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
    title.split(/\s+/).forEach((cls) => {
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
 * Create remark plugin for Material Icons
 */
function createRemarkMaterialIcons(): Plugin {
  return () => {
    return (tree: any) => {
      visit(tree, 'image', (node: any, index: number | undefined, parent: any) => {
        if (!isMaterialIconUrl(node.url)) {
          return;
        }

        const iconName = extractIconName(node.url);
        const { classes, styles } = parseIconClasses(node.alt || '', node.title);

        // Determine base class (variant or default)
        let baseClass = ICON_VARIANTS[currentSettings.defaultStyle] || 'material-icons';
        const variantClass = classes.find((c) => c.startsWith('material-icons-'));
        if (variantClass) {
          baseClass = variantClass;
          classes.splice(classes.indexOf(variantClass), 1);
        }

        // Build class string
        const allClasses = [
          baseClass,
          'mdpp-icon',
          currentSettings.customClass,
          ...classes,
        ]
          .filter(Boolean)
          .join(' ');

        // Build style string
        const styleStr = styles.length > 0 ? ` style="${styles.join(' ')}"` : '';

        // Replace with HTML node
        if (parent && typeof index === 'number') {
          parent.children[index] = {
            type: 'html',
            value: `<span class="${allClasses}"${styleStr}>${iconName}</span>`,
          };
        }
      });
    };
  };
}

/**
 * Material Icons Plugin
 */
const materialIconsPlugin: MDPlusPlusPlugin = {
  id: 'material-icons',

  /**
   * Remark plugins for icon processing
   */
  remarkPlugins() {
    return [createRemarkMaterialIcons()];
  },

  /**
   * Called when the plugin is activated
   */
  async activate(context: PluginContext): Promise<void> {
    currentSettings = {
      ...currentSettings,
      ...context.settings,
    } as MaterialIconsSettings;

    context.log.info('Material Icons plugin activated');
  },

  /**
   * Called when the plugin is deactivated
   */
  async deactivate(): Promise<void> {
    currentSettings = {
      defaultStyle: 'filled',
      defaultSize: '24px',
      customClass: '',
    };
  },

  /**
   * Called when settings change
   */
  onSettingsChange(settings: Record<string, unknown>): void {
    currentSettings = {
      ...currentSettings,
      ...settings,
    } as MaterialIconsSettings;
  },

  /**
   * Public API for other plugins
   */
  api: {
    /**
     * Get available icon variants
     */
    getVariants(): string[] {
      return Object.keys(ICON_VARIANTS);
    },

    /**
     * Get available size classes
     */
    getSizes(): string[] {
      return Object.keys(ICON_SIZES);
    },

    /**
     * Generate HTML for an icon
     */
    renderIcon(
      name: string,
      variant: string = 'filled',
      size: string = 'medium'
    ): string {
      const baseClass = ICON_VARIANTS[variant] || 'material-icons';
      const sizeStyle = ICON_SIZES[size] || '';
      const styleAttr = sizeStyle ? ` style="${sizeStyle}"` : '';
      return `<span class="${baseClass} mdpp-icon"${styleAttr}>${name}</span>`;
    },

    /**
     * Get current settings
     */
    getSettings(): MaterialIconsSettings {
      return { ...currentSettings };
    },
  },
};

export default materialIconsPlugin;
