/**
 * ThemeSelector Component
 *
 * Dropdown for selecting and managing themes.
 * Shows theme list with options to create, rename, and delete themes.
 *
 * Can operate in two modes:
 * - Full mode (in ThemeEditor): Create, rename, delete allowed
 * - Simple mode (in Settings): Selection only, no management
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Theme } from '../types/themes';

interface ThemeSelectorProps {
  /** All available themes */
  themes: Theme[];
  /** Currently active theme */
  activeTheme: Theme;
  /** Whether "Custom" theme exists */
  hasCustomTheme?: boolean;
  /** Called when user selects a theme */
  onSelectTheme: (id: string) => void;
  /** Called when user creates a new theme (optional - enables create) */
  onCreateTheme?: (name: string) => void;
  /** Called when user deletes a theme (optional - enables delete) */
  onDeleteTheme?: (id: string) => void;
  /** Called when user renames a theme (optional - enables rename) */
  onRenameTheme?: (id: string, newName: string) => void;
  /** Check if a name is already taken (required if create/rename enabled) */
  isNameTaken?: (name: string, excludeId?: string) => boolean;
  /** Label text (default: "Theme:") */
  label?: string;
  /** Whether to show in simple mode (no create/rename/delete) */
  simpleMode?: boolean;
}

type DialogMode = 'none' | 'create' | 'rename' | 'delete';

export default function ThemeSelector({
  themes,
  activeTheme,
  hasCustomTheme = false,
  onSelectTheme,
  onCreateTheme,
  onDeleteTheme,
  onRenameTheme,
  isNameTaken,
  label = 'Theme:',
  simpleMode = false,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('none');
  const [dialogValue, setDialogValue] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [targetThemeId, setTargetThemeId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if management features are enabled
  const canCreate = !simpleMode && !!onCreateTheme;
  const canRename = !simpleMode && !!onRenameTheme;
  const canDelete = !simpleMode && !!onDeleteTheme;

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

  // Sort themes: builtin first, then by name
  const sortedThemes = [...themes].sort((a, b) => {
    if (a.isBuiltin && !b.isBuiltin) return -1;
    if (!a.isBuiltin && b.isBuiltin) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSelect = (id: string) => {
    onSelectTheme(id);
    setIsOpen(false);
  };

  const openCreateDialog = () => {
    setDialogMode('create');
    setDialogValue('');
    setDialogError('');
    setIsOpen(false);
  };

  const openRenameDialog = (theme: Theme) => {
    setDialogMode('rename');
    setDialogValue(theme.name);
    setDialogError('');
    setTargetThemeId(theme.id);
    setIsOpen(false);
  };

  const openDeleteDialog = (theme: Theme) => {
    setDialogMode('delete');
    setDialogValue('');
    setDialogError('');
    setTargetThemeId(theme.id);
    setIsOpen(false);
  };

  const handleDialogSubmit = () => {
    if (dialogMode === 'create' && onCreateTheme) {
      const name = dialogValue.trim();
      if (!name) {
        setDialogError('Name is required');
        return;
      }
      if (isNameTaken?.(name)) {
        setDialogError('Name already exists');
        return;
      }
      onCreateTheme(name);
      setDialogMode('none');
    } else if (dialogMode === 'rename' && targetThemeId && onRenameTheme) {
      const name = dialogValue.trim();
      if (!name) {
        setDialogError('Name is required');
        return;
      }
      if (isNameTaken?.(name, targetThemeId)) {
        setDialogError('Name already exists');
        return;
      }
      onRenameTheme(targetThemeId, name);
      setDialogMode('none');
    } else if (dialogMode === 'delete' && targetThemeId && onDeleteTheme) {
      onDeleteTheme(targetThemeId);
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

  const targetTheme = targetThemeId ? themes.find((t) => t.id === targetThemeId) : null;

  return (
    <div className="profile-selector theme-selector" ref={dropdownRef}>
      <label className="profile-label">{label}</label>
      <div className="profile-dropdown-container">
        <button
          ref={buttonRef}
          className="profile-dropdown-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          <span className="profile-name">{activeTheme.name}</span>
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
            {sortedThemes.map((theme) => (
              <div
                key={theme.id}
                className={`profile-dropdown-item ${theme.id === activeTheme.id ? 'active' : ''}`}
              >
                <button
                  className="profile-item-select"
                  onClick={() => handleSelect(theme.id)}
                  type="button"
                >
                  <span className="profile-item-name">{theme.name}</span>
                  {theme.isBuiltin && <span className="profile-badge">Built-in</span>}
                </button>
                {!theme.isBuiltin && (canRename || canDelete) && (
                  <div className="profile-item-actions">
                    {canRename && (
                      <button
                        className="profile-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRenameDialog(theme);
                        }}
                        title="Rename"
                        type="button"
                      >
                        <span className="profile-icon">&#9998;</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="profile-action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(theme);
                        }}
                        title="Delete"
                        type="button"
                      >
                        <span className="profile-icon">&#128465;</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {canCreate && (
              <>
                <div className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item create-new"
                  onClick={openCreateDialog}
                  type="button"
                >
                  <span className="profile-icon">+</span>
                  Create New Theme
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dialog Overlay */}
      {dialogMode !== 'none' && (
        <div className="profile-dialog-overlay" onClick={() => setDialogMode('none')}>
          <div className="profile-dialog" onClick={(e) => e.stopPropagation()}>
            {dialogMode === 'create' && (
              <>
                <h3>Create New Theme</h3>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Theme name"
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

            {dialogMode === 'rename' && targetTheme && (
              <>
                <h3>Rename Theme</h3>
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

            {dialogMode === 'delete' && targetTheme && (
              <>
                <h3>Delete Theme</h3>
                <p>
                  Are you sure you want to delete "{targetTheme.name}"?
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
