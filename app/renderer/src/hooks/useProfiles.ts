/**
 * useProfiles Hook - React integration for ProfileService
 *
 * Provides reactive state management for settings profiles.
 * Automatically syncs with file storage via Electron IPC and notifies on changes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ParserSettings } from '../components/SettingsDialog';
import type { Profile, ProfilesState, ProfileModificationAction } from '../types/profiles';
import { BUILTIN_PROFILES, PROFILE_IDS } from '../types/profiles';
import { ProfileService } from '../services/ProfileService';

export interface UseProfilesReturn {
  /** Whether the service is still loading */
  isLoading: boolean;
  /** All available profiles */
  profiles: Profile[];
  /** The currently active profile */
  activeProfile: Profile;
  /** Settings from the active profile */
  activeSettings: ParserSettings;
  /** Whether the active profile is read-only */
  isActiveReadOnly: boolean;

  /** Switch to a different profile */
  selectProfile: (id: string) => void;
  /** Create a new profile */
  createProfile: (name: string, baseSettings?: ParserSettings) => Profile;
  /** Delete a profile (returns false if builtin) */
  deleteProfile: (id: string) => boolean;
  /** Rename a profile (returns false if builtin) */
  renameProfile: (id: string, newName: string) => boolean;

  /**
   * Update settings in the active profile
   * - For non-read-only profiles: updates directly
   * - For read-only profiles: returns false (caller must show dialog)
   */
  updateSettings: (settings: ParserSettings) => boolean;

  /**
   * Handle modification action from user dialog
   * Called after user chooses what to do when modifying a read-only profile
   */
  handleModificationAction: (action: ProfileModificationAction, pendingSettings: ParserSettings) => void;

  /** Check if "Custom" profile exists */
  hasCustomProfile: boolean;
  /** Check if a profile name is already taken */
  isNameTaken: (name: string, excludeId?: string) => boolean;

  /** Get settings for a specific profile (without switching) */
  getProfileSettings: (id: string) => ParserSettings | null;
}

/**
 * Create a default state for use before initialization
 */
function createDefaultState(): ProfilesState {
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
 * Hook for managing settings profiles
 */
export function useProfiles(): UseProfilesReturn {
  const [isLoading, setIsLoading] = useState(!ProfileService.isInitialized());
  const [state, setState] = useState<ProfilesState>(() =>
    ProfileService.isInitialized() ? ProfileService.loadProfiles() : createDefaultState()
  );

  // Initialize ProfileService on mount
  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!ProfileService.isInitialized()) {
        await ProfileService.initialize();
        if (mounted) {
          setState(ProfileService.loadProfiles());
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  // Subscribe to ProfileService changes
  useEffect(() => {
    const unsubscribe = ProfileService.subscribe((newState) => {
      // Create a new object reference to ensure React detects the change
      setState({ ...newState, profiles: { ...newState.profiles } });
    });

    return unsubscribe;
  }, []);

  // Memoized derived values
  const profiles = useMemo(() => Object.values(state.profiles), [state.profiles]);

  const activeProfile = useMemo(
    () => state.profiles[state.activeProfileId],
    [state.profiles, state.activeProfileId]
  );

  const activeSettings = useMemo(
    () => ({ ...activeProfile.settings }),
    [activeProfile.settings]
  );

  const isActiveReadOnly = activeProfile.isReadOnly;

  const hasCustomProfile = useMemo(
    () => ProfileService.hasCustomProfile(),
    [state.profiles]
  );

  // Actions
  const selectProfile = useCallback((id: string) => {
    ProfileService.setActiveProfile(id);
  }, []);

  const createProfile = useCallback((name: string, baseSettings?: ParserSettings): Profile => {
    return ProfileService.createProfile(name, baseSettings);
  }, []);

  const deleteProfile = useCallback((id: string): boolean => {
    return ProfileService.deleteProfile(id);
  }, []);

  const renameProfile = useCallback((id: string, newName: string): boolean => {
    return ProfileService.renameProfile(id, newName);
  }, []);

  const updateSettings = useCallback((settings: ParserSettings): boolean => {
    if (activeProfile.isReadOnly) {
      // Caller must show dialog and then call handleModificationAction
      return false;
    }

    return ProfileService.updateProfileSettings(activeProfile.id, settings);
  }, [activeProfile]);

  const handleModificationAction = useCallback(
    (action: ProfileModificationAction, pendingSettings: ParserSettings) => {
      switch (action.type) {
        case 'overwrite-custom': {
          const customProfile = ProfileService.upsertCustomProfile(pendingSettings);
          ProfileService.setActiveProfile(customProfile.id);
          break;
        }
        case 'create-new': {
          const newProfile = ProfileService.createProfile(action.name, pendingSettings);
          ProfileService.setActiveProfile(newProfile.id);
          break;
        }
        case 'cancel':
          // Do nothing, settings change is discarded
          break;
      }
    },
    []
  );

  const isNameTaken = useCallback((name: string, excludeId?: string): boolean => {
    return ProfileService.isNameTaken(name, excludeId);
  }, [state.profiles]);

  const getProfileSettings = useCallback((id: string): ParserSettings | null => {
    return ProfileService.getProfileSettings(id);
  }, [state.profiles]);

  return {
    isLoading,
    profiles,
    activeProfile,
    activeSettings,
    isActiveReadOnly,
    selectProfile,
    createProfile,
    deleteProfile,
    renameProfile,
    updateSettings,
    handleModificationAction,
    hasCustomProfile,
    isNameTaken,
    getProfileSettings,
  };
}

export default useProfiles;
