/**
 * KaTeX Toolbar Items
 *
 * Toolbar button definitions for inserting math equations.
 * This replaces any hardcoded math toolbar items in the core.
 */

import type { ToolbarItemContribution, ToolbarGroupContribution } from '../../../src/plugin-system/contribution-types';

/**
 * KaTeX Toolbar Groups
 * Registers a "math" group if plugins need dedicated math toolbar section
 */
export const katexToolbarGroups: ToolbarGroupContribution[] = [
  {
    id: 'math',
    label: 'Math',
    priority: 42, // After insert (40), before callout (45)
  },
];

/**
 * KaTeX Toolbar Items
 */
export const katexToolbarItems: ToolbarItemContribution[] = [
  {
    id: 'insert-inline-math',
    command: 'insertInlineMath',
    group: 'math',
    priority: 0,
    icon: 'Sigma', // Lucide icon name
    label: 'Inline Math',
    tooltip: 'Insert inline math ($...$)',
    shortcut: 'Ctrl+M',
  },
  {
    id: 'insert-display-math',
    command: 'insertDisplayMath',
    group: 'math',
    priority: 1,
    icon: 'SquareSigma', // Lucide icon name
    label: 'Display Math',
    tooltip: 'Insert display math ($$...$$)',
    shortcut: 'Ctrl+Shift+M',
  },
];

// Combined export for toolbar contribution
export const katexToolbarContribution = {
  groups: katexToolbarGroups,
  items: katexToolbarItems,
};

// Default export for dynamic import
export default katexToolbarContribution;
