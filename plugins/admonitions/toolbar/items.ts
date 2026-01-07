/**
 * Admonitions Toolbar Items
 *
 * Toolbar button definitions for inserting callouts/admonitions.
 * This replaces the hardcoded callout buttons in builtinToolbarItems.ts
 */

import type { ToolbarItemContribution, ToolbarGroupContribution } from '../../../src/plugin-system/contribution-types';

/**
 * Admonitions Toolbar Group
 */
export const admonitionsToolbarGroups: ToolbarGroupContribution[] = [
  {
    id: 'callout',
    label: 'Callouts',
    priority: 45, // After math (42), before mdpp (50)
  },
];

/**
 * Admonitions Toolbar Items
 * These map to the toggleAdmonition command with different types
 */
export const admonitionsToolbarItems: ToolbarItemContribution[] = [
  {
    id: 'callout-note',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 0,
    icon: 'Info', // Lucide icon name
    label: 'Note',
    tooltip: 'Insert Note Callout (Ctrl+Shift+N)',
    shortcut: 'Ctrl+Shift+N',
  },
  {
    id: 'callout-tip',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 1,
    icon: 'Lightbulb',
    label: 'Tip',
    tooltip: 'Insert Tip Callout',
  },
  {
    id: 'callout-warning',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 2,
    icon: 'AlertTriangle',
    label: 'Warning',
    tooltip: 'Insert Warning Callout',
  },
  {
    id: 'callout-danger',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 3,
    icon: 'AlertCircle',
    label: 'Danger',
    tooltip: 'Insert Danger Callout',
  },
  {
    id: 'callout-success',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 4,
    icon: 'CheckCircle',
    label: 'Success',
    tooltip: 'Insert Success Callout',
  },
  {
    id: 'callout-question',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 5,
    icon: 'HelpCircle',
    label: 'Question',
    tooltip: 'Insert Question Callout',
  },
  {
    id: 'callout-info',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 6,
    icon: 'Info',
    label: 'Info',
    tooltip: 'Insert Info Callout',
  },
  {
    id: 'callout-quote',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 7,
    icon: 'Quote',
    label: 'Quote',
    tooltip: 'Insert Quote Callout',
  },
  {
    id: 'callout-example',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 8,
    icon: 'FileText',
    label: 'Example',
    tooltip: 'Insert Example Callout',
  },
  {
    id: 'callout-bug',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 9,
    icon: 'Bug',
    label: 'Bug',
    tooltip: 'Insert Bug Callout',
  },
  {
    id: 'callout-abstract',
    command: 'toggleAdmonition',
    group: 'callout',
    priority: 10,
    icon: 'FileText',
    label: 'Abstract',
    tooltip: 'Insert Abstract Callout',
  },
];

// Combined export for toolbar contribution
export const admonitionsToolbarContribution = {
  groups: admonitionsToolbarGroups,
  items: admonitionsToolbarItems,
};

// Default export for dynamic import
export default admonitionsToolbarContribution;
