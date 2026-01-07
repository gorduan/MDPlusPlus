/**
 * Profile Types for MD++ Settings
 *
 * Profiles store parser settings and enabled plugins.
 * Built-in profiles (MD++ Standard, MD Classic) cannot be deleted.
 * User-created profiles can be created, modified, and deleted.
 */

import type { ParserSettings } from '../components/SettingsDialog';

/**
 * A settings profile containing parser configuration
 */
export interface Profile {
  /** Unique identifier (e.g., 'mdpp-standard', 'md-classic', uuid) */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** True for built-in profiles (cannot be deleted) */
  isBuiltin: boolean;
  /** True for read-only profiles (changes create a new profile) */
  isReadOnly: boolean;
  /** The actual parser settings */
  settings: ParserSettings;
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last modification */
  modifiedAt: string;
}

/**
 * State structure stored in localStorage
 */
export interface ProfilesState {
  /** Schema version for migrations */
  version: 1;
  /** Currently active profile ID */
  activeProfileId: string;
  /** All profiles indexed by ID */
  profiles: Record<string, Profile>;
}

/**
 * Built-in profile IDs
 */
export const PROFILE_IDS = {
  MDPP_STANDARD: 'mdpp-standard',
  MD_CLASSIC: 'md-classic',
} as const;

/**
 * Default settings for MD++ Standard profile
 * All features enabled, common plugins active
 */
export const MDPP_STANDARD_SETTINGS: ParserSettings = {
  enableGfm: true,
  enableTables: true,
  enableTaskLists: true,
  enableStrikethrough: true,
  enableAutolinks: true,
  enableFootnotes: true,
  enableHeadingAnchors: true,
  enableDirectives: true,
  enableAIContext: true,
  enableScripts: true,
  scriptSecurityLevel: 'standard',
  enabledPlugins: ['katex', 'mermaid', 'admonitions', 'bootstrap'],
  defaultThemeId: 'dark',
};

/**
 * Default settings for MD Classic profile
 * Standard Markdown with GFM, no MD++ features or plugins
 */
export const MD_CLASSIC_SETTINGS: ParserSettings = {
  enableGfm: true,
  enableTables: true,
  enableTaskLists: true,
  enableStrikethrough: true,
  enableAutolinks: true,
  enableFootnotes: true,
  enableHeadingAnchors: true,
  enableDirectives: false,
  enableAIContext: false,
  enableScripts: false,
  scriptSecurityLevel: 'strict',
  enabledPlugins: [],
  defaultThemeId: 'dark',
};

/**
 * Built-in profiles that cannot be deleted
 */
export const BUILTIN_PROFILES: Profile[] = [
  {
    id: PROFILE_IDS.MDPP_STANDARD,
    name: 'MD++ Standard',
    isBuiltin: true,
    isReadOnly: true,
    settings: MDPP_STANDARD_SETTINGS,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: PROFILE_IDS.MD_CLASSIC,
    name: 'MD Classic',
    isBuiltin: true,
    isReadOnly: true,
    settings: MD_CLASSIC_SETTINGS,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * User action when modifying a read-only profile
 */
export type ProfileModificationAction =
  | { type: 'overwrite-custom' }
  | { type: 'create-new'; name: string }
  | { type: 'cancel' };
