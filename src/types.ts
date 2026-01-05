/**
 * MD++ Type Definitions
 */

// ============================================
// File Format Types
// ============================================

/**
 * Supported file formats in MD++
 *
 * - 'md': Standard Markdown - basic markdown parsing only
 * - 'mdplus': MD++ Enhanced - markdown + plugins (mermaid, math, components, AI placeholders)
 * - 'mdsc': MarkdownScript - full power: scripts, SCSS, dynamic content
 */
export type FileFormat = 'md' | 'mdplus' | 'mdsc';

/**
 * File format capabilities
 */
export interface FormatCapabilities {
  /** Standard markdown features (headings, lists, code, etc.) */
  markdown: boolean;
  /** GitHub Flavored Markdown (tables, task lists, strikethrough) */
  gfm: boolean;
  /** Math/LaTeX support */
  math: boolean;
  /** Mermaid diagrams */
  mermaid: boolean;
  /** Component directives (:::card, :::alert, etc.) */
  components: boolean;
  /** Callouts/Admonitions (> [!NOTE]) */
  callouts: boolean;
  /** AI Context blocks (:::ai-context) */
  aiContext: boolean;
  /** AI Placeholders (:::ai-generate, :ai{}) */
  aiPlaceholders: boolean;
  /** JavaScript execution (:::script) */
  scripts: boolean;
  /** SCSS/CSS blocks (:::style) */
  styles: boolean;
  /** Variable interpolation ({{var}}) */
  variables: boolean;
}

/**
 * Default capabilities for each format
 */
export const FORMAT_CAPABILITIES: Record<FileFormat, FormatCapabilities> = {
  // Standard Markdown - minimal features
  md: {
    markdown: true,
    gfm: true,
    math: false,
    mermaid: false,
    components: false,
    callouts: false,
    aiContext: false,
    aiPlaceholders: false,
    scripts: false,
    styles: false,
    variables: false,
  },
  // MD++ Enhanced - markdown + plugins
  mdplus: {
    markdown: true,
    gfm: true,
    math: true,
    mermaid: true,
    components: true,
    callouts: true,
    aiContext: true,
    aiPlaceholders: true,
    scripts: false,      // No JS execution
    styles: false,       // No SCSS
    variables: false,    // No variable interpolation
  },
  // MarkdownScript - full power
  mdsc: {
    markdown: true,
    gfm: true,
    math: true,
    mermaid: true,
    components: true,
    callouts: true,
    aiContext: true,
    aiPlaceholders: true,
    scripts: true,       // JavaScript execution
    styles: true,        // SCSS/CSS support
    variables: true,     // Variable interpolation
  },
};

/**
 * Detect file format from filename or extension
 */
export function detectFileFormat(filename: string): FileFormat {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'mdsc':
      return 'mdsc';
    case 'mdpp':
    case 'mdplus':
      return 'mdplus';
    case 'md':
    case 'markdown':
    default:
      return 'md';
  }
}

/**
 * Get capabilities for a file format
 */
export function getFormatCapabilities(format: FileFormat): FormatCapabilities {
  return FORMAT_CAPABILITIES[format];
}

/**
 * Check if a feature is available in a format
 */
export function hasCapability(format: FileFormat, capability: keyof FormatCapabilities): boolean {
  return FORMAT_CAPABILITIES[format][capability];
}

// ============================================
// Style Block Types (for .mdsc)
// ============================================

/**
 * Style block data extracted from parsed markdown
 */
export interface StyleBlockData {
  /** Unique identifier for this style block */
  id: string;
  /** The CSS/SCSS code */
  code: string;
  /** Style language: 'css' or 'scss' */
  lang: 'css' | 'scss';
  /** Scope: 'global' applies to whole document, 'scoped' only to following content */
  scope: 'global' | 'scoped';
  /** Line number in source document */
  line?: number;
}

/**
 * Compiled style result
 */
export interface StyleCompileResult {
  /** Style block ID */
  id: string;
  /** Whether compilation succeeded */
  success: boolean;
  /** Compiled CSS output */
  css?: string;
  /** Error message if failed */
  error?: string;
}

// ============================================
// Plugin Types
// ============================================

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
  /** Initialization script (e.g., mermaid.initialize()) */
  init?: string;
  /** Code block languages this plugin handles (e.g., ['mermaid']) */
  codeBlockLanguages?: string[];
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

  // Feature toggles
  /** Enable GitHub Flavored Markdown (tables, task lists, strikethrough, autolinks) */
  enableGfm?: boolean;
  /** Enable Math/LaTeX support */
  enableMath?: boolean;
  /** Enable callouts/admonitions (> [!NOTE]) */
  enableCallouts?: boolean;
  /** Enable heading anchors and slugs */
  enableHeadingAnchors?: boolean;
  /** Enable component directives (:::plugin:component) */
  enableDirectives?: boolean;
  /** Enable AI context blocks */
  enableAIContext?: boolean;
  /** Enable MarkdownScript blocks (:::script) */
  enableScripts?: boolean;
}

// ============================================
// MarkdownScript (.mdsc) Types
// ============================================

/**
 * Script execution mode
 */
export type ScriptMode = 'execute' | 'output';

/**
 * Script security level
 */
export type ScriptSecurityLevel = 'strict' | 'standard' | 'permissive';

/**
 * Script block data extracted from parsed markdown
 */
export interface ScriptBlockData {
  /** Unique identifier for this script block */
  id: string;
  /** The JavaScript code to execute */
  code: string;
  /** Execution mode: 'execute' for side effects, 'output' for rendered content */
  mode: ScriptMode;
  /** Script language (currently only 'js') */
  lang: 'js';
  /** Allow async/await in script */
  async: boolean;
  /** Cache execution result */
  cache: boolean;
  /** Line number in source document */
  line?: number;
}

/**
 * Script execution error
 */
export interface ScriptError {
  /** Error message */
  message: string;
  /** Stack trace */
  stack?: string;
  /** Line number within script */
  line?: number;
  /** Column number within script */
  column?: number;
}

/**
 * Result of script execution
 */
export interface ScriptExecutionResult {
  /** Script block ID */
  id: string;
  /** Whether execution succeeded */
  success: boolean;
  /** Output for 'output' mode scripts (rendered as markdown) */
  output?: string;
  /** Error information if execution failed */
  error?: ScriptError;
  /** Execution duration in milliseconds */
  duration: number;
  /** Whether result was served from cache */
  cached: boolean;
}

/**
 * Console log entry captured from script
 */
export interface ScriptLogEntry {
  /** Log level */
  level: 'log' | 'warn' | 'error' | 'info';
  /** Log arguments */
  args: unknown[];
  /** Timestamp */
  timestamp: number;
}

/**
 * Built-in APIs available to scripts
 */
export interface ScriptAPI {
  /** Document metadata */
  document: {
    /** Document title (from frontmatter or first heading) */
    title: string;
    /** File path */
    path: string;
    /** Frontmatter data */
    frontmatter: Record<string, unknown>;
  };
  /** Utility functions */
  utils: {
    /** Format a date */
    formatDate: (date: Date, format?: string) => string;
    /** Parse inline markdown to HTML */
    markdown: (md: string) => string;
    /** Escape HTML entities */
    html: (str: string) => string;
    /** Create a markdown table */
    table: (headers: string[], rows: string[][]) => string;
  };
  /** Console (output captured) */
  console: {
    log: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
  };
}

/**
 * Extended render result with script data
 */
export interface ScriptRenderResult extends RenderResult {
  /** Extracted script blocks for execution */
  scripts: ScriptBlockData[];
}

// ============================================
// AI Placeholder Types
// ============================================

/**
 * AI Placeholder output format
 */
export type AIPlaceholderFormat = 'paragraph' | 'list' | 'table' | 'inline';

/**
 * AI Placeholder status for workflow tracking
 */
export type AIPlaceholderStatus = 'pending' | 'generating' | 'completed' | 'error';

/**
 * AI Placeholder data extracted from parsed markdown
 */
export interface AIPlaceholderData {
  /** Unique identifier for this placeholder */
  id: string;
  /** Type of placeholder: 'inline' for :ai{}, 'block' for :::ai-generate */
  type: 'inline' | 'block';
  /** The prompt/instruction for the AI */
  prompt: string;
  /** Desired output format */
  format: AIPlaceholderFormat;
  /** Fallback text if AI is unavailable */
  fallback?: string;
  /** Current status */
  status: AIPlaceholderStatus;
  /** Variables from context (e.g., from :::script blocks) */
  variables?: Record<string, unknown>;
  /** Line number in source document */
  line?: number;
  /** Column number in source document */
  column?: number;
}

/**
 * Result of AI placeholder processing
 */
export interface AIPlaceholderResult {
  /** Placeholder ID */
  id: string;
  /** Whether generation succeeded */
  success: boolean;
  /** Generated content (as markdown) */
  content?: string;
  /** Error message if failed */
  error?: string;
  /** Processing duration in milliseconds */
  duration?: number;
  /** Model used for generation */
  model?: string;
}

/**
 * AI Agent interface for filling placeholders
 */
export interface AIAgent {
  /** Generate content for a placeholder */
  generate(placeholder: AIPlaceholderData, context?: AIAgentContext): Promise<AIPlaceholderResult>;
  /** Check if agent is available */
  isAvailable(): Promise<boolean>;
  /** Agent name/identifier */
  name: string;
}

/**
 * Context passed to AI agent for generation
 */
export interface AIAgentContext {
  /** Document title */
  title?: string;
  /** Document path */
  path?: string;
  /** Frontmatter data */
  frontmatter?: Record<string, unknown>;
  /** AI context blocks from document */
  aiContexts?: AIContext[];
  /** Variables from script execution */
  variables?: Record<string, unknown>;
  /** Full document content (for reference) */
  documentContent?: string;
}

/**
 * Extended render result with AI placeholders
 */
export interface AIPlaceholderRenderResult extends RenderResult {
  /** Extracted AI placeholders for processing */
  placeholders: AIPlaceholderData[];
}

/**
 * Combined render result with scripts and AI placeholders
 */
export interface FullRenderResult extends RenderResult {
  /** Extracted script blocks for execution */
  scripts: ScriptBlockData[];
  /** Extracted AI placeholders for processing */
  placeholders: AIPlaceholderData[];
  /** Extracted style blocks (for .mdsc) */
  styles?: StyleBlockData[];
  /** Detected file format */
  format: FileFormat;
}
