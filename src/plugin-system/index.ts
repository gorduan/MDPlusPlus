/**
 * MD++ Plugin System
 *
 * Central module for plugin management in MD++.
 * Provides True Plugin Isolation - delete a plugin folder, zero errors.
 *
 * @example
 * ```typescript
 * import { createPluginRegistry, createPluginLoader, getContributionRegistry } from './plugin-system';
 *
 * const registry = createPluginRegistry();
 * const loader = createPluginLoader(registry);
 * const contributions = getContributionRegistry();
 *
 * // Load plugin and process contributions
 * loader.loadFromLegacyJSON(bootstrapPlugin);
 * contributions.processPluginContributions('bootstrap', plugin.contributes);
 *
 * // Activate plugins
 * await registry.activate('bootstrap');
 * ```
 */

// ============================================
// Core Plugin Types
// ============================================

export type {
  // Core types
  PluginType,
  ParserPhase,
  PluginStatus,
  PluginManifest,
  PluginDependencies,
  ParserConfig,
  AssetConfig,
  SettingsConfig,
  LifecycleConfig,
  ComponentDefinition,
  StructureDefinition,

  // Runtime types
  PluginContext,
  MDPlusPlusPlugin,
  RegisteredPlugin,
  PluginLoadResult,
  DependencyResolutionResult,

  // Event types
  PluginEventType,
  PluginEvent,
  PluginEventListener,

  // Legacy compatibility
  LegacyPluginDefinition,
} from './types';

// Functions
export { convertLegacyPlugin } from './types';

// ============================================
// Contribution Point Types
// ============================================

export type {
  // Contribution Types
  PluginContributions,
  ParserContribution,
  EditorContribution,
  ToolbarContribution,
  ToolbarItemContribution,
  ToolbarGroupContribution,
  PreviewContribution,
  PreviewRenderer,
  PreviewContext,
  ExportContribution,
  ExportAssets,
  ExportBundle,
  SidebarContribution,
  SidebarInsertTemplate,
  KeybindingContribution,
  HelpContribution,
  HelpEntry,
  // Handler Types
  ContributionHandler,
  ContributionPoint,
  ContributionPointId,
  ContributionTypeMap,
  // Monaco Types
  EditorLanguageContribution,
  MonacoLanguageContribution,
  MonarchTokensProvider,
  EditorCommandContribution,
  EmbeddedLanguageConfig,
  // Registered Types
  RegisteredToolbarItem,
  RegisteredKeybinding,
  RegisteredHelpEntry,
  // Misc
  JSONSchemaDefinition,
  CodeBlockHandler as ParserCodeBlockHandler,
  ParserContributionPlugins,
} from './contribution-types';

// ============================================
// Registry
// ============================================

export { PluginRegistry, createPluginRegistry } from './plugin-registry';

// ============================================
// Loader
// ============================================

export { PluginLoader, createPluginLoader } from './plugin-loader';
export type { PluginLoaderConfig } from './plugin-loader';

// ============================================
// Resolver
// ============================================

export { PluginResolver } from './plugin-resolver';

// ============================================
// Pipeline Builder
// ============================================

export { PipelineBuilder, createPipelineBuilder } from './pipeline-builder';
export type { PipelinePlugins, CodeBlockHandler, PipelineBuilderOptions } from './pipeline-builder';

// ============================================
// Contribution Registry
// ============================================

export {
  ContributionRegistry,
  getContributionRegistry,
  createContributionRegistry,
  BaseContributionHandler,
  ParserContributionHandler,
} from './contribution-registry';

// ============================================
// Contribution Handlers
// ============================================

export {
  ToolbarContributionHandler,
  getToolbarContributionHandler,
  createToolbarContributionHandler,
  type ResolvedToolbarItem,
} from './toolbar-contribution-handler';

export {
  ExportContributionHandler,
  getExportContributionHandler,
  createExportContributionHandler,
} from './export-contribution-handler';

export {
  PreviewContributionHandler,
  getPreviewContributionHandler,
  createPreviewContributionHandler,
  createPreviewContext,
  syntaxHighlightRenderer,
} from './preview-contribution-handler';

export {
  EditorContributionHandler,
  getEditorContributionHandler,
  createEditorContributionHandler,
  type ResolvedEditorExtension,
} from './editor-contribution-handler';

// ============================================
// Plugin Initializer
// ============================================

export {
  PluginInitializer,
  getPluginInitializer,
  createPluginInitializer,
  initializePluginSystem,
  type ExtendedPluginManifest,
  type PluginInitState,
} from './plugin-initializer';
