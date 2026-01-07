/**
 * Profile Service for MD++ Settings
 *
 * Handles persistence and business logic for settings profiles.
 * Profiles are stored as JSON files in the app data directory and shared between instances.
 */

import type { ParserSettings } from '../components/SettingsDialog';
import {
  Profile,
  ProfilesState,
  BUILTIN_PROFILES,
  PROFILE_IDS,
  MDPP_STANDARD_SETTINGS,
} from '../types/profiles';

const STORAGE_KEY = 'profiles';

/**
 * Generate a unique ID for user-created profiles
 */
function generateProfileId(): string {
  return `profile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current ISO timestamp
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Create initial state with built-in profiles
 */
function createInitialState(): ProfilesState {
  const profiles: Record<string, Profile> = {};
  for (const profile of BUILTIN_PROFILES) {
    profiles[profile.id] = { ...profile };
  }

  return {
    version: 1,
    activeProfileId: PROFILE_IDS.MDPP_STANDARD,
    profiles,
  };
}

/**
 * ProfileService - Static service for profile management
 *
 * All methods are static for easy access from any component.
 * State changes trigger file saves via Electron IPC automatically.
 * State is cached in memory and synced to disk asynchronously.
 */
export class ProfileService {
  private static state: ProfilesState | null = null;
  private static listeners: Set<(state: ProfilesState) => void> = new Set();
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  /**
   * Initialize the service - loads profiles from file storage
   * Must be called before using other methods
   */
  static async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.loadFromFile();
    await this.initPromise;
    this.initialized = true;
  }

  /**
   * Load profiles from file storage via Electron IPC
   */
  private static async loadFromFile(): Promise<void> {
    try {
      const stored = await window.electronAPI.loadSettings(STORAGE_KEY);
      console.log('[ProfileService] Loading profiles from file, found:', stored ? 'data' : 'nothing');

      if (stored) {
        const parsed = stored as ProfilesState;
        console.log('[ProfileService] Parsed profiles:', Object.keys(parsed.profiles));

        // Ensure built-in profiles exist and are up-to-date
        for (const builtin of BUILTIN_PROFILES) {
          if (!parsed.profiles[builtin.id]) {
            parsed.profiles[builtin.id] = { ...builtin };
          } else {
            // Update built-in profile properties
            parsed.profiles[builtin.id].isBuiltin = true;
            parsed.profiles[builtin.id].isReadOnly = true;
            // Always update settings for built-in profiles to latest defaults
            parsed.profiles[builtin.id].settings = { ...builtin.settings };
          }
        }

        // Ensure active profile exists
        if (!parsed.profiles[parsed.activeProfileId]) {
          parsed.activeProfileId = PROFILE_IDS.MDPP_STANDARD;
        }

        this.state = parsed;
      } else {
        this.state = createInitialState();
        await this.saveToFile();
      }
    } catch (error) {
      console.error('[ProfileService] Failed to load profiles, using defaults:', error);
      this.state = createInitialState();
      await this.saveToFile();
    }
  }

  /**
   * Save profiles to file storage via Electron IPC
   */
  private static async saveToFile(): Promise<void> {
    if (!this.state) return;

    try {
      const success = await window.electronAPI.saveSettings(STORAGE_KEY, this.state);
      if (success) {
        console.log('[ProfileService] Saved profiles to file:', Object.keys(this.state.profiles));
      } else {
        console.error('[ProfileService] Failed to save profiles to file');
      }
    } catch (error) {
      console.error('[ProfileService] Failed to save profiles:', error);
    }
  }

  /**
   * Load profiles - returns cached state, initializing if needed
   * For synchronous access after initialization
   */
  static loadProfiles(): ProfilesState {
    if (!this.state) {
      // Return initial state if not initialized yet
      console.warn('[ProfileService] loadProfiles called before initialization, using defaults');
      this.state = createInitialState();
    }
    return this.state;
  }

  /**
   * Save profiles - updates cache and persists to file
   */
  static saveProfiles(state: ProfilesState): void {
    // Create a deep copy to ensure React detects state changes
    this.state = JSON.parse(JSON.stringify(state));
    this.notifyListeners();
    // Save to file asynchronously
    this.saveToFile();
  }

  /**
   * Check if service is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Subscribe to state changes
   */
  static subscribe(listener: (state: ProfilesState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(): void {
    if (this.state) {
      for (const listener of this.listeners) {
        listener(this.state);
      }
    }
  }

  /**
   * Get the currently active profile
   */
  static getActiveProfile(): Profile {
    const state = this.loadProfiles();
    return state.profiles[state.activeProfileId];
  }

  /**
   * Get a profile by ID without switching to it
   */
  static getProfileById(id: string): Profile | null {
    const state = this.loadProfiles();
    return state.profiles[id] || null;
  }

  /**
   * Get settings for a specific profile without switching to it
   * Useful for other functions that need profile settings
   */
  static getProfileSettings(id: string): ParserSettings | null {
    const profile = this.getProfileById(id);
    return profile ? { ...profile.settings } : null;
  }

  /**
   * Get all profiles as an array
   */
  static getAllProfiles(): Profile[] {
    const state = this.loadProfiles();
    return Object.values(state.profiles);
  }

  /**
   * Create a new user profile
   */
  static createProfile(name: string, baseSettings?: ParserSettings): Profile {
    const state = this.loadProfiles();

    const newProfile: Profile = {
      id: generateProfileId(),
      name,
      isBuiltin: false,
      isReadOnly: false,
      settings: baseSettings ? { ...baseSettings } : { ...MDPP_STANDARD_SETTINGS },
      createdAt: now(),
      modifiedAt: now(),
    };

    state.profiles[newProfile.id] = newProfile;
    this.saveProfiles(state);

    return newProfile;
  }

  /**
   * Delete a profile (only non-builtin profiles can be deleted)
   * Returns true if deleted, false if profile doesn't exist or is builtin
   */
  static deleteProfile(id: string): boolean {
    const state = this.loadProfiles();
    const profile = state.profiles[id];

    if (!profile || profile.isBuiltin) {
      return false;
    }

    delete state.profiles[id];

    // If we deleted the active profile, switch to default
    if (state.activeProfileId === id) {
      state.activeProfileId = PROFILE_IDS.MDPP_STANDARD;
    }

    this.saveProfiles(state);
    return true;
  }

  /**
   * Rename a profile (only non-builtin profiles can be renamed)
   */
  static renameProfile(id: string, newName: string): boolean {
    const state = this.loadProfiles();
    const profile = state.profiles[id];

    if (!profile || profile.isBuiltin) {
      return false;
    }

    profile.name = newName;
    profile.modifiedAt = now();
    this.saveProfiles(state);
    return true;
  }

  /**
   * Set the active profile
   */
  static setActiveProfile(id: string): boolean {
    const state = this.loadProfiles();

    if (!state.profiles[id]) {
      return false;
    }

    state.activeProfileId = id;
    this.saveProfiles(state);
    return true;
  }

  /**
   * Update settings in a specific profile
   * For read-only profiles, this will fail (caller should handle custom profile creation)
   */
  static updateProfileSettings(id: string, settings: ParserSettings): boolean {
    const state = this.loadProfiles();
    const profile = state.profiles[id];

    if (!profile || profile.isReadOnly) {
      return false;
    }

    profile.settings = { ...settings };
    profile.modifiedAt = now();
    this.saveProfiles(state);
    return true;
  }

  /**
   * Check if a "Custom" profile exists
   */
  static hasCustomProfile(): boolean {
    const state = this.loadProfiles();
    return Object.values(state.profiles).some(
      (p) => p.name === 'Custom' && !p.isBuiltin
    );
  }

  /**
   * Get the "Custom" profile if it exists
   */
  static getCustomProfile(): Profile | null {
    const state = this.loadProfiles();
    return Object.values(state.profiles).find(
      (p) => p.name === 'Custom' && !p.isBuiltin
    ) || null;
  }

  /**
   * Create or update the "Custom" profile with given settings
   * Returns the custom profile
   */
  static upsertCustomProfile(settings: ParserSettings): Profile {
    const existing = this.getCustomProfile();

    if (existing) {
      this.updateProfileSettings(existing.id, settings);
      return this.getProfileById(existing.id)!;
    }

    return this.createProfile('Custom', settings);
  }

  /**
   * Check if a profile name is already taken
   */
  static isNameTaken(name: string, excludeId?: string): boolean {
    const state = this.loadProfiles();
    return Object.values(state.profiles).some(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
    );
  }

  /**
   * Reset the service state (for testing or when clearing data)
   */
  static reset(): void {
    this.state = null;
    this.initialized = false;
    this.initPromise = null;
    // Note: File deletion would need a separate IPC call if needed
  }
}

export default ProfileService;
