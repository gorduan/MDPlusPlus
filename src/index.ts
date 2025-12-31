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

export type {
  PluginDefinition,
  ComponentDefinition,
  StructureDefinition,
  DirectiveNode,
  AIContext,
  RenderResult,
  RenderError,
  ParserOptions
} from './types';
