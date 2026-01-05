/**
 * WYSIWYG Module Exports
 * Central export point for all WYSIWYG-related functionality
 */

// Toolbar Registry
export { toolbarRegistry } from './ToolbarRegistry';
export type {
  ToolbarItem,
  ToolbarItemType,
  ToolbarDropdownOption,
  ToolbarGroup,
  PluginToolbarConfig,
} from './ToolbarRegistry';
export { registerBuiltinToolbarItems } from './builtinToolbarItems';

// Shortcut Registry
export { shortcutRegistry } from './ShortcutRegistry';
export type {
  ShortcutDefinition,
  ShortcutCategory,
} from './ShortcutRegistry';

// Settings Registry
export { settingsRegistry } from './SettingsRegistry';
export type {
  SettingFieldType,
  SettingFieldOption,
  SettingField,
  SettingsSection,
  PluginSettings,
} from './SettingsRegistry';

// Element Template Registry
export { templateRegistry, registerDefaultTemplates } from './elementTemplates';
export type {
  ElementTemplate,
  TemplateCategory,
} from './elementTemplates';
