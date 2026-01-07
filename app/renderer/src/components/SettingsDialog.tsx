/**
 * MD++ Settings Dialog Component
 */

import React from 'react';

export type ScriptSecurityLevel = 'strict' | 'standard' | 'permissive';

export interface ParserSettings {
  // GFM Features
  enableGfm: boolean;
  enableTables: boolean;
  enableTaskLists: boolean;
  enableStrikethrough: boolean;
  enableAutolinks: boolean;
  enableFootnotes: boolean;

  // Core Features (not plugin-based)
  enableHeadingAnchors: boolean;

  // MD++ Features
  enableDirectives: boolean;
  enableAIContext: boolean;

  // MarkdownScript (.mdsc)
  enableScripts: boolean;
  scriptSecurityLevel: ScriptSecurityLevel;

  // Plugins (replaces enableMath, enableMermaid, enableCallouts)
  enabledPlugins: string[];
}

export const DEFAULT_SETTINGS: ParserSettings = {
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
  // Default plugins: math (katex), diagrams (mermaid), callouts (admonitions), UI (bootstrap)
  enabledPlugins: ['katex', 'mermaid', 'admonitions', 'bootstrap'],
};

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParserSettings;
  onSettingsChange: (settings: ParserSettings) => void;
  onOpenPluginManager?: () => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onOpenPluginManager,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  const handleToggle = (key: keyof ParserSettings) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({ ...settings, [key]: !settings[key] });
    }
  };


  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* GFM Section */}
          <section className="settings-section">
            <h3>GitHub Flavored Markdown</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableGfm}
                onChange={() => handleToggle('enableGfm')}
              />
              <span>Enable GFM (Master Switch)</span>
            </label>
            <div className={`settings-subsection ${!settings.enableGfm ? 'disabled' : ''}`}>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableTables}
                  onChange={() => handleToggle('enableTables')}
                  disabled={!settings.enableGfm}
                />
                <span>Tables</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableTaskLists}
                  onChange={() => handleToggle('enableTaskLists')}
                  disabled={!settings.enableGfm}
                />
                <span>Task Lists (Checkboxes)</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableStrikethrough}
                  onChange={() => handleToggle('enableStrikethrough')}
                  disabled={!settings.enableGfm}
                />
                <span>Strikethrough (~~text~~)</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableAutolinks}
                  onChange={() => handleToggle('enableAutolinks')}
                  disabled={!settings.enableGfm}
                />
                <span>Autolinks</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableFootnotes}
                  onChange={() => handleToggle('enableFootnotes')}
                  disabled={!settings.enableGfm}
                />
                <span>Footnotes</span>
              </label>
            </div>
          </section>

          {/* Core Features Section */}
          <section className="settings-section">
            <h3>Core Features</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableHeadingAnchors}
                onChange={() => handleToggle('enableHeadingAnchors')}
              />
              <span>Heading Anchors</span>
            </label>
            <p className="settings-hint" style={{ marginTop: '12px' }}>
              Math, Mermaid, and Callouts are now managed via <strong>Plugins</strong>.
            </p>
          </section>

          {/* MD++ Features Section */}
          <section className="settings-section">
            <h3>MD++ Features</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableDirectives}
                onChange={() => handleToggle('enableDirectives')}
              />
              <span>Component Directives (:::plugin:component)</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableAIContext}
                onChange={() => handleToggle('enableAIContext')}
              />
              <span>AI Context Blocks</span>
            </label>
          </section>

          {/* MarkdownScript Section */}
          <section className="settings-section">
            <h3>MarkdownScript (.mdsc)</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableScripts}
                onChange={() => handleToggle('enableScripts')}
              />
              <span>Enable Script Execution</span>
            </label>
            <div className={`settings-subsection ${!settings.enableScripts ? 'disabled' : ''}`}>
              <label className="settings-select">
                <span>Security Level</span>
                <select
                  value={settings.scriptSecurityLevel}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    scriptSecurityLevel: e.target.value as ScriptSecurityLevel
                  })}
                  disabled={!settings.enableScripts}
                >
                  <option value="strict">Strict (Math, JSON only)</option>
                  <option value="standard">Standard (+ Date, Array, Promise)</option>
                  <option value="permissive">Permissive (+ fetch)</option>
                </select>
              </label>
              <p className="settings-hint">
                Scripts require explicit permission per file. Trusted files are remembered.
              </p>
            </div>
          </section>

          {/* Plugins Section - Link to Plugin Manager */}
          <section className="settings-section">
            <h3>Plugins</h3>
            <p className="settings-hint">
              {settings.enabledPlugins.length} plugins enabled
            </p>
            {onOpenPluginManager && (
              <button
                className="settings-btn secondary"
                onClick={() => {
                  onClose();
                  onOpenPluginManager();
                }}
                style={{ marginTop: '8px' }}
              >
                Open Plugin Manager
              </button>
            )}
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={() => onSettingsChange(DEFAULT_SETTINGS)}>
            Reset to Defaults
          </button>
          <button className="settings-btn primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
