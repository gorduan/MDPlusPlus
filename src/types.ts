/**
 * MD++ Type Definitions
 */

/**
 * Plugin definition for a CSS framework
 */
export interface PluginDefinition {
  framework: string;
  version: string;
  author?: string;
  description?: string;
  components: Record<string, ComponentDefinition>;
}

/**
 * Component definition within a plugin
 */
export interface ComponentDefinition {
  tag: string;
  classes: string[];
  allowNesting?: boolean;
  structure?: Record<string, StructureDefinition>;
  variants?: Record<string, string[]>;
  hidden?: boolean;
  aiVisible?: boolean;
}

/**
 * Structure definition for nested elements
 */
export interface StructureDefinition {
  tag: string;
  classes: string[];
  titleTag?: string;
  contentTag?: string;
}

/**
 * Parsed directive node
 */
export interface DirectiveNode {
  type: 'containerDirective' | 'leafDirective' | 'textDirective';
  name: string;
  framework?: string;
  component?: string;
  title?: string;
  attributes: Record<string, string>;
  classes: string[];
  id?: string;
  children: DirectiveNode[];
  content?: string;
}

/**
 * Extracted AI context block
 */
export interface AIContext {
  visible: boolean;
  content: string;
  metadata?: Record<string, string>;
  line?: number;
}

/**
 * Result of markdown conversion
 */
export interface RenderResult {
  html: string;
  aiContexts: AIContext[];
  frontmatter?: Record<string, unknown>;
  errors: RenderError[];
}

/**
 * Rendering error
 */
export interface RenderError {
  type: 'missing-plugin' | 'unknown-component' | 'invalid-syntax' | 'nesting-error';
  message: string;
  line?: number;
  column?: number;
}

/**
 * Parser options
 */
export interface ParserOptions {
  plugins?: PluginDefinition[];
  showAIContext?: boolean;
  strict?: boolean;
}
