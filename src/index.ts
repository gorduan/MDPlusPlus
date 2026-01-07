// MD++ (Markdown Plus Plus) - Main Entry Point
// Extended Markdown with Framework-Agnostic Component Directives

export { MDPlusPlus } from './parser';
export { PluginLoader, createPluginLoader } from './plugin-loader';
export {
  extractAIContext,
  getVisibleContexts,
  getHiddenContexts,
  formatAIContext,
  hasAIContext
} from './ai-context';

// Security configuration utilities
export {
  SECURITY_PROFILES,
  parseSecurityConfig,
  generateSampleSecurityYAML,
  isSourceTrusted,
  validateSecurityConfig,
  getSecurityRecommendation
} from './security-config';
export type { SecurityYAML } from './security-config';

// File format utilities
export {
  detectFileFormat,
  getFormatCapabilities,
  hasCapability,
  FORMAT_CAPABILITIES
} from './types';

// AI Placeholder utilities
export {
  remarkAIPlaceholder,
  extractPlaceholdersFromFile,
  extractPlaceholdersFromHTML,
  replacePlaceholderContent,
  interpolatePlaceholders
} from './plugins/ai-placeholder';

// Script block utilities
export {
  remarkScriptBlock,
  extractScriptsFromFile,
  extractScriptsFromHTML
} from './plugins/script-block';

// Kroki diagram utilities
export {
  remarkKroki,
  KROKI_DIAGRAM_TYPES,
  isKrokiLanguage,
  extractKrokiType,
  buildKrokiUrl,
  encodeKrokiDiagram,
  getKrokiLanguages
} from './plugins/kroki';
export type {
  KrokiDiagramType,
  KrokiOutputFormat,
  KrokiPluginOptions
} from './plugins/kroki';

// Reveal.js slides utilities
export {
  remarkRevealSlides,
  REVEAL_THEMES,
  REVEAL_TRANSITIONS,
  parseSlides,
  generateRevealHtml,
  generateEmbeddedRevealHtml,
  isPresentation
} from './plugins/reveal-slides';
export type {
  RevealTheme,
  RevealTransition,
  RevealPluginOptions,
  SlideData,
  PresentationData
} from './plugins/reveal-slides';

export type {
  // File format types
  FileFormat,
  FormatCapabilities,
  // Style types (for .mdsc)
  StyleBlockData,
  StyleCompileResult,
  // Core types
  PluginDefinition,
  ComponentDefinition,
  StructureDefinition,
  DirectiveNode,
  AIContext,
  RenderResult,
  RenderError,
  ParserOptions,
  SecurityProfile,
  SecurityConfig,
  // Script types
  ScriptMode,
  ScriptSecurityLevel,
  ScriptBlockData,
  ScriptError,
  ScriptExecutionResult,
  ScriptLogEntry,
  ScriptAPI,
  ScriptRenderResult,
  // AI Placeholder types
  AIPlaceholderFormat,
  AIPlaceholderStatus,
  AIPlaceholderData,
  AIPlaceholderResult,
  AIAgent,
  AIAgentContext,
  AIPlaceholderRenderResult,
  FullRenderResult
} from './types';
