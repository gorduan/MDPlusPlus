/**
 * ProfileSelector Component
 *
 * Dropdown for selecting and managing settings profiles.
 * Shows profile list with options to create, rename, and delete profiles.
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Profile } from '../types/profiles';

interface ProfileSelectorProps {
  /** All available profiles */
  profiles: Profile[];
  /** Currently active profile */
  activeProfile: Profile;
  /** Whether "Custom" profile exists */
  hasCustomProfile: boolean;
  /** Called when user selects a profile */
  onSelectProfile: (id: string) => void;
  /** Called when user creates a new profile */
  onCreateProfile: (name: string) => void;
  /** Called when user deletes a profile */
  onDeleteProfile: (id: string) => void;
  /** Called when user renames a profile */
  onRenameProfile: (id: string, newName: string) => void;
  /** Check if a name is already taken */
  isNameTaken: (name: string, excludeId?: string) => boolean;
}

type DialogMode = 'none' | 'create' | 'rename' | 'delete';

export default function ProfileSelector({
  profiles,
  activeProfile,
  hasCustomProfile,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onRenameProfile,
  isNameTaken,
}: ProfileSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('none');
  const [dialogValue, setDialogValue] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (dialogMode !== 'none' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialogMode]);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Sort profiles: builtin first, then by name
  const sortedProfiles = [...profiles].sort((a, b) => {
    if (a.isBuiltin && !b.isBuiltin) return -1;
    if (!a.isBuiltin && b.isBuiltin) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSelect = (id: string) => {
    onSelectProfile(id);
    setIsOpen(false);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setDialogValue('');
    setDialogError('');
    setIsOpen(false);
  };

  const openRenameDialog = (profile: Profile) => {
    setDialogMode('rename');
    setDialogValue(profile.name);
    setDialogError('');
    setTargetProfileId(profile.id);
    setIsOpen(false);
  };

  const openDeleteDialog = (profile: Profile) => {
    setDialogMode('delete');
    setDialogValue('');
    setDialogError('');
    setTargetProfileId(profile.id);
    setIsOpen(false);
  };

  const handleDialogSubmit = () => {
    if (dialogMode === 'create') {
      const name = dialogValue.trim();
      if (!name) {
        setDialogError('Name is required');
        return;
      }
      if (isNameTaken(name)) {
        setDialogError('Name already exists');
        return;
      }
      onCreateProfile(name);
      setDialogMode('none');
    } else if (dialogMode === 'rename' && targetProfileId) {
      const name = dialogValue.trim();
      if (!name) {
        setDialogError('Name is required');
        return;
      }
      if (isNameTaken(name, targetProfileId)) {
        setDialogError('Name already exists');
        return;
      }
      onRenameProfile(targetProfileId, name);
      setDialogMode('none');
    } else if (dialogMode === 'delete' && targetProfileId) {
      onDeleteProfile(targetProfileId);
      setDialogMode('none');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDialogSubmit();
    } else if (e.key === 'Escape') {
      setDialogMode('none');
    }
  };

  const targetProfile = targetProfileId ? profiles.find((p) => p.id === targetProfileId) : null;

  return (
    <div className="profile-selector" ref={dropdownRef}>
      <label className="profile-label">Profile:</label>
      <div className="profile-dropdown-container">
        <button
          ref={buttonRef}
          className="profile-dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="profile-name">{activeProfile.name}</span>
          <span className="profile-dropdown-arrow">{isOpen ? '\u25B2' : '\u25BC'}</span>
        </button>

        {isOpen && (
          <div
            className="profile-dropdown-menu"
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: menuPosition.width,
            }}
          >
            {sortedProfiles.map((profile) => (
              <div
                key={profile.id}
                className={`profile-dropdown-item ${profile.id === activeProfile.id ? 'active' : ''}`}
              >
                <button
                  className="profile-item-select"
                  onClick={() => handleSelect(profile.id)}
                  type="button"
                >
                  <span className="profile-item-name">{profile.name}</span>
                  {profile.isBuiltin && <span className="profile-badge">Built-in</span>}
                </button>
                {!profile.isBuiltin && (
                  <div className="profile-item-actions">
                    <button
                      className="profile-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openRenameDialog(profile);
                      }}
                      title="Rename"
                      type="button"
                    >
                      <span className="profile-icon">&#9998;</span>
                    </button>
                    <button
                      className="profile-action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(profile);
                      }}
                      title="Delete"
                      type="button"
                    >
                      <span className="profile-icon">&#128465;</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="profile-dropdown-divider" />
            <button
              className="profile-dropdown-item create-new"
              onClick={openCreateDialog}
              type="button"
            >
              <span className="profile-icon">+</span>
              Create New Profile
            </button>
          </div>
        )}
      </div>

      {/* Dialog Overlay */}
      {dialogMode !== 'none' && (
        <div className="profile-dialog-overlay" onClick={() => setDialogMode('none')}>
          <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
            {dialogMode === 'create' && (
              <>
                <h3>Create New Profile</h3>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Profile name"
                  value={dialogValue}
                  onChange={(e) => {
                    setDialogValue(e.target.value);
                    setDialogError('');
                  }}
                  onKeyDown={handleKeyDown}
                  className={dialogError ? 'error' : ''}
                />
                {dialogError && <p className="profile-dialog-error">{dialogError}</p>}
                <div className="profile-dialog-actions">
                  <button className="btn secondary" onClick={() => setDialogMode('none')} type="button">
                    Cancel
                  </button>
                  <button className="btn primary" onClick={handleDialogSubmit} type="button">
                    Create
                  </button>
                </div>
              </>
            )}

            {dialogMode === 'rename' && targetProfile && (
              <>
                <h3>Rename Profile</h3>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="New name"
                  value={dialogValue}
                  onChange={(e) => {
                    setDialogValue(e.target.value);
                    setDialogError('');
                  }}
                  onKeyDown={handleKeyDown}
                  className={dialogError ? 'error' : ''}
                />
                {dialogError && <p className="profile-dialog-error">{dialogError}</p>}
                <div className="profile-dialog-actions">
                  <button className="btn secondary" onClick={() => setDialogMode('none')} type="button">
                    Cancel
                  </button>
                  <button className="btn primary" onClick={handleDialogSubmit} type="button">
                    Rename
                  </button>
                </div>
              </>
            )}

            {dialogMode === 'delete' && targetProfile && (
              <>
                <h3>Delete Profile</h3>
                <p>
                  Are you sure you want to delete "{targetProfile.name}"?
                  <br />
                  This action cannot be undone.
                </p>
                <div className="profile-dialog-actions">
                  <button className="btn secondary" onClick={() => setDialogMode('none')} type="button">
                    Cancel
                  </button>
                  <button className="btn danger" onClick={handleDialogSubmit} type="button">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
