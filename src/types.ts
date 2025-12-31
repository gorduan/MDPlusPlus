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
  /** CSS files to load (CDN URLs) */
  css?: string[];
  /** JS files to load (CDN URLs) */
  js?: string[];
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
  type: 'missing-plugin' | 'unknown-component' | 'invalid-syntax' | 'nesting-error' | 'security-blocked';
  title?: string;
  message: string;
  details?: string;
  line?: number;
  column?: number;
}

/**
 * Security profile for code execution
 */
export type SecurityProfile = 'strict' | 'warn' | 'expert' | 'custom';

/**
 * Security configuration
 */
export interface SecurityConfig {
  profile: SecurityProfile;
  /** Allow parser-time code execution */
  allowParserCode?: boolean;
  /** Allow HTML-embedded code execution */
  allowHTMLCode?: boolean;
  /** Show warnings for code blocks */
  warnOnCode?: boolean;
  /** Whitelisted sources */
  trustedSources?: string[];
  /** Blacklisted sources */
  blockedSources?: string[];
}

/**
 * Parser options
 */
export interface ParserOptions {
  plugins?: PluginDefinition[];
  showAIContext?: boolean;
  strict?: boolean;
  /** Security configuration */
  security?: SecurityConfig;
  /** Suppress error alerts in output */
  suppressErrors?: boolean;
  /** Generate CSS/JS link tags for plugins */
  includeAssets?: boolean;
}
