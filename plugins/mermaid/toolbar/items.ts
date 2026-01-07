/**
 * Mermaid Toolbar Items
 *
 * Defines toolbar buttons contributed by the Mermaid plugin.
 * This replaces the hardcoded mermaid button in builtinToolbarItems.ts.
 */

import type { ToolbarItemContribution } from '../../../src/plugin-system/contribution-types';

/**
 * Mermaid Toolbar Items
 */
export const mermaidToolbarItems: ToolbarItemContribution[] = [
  {
    id: 'insert-diagram',
    command: 'setMermaid',
    group: 'insert',
    priority: 4,
    // Icon will be resolved by lucide-react's GitBranch
    icon: 'GitBranch',
    label: 'Diagram',
    tooltip: 'Insert Mermaid Diagram (Ctrl+Shift+M)',
    shortcut: 'Ctrl+Shift+M',
  },
];

// Default export for dynamic import
export default mermaidToolbarItems;
