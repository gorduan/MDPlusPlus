/**
 * MD++ Theme Editor
 *
 * A visual editor for customizing the color theme.
 * Features:
 * - Theme selection dropdown with create/rename/delete
 * - Color group editing (Backgrounds, Text, Accent, etc.)
 * - Individual color detail editing
 * - Live preview
 * - Export/Import themes
 * - PDF export style customization
 *
 * Based on:
 * - react-colorful (2.8KB color picker)
 * - CSS custom properties for live updates
 *
 * @see https://github.com/omgovich/react-colorful
 */

import React, { useState, useCallback, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import ThemeSelector from './ThemeSelector';
import ThemeModificationDialog from './ThemeModificationDialog';
import type { Theme, ThemeColors, ThemeModificationAction } from '../types/themes';
import { DEFAULT_DARK_COLORS, DEFAULT_LIGHT_COLORS } from '../types/themes';
import { ThemeService } from '../services/ThemeService';

// ============================================
// Types
// ============================================

interface ColorToken {
  name: string;
  variable: keyof ThemeColors;
  value: string;
  description?: string;
}

interface ColorGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  tokens: ColorToken[];
}

interface ThemeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  /** All available themes */
  themes: Theme[];
  /** Currently active theme */
  activeTheme: Theme;
  /** Whether "Custom" theme exists */
  hasCustomTheme: boolean;
  /** Called when user selects a theme */
  onSelectTheme: (id: string) => void;
  /** Called when user creates a new theme */
  onCreateTheme: (name: string) => void;
  /** Called when user deletes a theme */
  onDeleteTheme: (id: string) => void;
  /** Called when user renames a theme */
  onRenameTheme: (id: string, newName: string) => void;
  /** Called when colors are changed (for non-read-only themes) */
  onColorsChange: (colors: Partial<ThemeColors>) => boolean;
  /** Called when modification action is selected */
  onModificationAction: (action: ThemeModificationAction, pendingColors: ThemeColors) => void;
  /** Check if a name is already taken */
  isNameTaken: (name: string, excludeId?: string) => boolean;
  /** Called when preview colors change (for live preview in Preview component) */
  onPreviewColorsChange?: (colors: ThemeColors) => void;
}

// ============================================
// Icons
// ============================================

const PaletteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="13.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="10.5" r="2.5" />
    <circle cx="8.5" cy="7.5" r="2.5" />
    <circle cx="6.5" cy="12.5" r="2.5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const TypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 3l1.912 5.813a2 2 0 001.275 1.275L21 12l-5.813 1.912a2 2 0 00-1.275 1.275L12 21l-1.912-5.813a2 2 0 00-1.275-1.275L3 12l5.813-1.912a2 2 0 001.275-1.275L12 3z" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

// ============================================
// Color Groups Definition
// ============================================

function getColorGroups(colors: ThemeColors): ColorGroup[] {
  return [
    {
      id: 'backgrounds',
      name: 'Backgrounds',
      icon: <PaletteIcon />,
      tokens: [
        { name: 'Primary', variable: '--bg-primary', value: colors['--bg-primary'], description: 'Main background' },
        { name: 'Secondary', variable: '--bg-secondary', value: colors['--bg-secondary'], description: 'Secondary background' },
        { name: 'Card', variable: '--bg-card', value: colors['--bg-card'], description: 'Cards and panels' },
        { name: 'Hover', variable: '--bg-hover', value: colors['--bg-hover'], description: 'Hover state' },
        { name: 'Code', variable: '--bg-code', value: colors['--bg-code'], description: 'Code blocks' },
      ],
    },
    {
      id: 'text',
      name: 'Text',
      icon: <TypeIcon />,
      tokens: [
        { name: 'Primary', variable: '--text-primary', value: colors['--text-primary'], description: 'Main text' },
        { name: 'Secondary', variable: '--text-secondary', value: colors['--text-secondary'], description: 'Secondary text' },
        { name: 'Muted', variable: '--text-muted', value: colors['--text-muted'], description: 'Muted text' },
        { name: 'Code', variable: '--text-code', value: colors['--text-code'], description: 'Code text' },
      ],
    },
    {
      id: 'accent',
      name: 'Accent',
      icon: <SparklesIcon />,
      tokens: [
        { name: 'Primary', variable: '--accent', value: colors['--accent'], description: 'Main accent color' },
        { name: 'Hover', variable: '--accent-hover', value: colors['--accent-hover'], description: 'Accent on hover' },
        { name: 'Light', variable: '--accent-light', value: colors['--accent-light'], description: 'Light accent color' },
      ],
    },
    {
      id: 'semantic',
      name: 'Semantic',
      icon: <AlertIcon />,
      tokens: [
        { name: 'Success', variable: '--color-success', value: colors['--color-success'], description: 'Success messages' },
        { name: 'Warning', variable: '--color-warning', value: colors['--color-warning'], description: 'Warnings' },
        { name: 'Error', variable: '--color-error', value: colors['--color-error'], description: 'Error messages' },
        { name: 'Info', variable: '--color-info', value: colors['--color-info'], description: 'Information' },
        { name: 'Border', variable: '--border-color', value: colors['--border-color'], description: 'Border color' },
      ],
    },
    {
      id: 'syntax',
      name: 'Syntax',
      icon: <CodeIcon />,
      tokens: [
        { name: 'Keyword', variable: '--syntax-keyword', value: colors['--syntax-keyword'], description: 'if, const, function' },
        { name: 'String', variable: '--syntax-string', value: colors['--syntax-string'], description: 'String literals' },
        { name: 'Function', variable: '--syntax-function', value: colors['--syntax-function'], description: 'Function names' },
        { name: 'Variable', variable: '--syntax-variable', value: colors['--syntax-variable'], description: 'Variable names' },
        { name: 'Comment', variable: '--syntax-comment', value: colors['--syntax-comment'], description: 'Comments' },
        { name: 'Number', variable: '--syntax-number', value: colors['--syntax-number'], description: 'Numbers' },
      ],
    },
  ];
}

// ============================================
// Helper Functions
// ============================================

// NOTE: We no longer apply theme colors to document root.
// The Preview component receives themeColors as a prop and applies them via inline styles.
// The UI theme is controlled separately via data-theme attribute.

// ============================================
// Component: ColorSwatch
// ============================================

interface ColorSwatchProps {
  color: string;
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
}

function ColorSwatch({ color, name, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      className={`theme-editor-swatch ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      title={name}
      style={{ '--swatch-color': color } as React.CSSProperties}
    >
      <span className="swatch-color" />
      <span className="swatch-name">{name}</span>
    </button>
  );
}

// ============================================
// Component: ColorEditor
// ============================================

interface ColorEditorProps {
  token: ColorToken;
  onChange: (variable: keyof ThemeColors, value: string) => void;
}

function ColorEditor({ token, onChange }: ColorEditorProps) {
  const [localColor, setLocalColor] = useState(token.value);

  useEffect(() => {
    setLocalColor(token.value);
  }, [token.value]);

  const handleChange = useCallback((color: string) => {
    setLocalColor(color);
    onChange(token.variable, color);
  }, [onChange, token.variable]);

  return (
    <div className="theme-editor-color-detail">
      <div className="color-detail-header">
        <h4>{token.name}</h4>
        <code>{token.variable}</code>
      </div>
      {token.description && (
        <p className="color-detail-description">{token.description}</p>
      )}
      <div className="color-detail-picker">
        <HexColorPicker color={localColor} onChange={handleChange} />
        <div className="color-detail-input">
          <HexColorInput
            color={localColor}
            onChange={handleChange}
            prefixed
            alpha
          />
          <div
            className="color-detail-preview"
            style={{ backgroundColor: localColor }}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main Component: ThemeEditor
// ============================================

export default function ThemeEditor({
  isOpen,
  onClose,
  themes,
  activeTheme,
  hasCustomTheme,
  onSelectTheme,
  onCreateTheme,
  onDeleteTheme,
  onRenameTheme,
  onColorsChange,
  onModificationAction,
  isNameTaken,
  onPreviewColorsChange,
}: ThemeEditorProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>('backgrounds');
  const [selectedToken, setSelectedToken] = useState<ColorToken | null>(null);
  const [localColors, setLocalColors] = useState<ThemeColors>(activeTheme.colors);
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [pendingColors, setPendingColors] = useState<ThemeColors | null>(null);

  // Sync local colors when active theme changes (only on theme switch, not color updates)
  useEffect(() => {
    setLocalColors(activeTheme.colors);
    setSelectedToken(null);
  }, [activeTheme.id]); // Only react to theme ID changes, not color changes

  // Notify parent of preview colors for live preview in Preview component
  useEffect(() => {
    if (isOpen && onPreviewColorsChange) {
      onPreviewColorsChange(localColors);
    }
  }, [localColors, isOpen, onPreviewColorsChange]);

  const handleColorChange = useCallback((variable: keyof ThemeColors, value: string) => {
    const newColors = { ...localColors, [variable]: value };
    setLocalColors(newColors);

    // If theme is read-only, we'll show dialog when they try to save/close
    if (!activeTheme.isReadOnly) {
      onColorsChange({ [variable]: value });
    }
  }, [localColors, activeTheme.isReadOnly, onColorsChange]);

  const handleClose = useCallback(() => {
    // Check if there are unsaved changes for a read-only theme
    if (activeTheme.isReadOnly) {
      const hasChanges = Object.keys(localColors).some(
        (key) => localColors[key as keyof ThemeColors] !== activeTheme.colors[key as keyof ThemeColors]
      );

      if (hasChanges) {
        setPendingColors(localColors);
        setShowModificationDialog(true);
        return;
      }
    }

    onClose();
  }, [activeTheme, localColors, onClose]);

  const handleModificationAction = useCallback((action: ThemeModificationAction) => {
    setShowModificationDialog(false);
    if (pendingColors) {
      onModificationAction(action, pendingColors);
    }
    setPendingColors(null);
    if (action.type !== 'cancel') {
      onClose();
    } else {
      // Reset to original colors
      setLocalColors(activeTheme.colors);
      // Preview colors will update via the useEffect above
    }
  }, [pendingColors, onModificationAction, onClose, activeTheme.colors]);

  const handleReset = useCallback(() => {
    const defaults = activeTheme.baseType === 'dark' ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS;

    if (activeTheme.isReadOnly) {
      // Just reset local preview
      setLocalColors(defaults);
      // Preview colors will update via the useEffect above
    } else {
      // Actually update the theme
      setLocalColors(defaults);
      onColorsChange(defaults);
    }
  }, [activeTheme, onColorsChange]);

  const handleExport = useCallback(() => {
    const css = ThemeService.exportThemeAsCSS(activeTheme.id);
    if (!css) return;

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdpp-theme-${activeTheme.name.toLowerCase().replace(/\s+/g, '-')}.css`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeTheme]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.css,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const name = file.name.replace(/\.(css|json)$/, '');

      const importedTheme = ThemeService.importTheme(text, name);
      if (importedTheme) {
        onSelectTheme(importedTheme.id);
      }
    };
    input.click();
  }, [onSelectTheme]);

  const handleCreateTheme = useCallback((name: string) => {
    // Create new theme based on current colors
    const newTheme = ThemeService.createTheme(name, localColors, activeTheme.baseType);
    onSelectTheme(newTheme.id);
  }, [localColors, activeTheme.baseType, onSelectTheme]);

  if (!isOpen) return null;

  const colorGroups = getColorGroups(localColors);
  const activeGroup = colorGroups.find(g => g.id === selectedGroup);

  return (
    <div className="theme-editor-overlay" onClick={handleClose}>
      <div className="theme-editor-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-editor-header">
          <h2>Theme Editor</h2>
          <div className="theme-editor-selector">
            <ThemeSelector
              themes={themes}
              activeTheme={activeTheme}
              hasCustomTheme={hasCustomTheme}
              onSelectTheme={onSelectTheme}
              onCreateTheme={handleCreateTheme}
              onDeleteTheme={onDeleteTheme}
              onRenameTheme={onRenameTheme}
              isNameTaken={isNameTaken}
              label=""
            />
          </div>
          <button className="theme-editor-close" onClick={handleClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className="theme-editor-content">
          {/* Sidebar: Color Groups */}
          <div className="theme-editor-sidebar">
            <nav className="theme-editor-groups">
              {colorGroups.map(group => (
                <button
                  key={group.id}
                  className={`theme-editor-group ${selectedGroup === group.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedGroup(group.id);
                    setSelectedToken(null);
                  }}
                >
                  {group.icon}
                  <span>{group.name}</span>
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="theme-editor-actions">
              <button onClick={handleExport} title="Export theme">
                <DownloadIcon />
                <span>Export</span>
              </button>
              <button onClick={handleImport} title="Import theme">
                <UploadIcon />
                <span>Import</span>
              </button>
              <button onClick={handleReset} title="Reset to defaults">
                <ResetIcon />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Main: Color Tokens */}
          <div className="theme-editor-main">
            {activeGroup && (
              <>
                <h3>{activeGroup.name}</h3>
                <div className="theme-editor-swatches">
                  {activeGroup.tokens.map(token => (
                    <ColorSwatch
                      key={token.variable}
                      color={localColors[token.variable]}
                      name={token.name}
                      isSelected={selectedToken?.variable === token.variable}
                      onClick={() => setSelectedToken(token)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Detail Panel */}
          <div className="theme-editor-detail">
            {selectedToken ? (
              <ColorEditor
                token={{ ...selectedToken, value: localColors[selectedToken.variable] }}
                onChange={handleColorChange}
              />
            ) : (
              <div className="theme-editor-detail-placeholder">
                <PaletteIcon />
                <p>Select a color to edit</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="theme-editor-footer">
          <p>
            {activeTheme.isReadOnly
              ? 'Editing a built-in theme. Changes will be saved to a new theme.'
              : 'Changes are saved automatically.'}
          </p>
        </div>
      </div>

      {/* Modification Dialog */}
      <ThemeModificationDialog
        isOpen={showModificationDialog}
        hasCustomTheme={hasCustomTheme}
        sourceThemeName={activeTheme.name}
        onAction={handleModificationAction}
        isNameTaken={isNameTaken}
      />
    </div>
  );
}

// ============================================
// Export helper for PDF
// ============================================

export function getCustomThemeForExport(isDark: boolean): Record<string, string> {
  const theme = ThemeService.getThemeById(isDark ? 'dark' : 'light');
  return theme ? { ...theme.colors } : (isDark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
}

export function getThemeCSS(isDark: boolean): string {
  return ThemeService.exportThemeAsCSS(isDark ? 'dark' : 'light') || '';
}
