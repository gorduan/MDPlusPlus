/**
 * MD++ WYSIWYG Element Template Registry
 *
 * Allows customization of WYSIWYG element rendering.
 * Based on TipTap's headless architecture:
 * https://tiptap.dev/docs/editor/getting-started/style-editor
 *
 * Usage:
 * - Register custom templates for element types
 * - Templates define CSS classes and optional inline styles
 * - TipTap extensions use these templates in renderHTML()
 */

/**
 * Element template definition
 */
export interface ElementTemplate {
  /** Unique template name */
  name: string;

  /** CSS classes to apply to the element */
  classes: string[];

  /** Optional inline styles (use sparingly) */
  styles?: Record<string, string>;

  /** Optional data attributes */
  dataAttributes?: Record<string, string>;

  /** Optional wrapper element configuration */
  wrapper?: {
    tag: string;
    classes: string[];
  };
}

/**
 * Template category for organization
 */
export type TemplateCategory =
  | 'block' // Block-level elements (headings, paragraphs)
  | 'inline' // Inline elements (bold, italic, links)
  | 'container' // Container elements (admonitions, code blocks)
  | 'media' // Media elements (images, videos, diagrams)
  | 'table' // Table elements
  | 'custom'; // Custom plugin elements

/**
 * Registered template with metadata
 */
interface RegisteredTemplate extends ElementTemplate {
  category: TemplateCategory;
  description?: string;
  plugin?: string; // Plugin that registered this template
}

/**
 * Element Template Registry
 *
 * Central registry for WYSIWYG element templates.
 * Plugins can register custom templates that override defaults.
 */
class ElementTemplateRegistry {
  private templates: Map<string, RegisteredTemplate> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Register a new template or override an existing one
   */
  register(
    elementType: string,
    template: ElementTemplate,
    options: {
      category?: TemplateCategory;
      description?: string;
      plugin?: string;
    } = {}
  ): void {
    const registeredTemplate: RegisteredTemplate = {
      ...template,
      category: options.category || 'custom',
      description: options.description,
      plugin: options.plugin,
    };

    this.templates.set(elementType, registeredTemplate);
    this.notifyListeners();
  }

  /**
   * Get a template by element type
   */
  get(elementType: string): RegisteredTemplate | undefined {
    return this.templates.get(elementType);
  }

  /**
   * Check if a template exists
   */
  has(elementType: string): boolean {
    return this.templates.has(elementType);
  }

  /**
   * Remove a template
   */
  unregister(elementType: string): boolean {
    const result = this.templates.delete(elementType);
    if (result) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Get all templates for a category
   */
  getByCategory(category: TemplateCategory): RegisteredTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.category === category
    );
  }

  /**
   * Get all templates registered by a plugin
   */
  getByPlugin(plugin: string): RegisteredTemplate[] {
    return Array.from(this.templates.values()).filter(
      (t) => t.plugin === plugin
    );
  }

  /**
   * Get all registered templates
   */
  getAll(): Map<string, RegisteredTemplate> {
    return new Map(this.templates);
  }

  /**
   * Get CSS classes for an element type
   * Returns empty array if no template exists
   */
  getClasses(elementType: string): string[] {
    const template = this.templates.get(elementType);
    return template?.classes || [];
  }

  /**
   * Get HTML attributes for TipTap's mergeAttributes()
   */
  getHTMLAttributes(elementType: string): Record<string, unknown> {
    const template = this.templates.get(elementType);
    if (!template) {
      return {};
    }

    const attrs: Record<string, unknown> = {};

    if (template.classes.length > 0) {
      attrs.class = template.classes.join(' ');
    }

    if (template.styles && Object.keys(template.styles).length > 0) {
      attrs.style = Object.entries(template.styles)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');
    }

    if (template.dataAttributes) {
      Object.entries(template.dataAttributes).forEach(([key, value]) => {
        attrs[`data-${key}`] = value;
      });
    }

    return attrs;
  }

  /**
   * Subscribe to template changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Clear all templates (useful for testing)
   */
  clear(): void {
    this.templates.clear();
    this.notifyListeners();
  }
}

// Singleton instance
export const templateRegistry = new ElementTemplateRegistry();

/**
 * Register default MD++ element templates
 */
export function registerDefaultTemplates(): void {
  // Block elements
  templateRegistry.register(
    'heading',
    {
      name: 'heading',
      classes: ['mdpp-heading'],
    },
    { category: 'block', description: 'Heading elements (h1-h6)' }
  );

  templateRegistry.register(
    'paragraph',
    {
      name: 'paragraph',
      classes: ['mdpp-paragraph'],
    },
    { category: 'block', description: 'Paragraph element' }
  );

  templateRegistry.register(
    'blockquote',
    {
      name: 'blockquote',
      classes: ['mdpp-blockquote'],
    },
    { category: 'block', description: 'Blockquote element' }
  );

  templateRegistry.register(
    'codeBlock',
    {
      name: 'codeBlock',
      classes: ['mdpp-code-block', 'hljs'],
    },
    { category: 'container', description: 'Code block with syntax highlighting' }
  );

  templateRegistry.register(
    'horizontalRule',
    {
      name: 'horizontalRule',
      classes: ['mdpp-hr'],
    },
    { category: 'block', description: 'Horizontal rule' }
  );

  // Inline elements
  templateRegistry.register(
    'link',
    {
      name: 'link',
      classes: ['mdpp-link'],
    },
    { category: 'inline', description: 'Hyperlink' }
  );

  templateRegistry.register(
    'code',
    {
      name: 'code',
      classes: ['mdpp-inline-code'],
    },
    { category: 'inline', description: 'Inline code' }
  );

  templateRegistry.register(
    'highlight',
    {
      name: 'highlight',
      classes: ['mdpp-highlight'],
    },
    { category: 'inline', description: 'Highlighted text' }
  );

  // Container elements
  templateRegistry.register(
    'admonition',
    {
      name: 'admonition',
      classes: ['admonition'],
      dataAttributes: { type: 'admonition' },
    },
    { category: 'container', description: 'Admonition/Callout block', plugin: 'admonitions' }
  );

  templateRegistry.register(
    'mermaidBlock',
    {
      name: 'mermaidBlock',
      classes: ['mermaid-block'],
      dataAttributes: { type: 'mermaid-block' },
    },
    { category: 'media', description: 'Mermaid diagram', plugin: 'mermaid' }
  );

  templateRegistry.register(
    'frontmatter',
    {
      name: 'frontmatter',
      classes: ['frontmatter-block'],
      dataAttributes: { type: 'frontmatter' },
    },
    { category: 'container', description: 'YAML frontmatter block' }
  );

  templateRegistry.register(
    'aiContext',
    {
      name: 'aiContext',
      classes: ['ai-context-block'],
      dataAttributes: { type: 'ai-context' },
    },
    { category: 'container', description: 'AI context block', plugin: 'ai-context' }
  );

  // Media elements
  templateRegistry.register(
    'image',
    {
      name: 'image',
      classes: ['mdpp-image'],
    },
    { category: 'media', description: 'Image element' }
  );

  // Table elements
  templateRegistry.register(
    'table',
    {
      name: 'table',
      classes: ['mdpp-table'],
    },
    { category: 'table', description: 'Table element' }
  );

  templateRegistry.register(
    'tableHeader',
    {
      name: 'tableHeader',
      classes: ['mdpp-table-header'],
    },
    { category: 'table', description: 'Table header cell' }
  );

  templateRegistry.register(
    'tableCell',
    {
      name: 'tableCell',
      classes: ['mdpp-table-cell'],
    },
    { category: 'table', description: 'Table cell' }
  );
}

// Auto-register defaults on import
registerDefaultTemplates();

export default templateRegistry;
