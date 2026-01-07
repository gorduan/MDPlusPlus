/**
 * MD++ Plugin System - Contribution Point Type Definitions
 *
 * Based on VS Code's Contribution Points system:
 * https://code.visualstudio.com/api/references/contribution-points
 *
 * See: docs/concepts/plugin-system-refactoring.md (Sections 5 & 6)
 */

import type { Plugin } from 'unified';

// ============================================
// JSON Schema Type (lightweight, no external dependency)
// ============================================

/**
 * Simplified JSON Schema type for contribution validation
 * A full implementation would use @types/json-schema
 */
export interface JSONSchemaDefinition {
  $schema?: string;
  $id?: string;
  type?: string | string[];
  properties?: Record<string, JSONSchemaDefinition>;
  required?: string[];
  items?: JSONSchemaDefinition | JSONSchemaDefinition[];
  additionalProperties?: boolean | JSONSchemaDefinition;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  description?: string;
  title?: string;
  [key: string]: unknown;
}

// ============================================
// Contribution Handler Interface
// ============================================

/**
 * Generic handler for processing plugin contributions
 * Each contribution point type has its own handler implementation
 *
 * @template T - The contribution data type this handler processes
 */
export interface ContributionHandler<T> {
  /**
   * Register a contribution from a plugin
   * @param pluginId - Unique identifier of the contributing plugin
   * @param contribution - The contribution data
   */
  register(pluginId: string, contribution: T): void;

  /**
   * Unregister all contributions from a plugin
   * @param pluginId - Unique identifier of the plugin to unregister
   */
  unregister(pluginId: string): void;

  /**
   * Get all registered contributions grouped by plugin ID
   * @returns Map of plugin IDs to their contributions
   */
  getAll(): Map<string, T[]>;
}

// ============================================
// Contribution Point Definition
// ============================================

/**
 * Definition of a contribution point in the registry
 * Contribution points are extension points where plugins can add functionality
 *
 * @template T - The contribution data type for this point
 */
export interface ContributionPoint<T> {
  /** Unique identifier for this contribution point */
  id: string;

  /** JSON Schema for validating contributions */
  schema: JSONSchemaDefinition;

  /** Handler that processes contributions for this point */
  handler: ContributionHandler<T>;
}

// ============================================
// Parser Contribution
// ============================================

/**
 * Contribution for parser pipeline integration
 * Allows plugins to add remark/rehype plugins and code block handlers
 */
export interface ParserContribution {
  /** Path to parser entry file (relative to plugin folder) */
  entry?: string;

  /** Which phase(s) the parser operates in */
  phase: 'remark' | 'rehype' | 'both';

  /** Priority (higher = runs earlier, default: 100) */
  priority?: number;

  /** Code block languages this plugin handles (e.g., ["mermaid", "chart"]) */
  codeBlockLanguages?: string[];

  /** Path to code block handler file (relative to plugin folder) */
  codeBlockHandler?: string;
}

/**
 * Result of loading parser plugins from a contribution
 */
export interface ParserContributionPlugins {
  /** Remark plugins to add to the pipeline */
  remarkPlugins?: Array<Plugin | [Plugin, unknown]>;

  /** Rehype plugins to add to the pipeline */
  rehypePlugins?: Array<Plugin | [Plugin, unknown]>;
}

/**
 * Code block handler function signature
 */
export type CodeBlockHandler = (
  language: string,
  code: string,
  meta?: string
) => string | null;

// ============================================
// Toolbar Contribution
// ============================================

/**
 * A single toolbar item contribution
 */
export interface ToolbarItemContribution {
  /** Unique identifier for this toolbar item */
  id: string;

  /** Command to execute when clicked (from editor.commands) */
  command: string;

  /** Toolbar group this item belongs to (e.g., "insert", "format", "callout") */
  group: string;

  /** Priority within the group (higher = appears earlier) */
  priority?: number;

  /** Path to icon file (relative to plugin folder) or icon component name */
  icon?: string;

  /** Display label for the button */
  label: string;

  /** Tooltip text shown on hover */
  tooltip?: string;

  /** Keyboard shortcut display string (e.g., "Ctrl+Shift+M") */
  shortcut?: string;

  /** Condition when the item should be visible (e.g., "editorTextFocus") */
  when?: string;
}

/**
 * A toolbar group definition
 */
export interface ToolbarGroupContribution {
  /** Unique identifier for this group */
  id: string;

  /** Display label for the group */
  label: string;

  /** Priority for group ordering (higher = appears earlier) */
  priority?: number;
}

/**
 * Complete toolbar contribution from a plugin
 */
export interface ToolbarContribution {
  /** Toolbar items to add */
  items?: ToolbarItemContribution[];

  /** Toolbar groups to register */
  groups?: ToolbarGroupContribution[];
}

// ============================================
// Editor Contribution
// ============================================

/**
 * Editor command definition
 */
export interface EditorCommandContribution {
  /** Command identifier (used by toolbar items) */
  id: string;

  /** Human-readable title for the command */
  title: string;

  /** Category for command palette grouping */
  category?: string;
}

/**
 * Monaco language definition
 */
export interface EditorLanguageContribution {
  /** Language identifier */
  id: string;

  /** File extensions associated with this language */
  extensions?: string[];

  /** Alternative names for the language */
  aliases?: string[];

  /** Path to language configuration file (relative to plugin folder) */
  configuration?: string;
}

/**
 * Monaco embedded language configuration
 */
export interface EmbeddedLanguageConfig {
  /** Whether this language can be embedded in Markdown */
  inMarkdown?: boolean;

  /** Code fence info strings that trigger this language */
  fenceInfo?: string[];
}

/**
 * Full Monaco language contribution with tokenization
 */
export interface MonacoLanguageContribution extends EditorLanguageContribution {
  /** Monarch tokenizer definition */
  monarchTokensProvider?: MonarchTokensProvider;

  /** Configuration for embedding in Markdown */
  embeddedLanguages?: EmbeddedLanguageConfig;
}

/**
 * Monarch tokenizer definition (simplified)
 * See: https://microsoft.github.io/monaco-editor/monarch.html
 */
export interface MonarchTokensProvider {
  /** Default token type */
  defaultToken?: string;

  /** Keywords for highlighting */
  keywords?: string[];

  /** Type keywords */
  typeKeywords?: string[];

  /** Operators */
  operators?: string[];

  /** Symbols for operator detection */
  symbols?: RegExp;

  /** Tokenizer rules */
  tokenizer: {
    root: Array<MonarchTokenizerRule>;
    [state: string]: Array<MonarchTokenizerRule>;
  };
}

/**
 * A single tokenizer rule
 */
export type MonarchTokenizerRule =
  | [RegExp | string, string]
  | [RegExp | string, string, string]
  | [RegExp | string, { cases: Record<string, string> }];

/**
 * TipTap extension contribution
 */
export interface EditorExtensionContribution {
  /** Extension name (unique identifier) */
  name: string;

  /** Type of extension */
  type: 'node' | 'mark' | 'extension';

  /** Module path for the extension (relative to plugin/editor folder) */
  module?: string;

  /** NodeView component path for nodes with custom React views */
  nodeView?: string;

  /** Extension priority (higher = loaded later) */
  priority?: number;
}

/**
 * Complete editor contribution from a plugin
 */
export interface EditorContribution {
  /** Path to TipTap extension file (relative to plugin folder) */
  extension?: string;

  /** Path to NodeView component file (relative to plugin folder) */
  nodeView?: string;

  /** TipTap extensions contributed by this plugin */
  extensions?: EditorExtensionContribution[];

  /** Commands this plugin provides */
  commands?: EditorCommandContribution[];

  /** Monaco languages this plugin provides */
  languages?: EditorLanguageContribution[];
}

// ============================================
// Preview Contribution
// ============================================

/**
 * Preview context provided to renderers
 */
export interface PreviewContext {
  /** Current theme ('light' or 'dark') */
  theme: 'light' | 'dark';

  /** Get list of enabled plugin IDs */
  getEnabledPlugins(): string[];

  /** Get settings for a specific plugin */
  getPluginSettings(pluginId: string): Record<string, unknown>;
}

/**
 * Preview renderer interface
 * Plugins implement this to post-process rendered HTML in the preview pane
 */
export interface PreviewRenderer {
  /** CSS selectors to match elements this renderer handles */
  selectors: string[];

  /** Priority (higher = runs earlier, default: 100) */
  priority?: number;

  /**
   * Render/process the matched elements
   * @param elements - DOM elements matching the selectors
   * @param context - Preview context with theme and settings
   */
  render(elements: Element[], context: PreviewContext): void | Promise<void>;

  /**
   * Reset elements to their original state (called when plugin is disabled)
   * @param elements - DOM elements to reset
   */
  reset?(elements: Element[]): void;
}

/**
 * Complete preview contribution from a plugin
 */
export interface PreviewContribution {
  /** Path to renderer file (relative to plugin folder) */
  renderer?: string;

  /** CSS files to load for preview (relative to plugin folder) */
  styles?: string[];

  /** CSS selectors that trigger this plugin's rendering */
  selectors?: string[];
}

// ============================================
// Export Contribution
// ============================================

/**
 * Export assets bundle (computed for a specific export)
 */
export interface ExportBundle {
  /** External CSS URLs to include */
  cssLinks: string[];

  /** External JavaScript URLs to include */
  jsLinks: string[];

  /** Inline CSS styles to embed */
  inlineStyles: string[];

  /** Initialization scripts to run after DOMContentLoaded */
  initScripts: string[];
}

/**
 * Export assets definition
 * Specifies what resources are needed when exporting to HTML/PDF
 */
export interface ExportAssets {
  /** External CSS URLs */
  css?: string[];

  /** External JavaScript URLs */
  js?: string[];

  /**
   * Function that generates initialization script
   * @param settings - Plugin settings
   * @param theme - Export theme
   * @returns JavaScript code string
   */
  initScript?: (settings: Record<string, unknown>, theme: string) => string;

  /** Inline CSS to embed in the document */
  inlineStyles?: string;

  /**
   * Check if this plugin's assets are needed for the given content
   * @param html - The HTML content being exported
   * @returns true if assets should be included
   */
  isNeeded?: (html: string) => boolean;
}

/**
 * Complete export contribution from a plugin
 */
export interface ExportContribution {
  /** Path to assets definition file (relative to plugin folder) */
  assets?: string;

  /** CSS files to include in export (relative to plugin folder) */
  styles?: string[];
}

// ============================================
// Sidebar Contribution
// ============================================

/**
 * An insert template for the sidebar
 */
export interface SidebarInsertTemplate {
  /** Unique identifier for this template */
  id: string;

  /** Display label */
  label: string;

  /** Category for grouping (e.g., "diagrams", "callouts") */
  category: string;

  /** The Markdown/content to insert */
  template: string;

  /** Optional description shown in UI */
  description?: string;

  /** Optional icon for the template */
  icon?: string;
}

/**
 * Complete sidebar contribution from a plugin
 */
export interface SidebarContribution {
  /** Insert templates to add to the sidebar */
  insertTemplates?: SidebarInsertTemplate[];
}

// ============================================
// Keybinding Contribution
// ============================================

/**
 * A keyboard shortcut binding
 */
export interface KeybindingContribution {
  /** Command to execute (from editor.commands) */
  command: string;

  /** Key combination (e.g., "ctrl+shift+m") */
  key: string;

  /** macOS-specific key combination (e.g., "cmd+shift+m") */
  mac?: string;

  /** Linux-specific key combination */
  linux?: string;

  /** Windows-specific key combination */
  win?: string;

  /** Condition when the keybinding is active (e.g., "editorTextFocus") */
  when?: string;

  /** Optional arguments to pass to the command */
  args?: unknown;
}

// ============================================
// Help Contribution
// ============================================

/**
 * A help/documentation entry
 */
export interface HelpEntry {
  /** Title of the help entry */
  title: string;

  /** Short description */
  description?: string;

  /** Example syntax or usage */
  syntax?: string;

  /** External documentation URL */
  link?: string;

  /** Category for grouping */
  category?: string;

  /** Keywords for search */
  keywords?: string[];
}

/**
 * Complete help contribution from a plugin
 */
export interface HelpContribution {
  /** Help entries to add to the help dialog */
  entries?: HelpEntry[];
}

// ============================================
// Combined Contributions Object
// ============================================

/**
 * All contributions a plugin can make
 * This is the shape of the "contributes" field in plugin.json
 */
export interface PluginContributions {
  /** Parser pipeline integration */
  parser?: ParserContribution;

  /** Editor extensions (TipTap + Monaco) */
  editor?: EditorContribution;

  /** Toolbar buttons and groups */
  toolbar?: ToolbarContribution;

  /** Preview rendering */
  preview?: PreviewContribution;

  /** Export assets */
  export?: ExportContribution;

  /** Sidebar templates */
  sidebar?: SidebarContribution;

  /** Keyboard shortcuts */
  keybindings?: KeybindingContribution[];

  /** Help documentation */
  help?: HelpContribution;
}

// ============================================
// Contribution Point IDs
// ============================================

/**
 * Standard contribution point identifiers
 */
export type ContributionPointId =
  | 'parser'
  | 'editor'
  | 'toolbar'
  | 'preview'
  | 'export'
  | 'sidebar'
  | 'keybindings'
  | 'help';

/**
 * Map of contribution point IDs to their contribution types
 */
export interface ContributionTypeMap {
  parser: ParserContribution;
  editor: EditorContribution;
  toolbar: ToolbarContribution;
  preview: PreviewContribution;
  export: ExportContribution;
  sidebar: SidebarContribution;
  keybindings: KeybindingContribution[];
  help: HelpContribution;
}

// ============================================
// Registered Contributions
// ============================================

/**
 * A registered toolbar item (includes plugin ID prefix)
 */
export interface RegisteredToolbarItem extends ToolbarItemContribution {
  /** Full ID including plugin prefix (e.g., "mermaid:insert-diagram") */
  fullId: string;

  /** Plugin that contributed this item */
  pluginId: string;

  /** Resolved icon (loaded from file or component) */
  resolvedIcon?: React.ComponentType | string;
}

/**
 * A registered keybinding (includes plugin source)
 */
export interface RegisteredKeybinding extends KeybindingContribution {
  /** Plugin that contributed this keybinding */
  pluginId: string;
}

/**
 * A registered help entry (includes plugin source)
 */
export interface RegisteredHelpEntry extends HelpEntry {
  /** Plugin that contributed this entry */
  pluginId: string;
}
