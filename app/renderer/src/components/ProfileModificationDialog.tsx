/**
 * ProfileModificationDialog Component
 *
 * Shown when user tries to modify a read-only (built-in) profile.
 * Offers options to:
 * - Overwrite existing "Custom" profile
 * - Create a new profile with a custom name
 * - Cancel the changes
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ProfileModificationAction } from '../types/profiles';

interface ProfileModificationDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Whether a "Custom" profile already exists */
  hasCustomProfile: boolean;
  /** Name of the profile being modified */
  sourceProfileName: string;
  /** Called when user makes a choice */
  onAction: (action: ProfileModificationAction) => void;
  /** Check if a name is already taken */
  isNameTaken: (name: string) => boolean;
}

type Mode = 'choose' | 'name-input';

export default function ProfileModificationDialog({
  isOpen,
  hasCustomProfile,
  sourceProfileName,
  onAction,
  isNameTaken,
}: ProfileModificationDialogProps) {
  const [mode, setMode] = useState<Mode>('choose');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMode('choose');
      setNewName('');
      setError('');
    }
  }, [isOpen]);

  // Focus input when switching to name input mode
  useEffect(() => {
    if (mode === 'name-input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  if (!isOpen) return null;

  const handleOverwriteCustom = () => {
    onAction({ type: 'overwrite-custom' });
  };

  const handleCreateNew = () => {
    setMode('name-input');
  };

  const handleSubmitName = () => {
    const name = newName.trim();
    if (!name) {
      setError('Please enter a name');
      return;
    }
    if (isNameTaken(name)) {
      setError('This name is already taken');
      return;
    }
    onAction({ type: 'create-new', name });
  };

  const handleCancel = () => {
    onAction({ type: 'cancel' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmitName();
    } else if (e.key === 'Escape') {
      if (mode === 'name-input') {
        setMode('choose');
      } else {
        handleCancel();
      }
    }
  };

  return (
    <div className="profile-dialog-overlay" onClick={handleCancel}>
      <div className="profile-dialog modification-dialog" onClick={(e) => e.stopPropagation()}>
        {mode === 'choose' ? (
          <>
            <h3>Save Changes</h3>
            <p>
              "{sourceProfileName}" is a built-in profile and cannot be modified directly.
              <br />
              How would you like to save your changes?
            </p>

            <div className="modification-options">
              {hasCustomProfile && (
                <button
                  className="modification-option"
                  onClick={handleOverwriteCustom}
                  type="button"
                >
                  <span className="option-title">Update "Custom" Profile</span>
                  <span className="option-description">
                    Overwrite your existing Custom profile with these settings
                  </span>
                </button>
              )}

              <button
                className="modification-option"
                onClick={() => {
                  if (!hasCustomProfile) {
                    // Directly create "Custom" profile
                    onAction({ type: 'create-new', name: 'Custom' });
                  } else {
                    // Show name input for new profile
                    handleCreateNew();
                  }
                }}
                type="button"
              >
                <span className="option-title">
                  {hasCustomProfile ? 'Create New Profile' : 'Save as "Custom"'}
                </span>
                <span className="option-description">
                  {hasCustomProfile
                    ? 'Create a new profile with a custom name'
                    : 'Create a new Custom profile with these settings'}
                </span>
              </button>
            </div>

            <div className="profile-dialog-actions">
              <button className="btn secondary" onClick={handleCancel} type="button">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Create New Profile</h3>
            <p>Enter a name for your new profile:</p>
            <input
              ref={inputRef}
              type="text"
              placeholder="Profile name"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className={error ? 'error' : ''}
            />
            {error && <p className="profile-dialog-error">{error}</p>}
            <div className="profile-dialog-actions">
              <button className="btn secondary" onClick={() => setMode('choose')} type="button">
                Back
              </button>
              <button className="btn primary" onClick={handleSubmitName} type="button">
                Create
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
