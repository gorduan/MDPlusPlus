/**
 * TipTap Extensions for MD++
 * Export all custom extensions for WYSIWYG editing
 *
 * NOTE: MermaidBlock and AdmonitionBlock have been moved to their respective plugins.
 * They are now loaded dynamically via usePluginExtensions hook.
 *
 * @see plugins/mermaid/editor/extension.ts
 * @see plugins/admonitions/editor/extension.ts
 * @see app/renderer/src/wysiwyg/usePluginExtensions.ts
 */

// Core extensions (always available)
export { Frontmatter } from './Frontmatter';
export { AIContextBlock } from './AIContextBlock';
export { MDPPDirective } from './MDPPDirective';
export type { DirectiveAttributes } from './MDPPDirective';
export type { AIContextAttributes } from './AIContextBlock';

// Legacy re-exports from original locations (kept for backwards compatibility)
// The plugin versions are the canonical source, these files redirect to them
export { MermaidBlock } from './MermaidBlock';
export type { MermaidBlockOptions } from './MermaidBlock';
export {
  AdmonitionBlock,
  ADMONITION_ICONS,
  ADMONITION_TITLES,
} from './AdmonitionBlock';
export type {
  AdmonitionType,
  AdmonitionBlockOptions,
} from './AdmonitionBlock';
