/**
 * MD++ Theme Editor
 *
 * A visual editor for customizing the color theme.
 * Features:
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

// ============================================
// Types
// ============================================

interface ColorToken {
  name: string;
  variable: string;
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
}

// ============================================
// Default Theme Values (from _tokens.scss)
// ============================================

const DEFAULT_DARK_THEME: Record<string, string> = {
  // Backgrounds
  '--bg-primary': '#0F172A',
  '--bg-secondary': '#1E293B',
  '--bg-card': '#334155',
  '--bg-hover': '#475569',
  '--bg-code': '#1E293B',
  // Text
  '--text-primary': '#F8FAFC',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--text-code': '#E2E8F0',
  // Accent
  '--accent': '#7C3AED',
  '--accent-hover': '#6D28D9',
  '--accent-light': '#A78BFA',
  // Semantic
  '--color-success': '#10B981',
  '--color-warning': '#F59E0B',
  '--color-error': '#EF4444',
  '--color-info': '#3B82F6',
  // Border
  '--border-color': '#475569',
  // Syntax
  '--syntax-keyword': '#c678dd',
  '--syntax-string': '#98c379',
  '--syntax-function': '#61aeee',
  '--syntax-variable': '#e06c75',
  '--syntax-comment': '#5c6370',
  '--syntax-number': '#d19a66',
};

const DEFAULT_LIGHT_THEME: Record<string, string> = {
  // Backgrounds
  '--bg-primary': '#FFFFFF',
  '--bg-secondary': '#F8FAFC',
  '--bg-card': '#F1F5F9',
  '--bg-hover': '#E2E8F0',
  '--bg-code': '#F8FAFC',
  // Text
  '--text-primary': '#1E293B',
  '--text-secondary': '#64748B',
  '--text-muted': '#94A3B8',
  '--text-code': '#1E293B',
  // Accent
  '--accent': '#7C3AED',
  '--accent-hover': '#6D28D9',
  '--accent-light': '#6D28D9',
  // Semantic
  '--color-success': '#059669',
  '--color-warning': '#D97706',
  '--color-error': '#DC2626',
  '--color-info': '#2563EB',
  // Border
  '--border-color': '#E2E8F0',
  // Syntax
  '--syntax-keyword': '#a626a4',
  '--syntax-string': '#50a14f',
  '--syntax-function': '#4078f2',
  '--syntax-variable': '#e45649',
  '--syntax-comment': '#a0a1a7',
  '--syntax-number': '#986801',
};

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

function getColorGroups(theme: Record<string, string>): ColorGroup[] {
  return [
    {
      id: 'backgrounds',
      name: 'Hintergründe',
      icon: <PaletteIcon />,
      tokens: [
        { name: 'Primär', variable: '--bg-primary', value: theme['--bg-primary'], description: 'Haupthintergrund' },
        { name: 'Sekundär', variable: '--bg-secondary', value: theme['--bg-secondary'], description: 'Sekundärer Hintergrund' },
        { name: 'Karte', variable: '--bg-card', value: theme['--bg-card'], description: 'Karten und Panels' },
        { name: 'Hover', variable: '--bg-hover', value: theme['--bg-hover'], description: 'Hover-Zustand' },
        { name: 'Code', variable: '--bg-code', value: theme['--bg-code'], description: 'Code-Blöcke' },
      ],
    },
    {
      id: 'text',
      name: 'Text',
      icon: <TypeIcon />,
      tokens: [
        { name: 'Primär', variable: '--text-primary', value: theme['--text-primary'], description: 'Haupttext' },
        { name: 'Sekundär', variable: '--text-secondary', value: theme['--text-secondary'], description: 'Sekundärer Text' },
        { name: 'Gedämpft', variable: '--text-muted', value: theme['--text-muted'], description: 'Gedämpfter Text' },
        { name: 'Code', variable: '--text-code', value: theme['--text-code'], description: 'Code-Text' },
      ],
    },
    {
      id: 'accent',
      name: 'Akzent',
      icon: <SparklesIcon />,
      tokens: [
        { name: 'Primär', variable: '--accent', value: theme['--accent'], description: 'Hauptakzentfarbe' },
        { name: 'Hover', variable: '--accent-hover', value: theme['--accent-hover'], description: 'Akzent bei Hover' },
        { name: 'Hell', variable: '--accent-light', value: theme['--accent-light'], description: 'Helle Akzentfarbe' },
      ],
    },
    {
      id: 'semantic',
      name: 'Semantisch',
      icon: <AlertIcon />,
      tokens: [
        { name: 'Erfolg', variable: '--color-success', value: theme['--color-success'], description: 'Erfolgsmeldungen' },
        { name: 'Warnung', variable: '--color-warning', value: theme['--color-warning'], description: 'Warnungen' },
        { name: 'Fehler', variable: '--color-error', value: theme['--color-error'], description: 'Fehlermeldungen' },
        { name: 'Info', variable: '--color-info', value: theme['--color-info'], description: 'Informationen' },
        { name: 'Rahmen', variable: '--border-color', value: theme['--border-color'], description: 'Rahmenfarbe' },
      ],
    },
    {
      id: 'syntax',
      name: 'Syntax',
      icon: <CodeIcon />,
      tokens: [
        { name: 'Schlüsselwort', variable: '--syntax-keyword', value: theme['--syntax-keyword'], description: 'if, const, function' },
        { name: 'String', variable: '--syntax-string', value: theme['--syntax-string'], description: 'Zeichenketten' },
        { name: 'Funktion', variable: '--syntax-function', value: theme['--syntax-function'], description: 'Funktionsnamen' },
        { name: 'Variable', variable: '--syntax-variable', value: theme['--syntax-variable'], description: 'Variablennamen' },
        { name: 'Kommentar', variable: '--syntax-comment', value: theme['--syntax-comment'], description: 'Kommentare' },
        { name: 'Zahl', variable: '--syntax-number', value: theme['--syntax-number'], description: 'Zahlen' },
      ],
    },
  ];
}

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEY_DARK = 'mdpp-custom-theme-dark';
const STORAGE_KEY_LIGHT = 'mdpp-custom-theme-light';

// ============================================
// Helper Functions
// ============================================

function loadCustomTheme(isDark: boolean): Record<string, string> {
  const key = isDark ? STORAGE_KEY_DARK : STORAGE_KEY_LIGHT;
  const defaults = isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load custom theme:', e);
  }
  return { ...defaults };
}

function saveCustomTheme(isDark: boolean, theme: Record<string, string>): void {
  const key = isDark ? STORAGE_KEY_DARK : STORAGE_KEY_LIGHT;
  try {
    localStorage.setItem(key, JSON.stringify(theme));
  } catch (e) {
    console.warn('Failed to save custom theme:', e);
  }
}

function applyThemeToDocument(theme: Record<string, string>): void {
  const root = document.documentElement;
  Object.entries(theme).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });
}

function exportThemeAsCSS(theme: Record<string, string>, name: string): string {
  const lines = Object.entries(theme)
    .map(([variable, value]) => `  ${variable}: ${value};`)
    .join('\n');

  return `/* MD++ Custom Theme: ${name} */\n:root {\n${lines}\n}\n`;
}

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
  onChange: (variable: string, value: string) => void;
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

export default function ThemeEditor({ isOpen, onClose }: ThemeEditorProps) {
  const [editingDark, setEditingDark] = useState(true);
  const [theme, setTheme] = useState<Record<string, string>>(() => loadCustomTheme(true));
  const [selectedGroup, setSelectedGroup] = useState<string>('backgrounds');
  const [selectedToken, setSelectedToken] = useState<ColorToken | null>(null);

  // Load theme when switching between dark/light
  useEffect(() => {
    setTheme(loadCustomTheme(editingDark));
  }, [editingDark]);

  // Apply theme live
  useEffect(() => {
    if (isOpen) {
      applyThemeToDocument(theme);
    }
  }, [theme, isOpen]);

  const handleColorChange = useCallback((variable: string, value: string) => {
    setTheme(prev => {
      const updated = { ...prev, [variable]: value };
      saveCustomTheme(editingDark, updated);
      return updated;
    });
  }, [editingDark]);

  const handleReset = useCallback(() => {
    const defaults = editingDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
    setTheme({ ...defaults });
    saveCustomTheme(editingDark, defaults);
    applyThemeToDocument(defaults);
  }, [editingDark]);

  const handleExport = useCallback(() => {
    const name = editingDark ? 'Dark' : 'Light';
    const css = exportThemeAsCSS(theme, name);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mdpp-theme-${name.toLowerCase()}.css`;
    a.click();
    URL.revokeObjectURL(url);
  }, [theme, editingDark]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.css,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(text);
        if (typeof parsed === 'object') {
          setTheme(prev => ({ ...prev, ...parsed }));
          saveCustomTheme(editingDark, { ...theme, ...parsed });
          return;
        }
      } catch {
        // Not JSON, try CSS
      }

      // Parse CSS variables
      const varRegex = /(--[\w-]+):\s*([^;]+);/g;
      const imported: Record<string, string> = {};
      let match;
      while ((match = varRegex.exec(text)) !== null) {
        imported[match[1]] = match[2].trim();
      }

      if (Object.keys(imported).length > 0) {
        setTheme(prev => ({ ...prev, ...imported }));
        saveCustomTheme(editingDark, { ...theme, ...imported });
      }
    };
    input.click();
  }, [theme, editingDark]);

  if (!isOpen) return null;

  const colorGroups = getColorGroups(theme);
  const activeGroup = colorGroups.find(g => g.id === selectedGroup);

  return (
    <div className="theme-editor-overlay" onClick={onClose}>
      <div className="theme-editor-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="theme-editor-header">
          <h2>Theme Editor</h2>
          <div className="theme-editor-mode-toggle">
            <button
              className={editingDark ? 'active' : ''}
              onClick={() => setEditingDark(true)}
            >
              Dark
            </button>
            <button
              className={!editingDark ? 'active' : ''}
              onClick={() => setEditingDark(false)}
            >
              Light
            </button>
          </div>
          <button className="theme-editor-close" onClick={onClose}>
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
              <button onClick={handleExport} title="Theme exportieren">
                <DownloadIcon />
                <span>Export</span>
              </button>
              <button onClick={handleImport} title="Theme importieren">
                <UploadIcon />
                <span>Import</span>
              </button>
              <button onClick={handleReset} title="Zurücksetzen">
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
                      color={token.value}
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
                token={{ ...selectedToken, value: theme[selectedToken.variable] }}
                onChange={handleColorChange}
              />
            ) : (
              <div className="theme-editor-detail-placeholder">
                <PaletteIcon />
                <p>Wähle eine Farbe aus, um sie zu bearbeiten</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="theme-editor-footer">
          <p>
            Änderungen werden automatisch gespeichert und für PDF-Export verwendet.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Export helper for PDF
// ============================================

export function getCustomThemeForExport(isDark: boolean): Record<string, string> {
  return loadCustomTheme(isDark);
}

export function getThemeCSS(isDark: boolean): string {
  const theme = loadCustomTheme(isDark);
  return exportThemeAsCSS(theme, isDark ? 'Dark' : 'Light');
}
