/**
 * ThemeModificationDialog Component
 *
 * Shown when user tries to modify a read-only (built-in) theme.
 * Offers options to:
 * - Overwrite existing "Custom" theme
 * - Create a new theme with a custom name
 * - Cancel the changes
 */

import React, { useState, useRef, useEffect } from 'react';
import type { ThemeModificationAction } from '../types/themes';

interface ThemeModificationDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Whether a "Custom" theme already exists */
  hasCustomTheme: boolean;
  /** Name of the theme being modified */
  sourceThemeName: string;
  /** Called when user makes a choice */
  onAction: (action: ThemeModificationAction) => void;
  /** Check if a name is already taken */
  isNameTaken: (name: string) => boolean;
}

type Mode = 'choose' | 'name-input';

export default function ThemeModificationDialog({
  isOpen,
  hasCustomTheme,
  sourceThemeName,
  onAction,
  isNameTaken,
}: ThemeModificationDialogProps) {
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
            <h3>Save Theme Changes</h3>
            <p>
              "{sourceThemeName}" is a built-in theme and cannot be modified directly.
              <br />
              How would you like to save your changes?
            </p>

            <div className="modification-options">
              {hasCustomTheme && (
                <button
                  className="modification-option"
                  onClick={handleOverwriteCustom}
                  type="button"
                >
                  <span className="option-title">Update "Custom" Theme</span>
                  <span className="option-description">
                    Overwrite your existing Custom theme with these colors
                  </span>
                </button>
              )}

              <button
                className="modification-option"
                onClick={() => {
                  if (!hasCustomTheme) {
                    // Directly create "Custom" theme
                    onAction({ type: 'create-new', name: 'Custom' });
                  } else {
                    // Show name input for new theme
                    handleCreateNew();
                  }
                }}
                type="button"
              >
                <span className="option-title">
                  {hasCustomTheme ? 'Create New Theme' : 'Save as "Custom"'}
                </span>
                <span className="option-description">
                  {hasCustomTheme
                    ? 'Create a new theme with a custom name'
                    : 'Create a new Custom theme with these colors'}
                </span>
              </button>
            </div>

            <div className="profile-dialog-actions">
              <button className="btn secondary" onClick={handleCancel} type="button">
                Discard Changes
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Create New Theme</h3>
            <p>Enter a name for your new theme:</p>
            <input
              ref={inputRef}
              type="text"
              placeholder="Theme name"
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
