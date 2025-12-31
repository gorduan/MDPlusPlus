/**
 * MD++ Settings Dialog Component
 */

import React from 'react';

export interface ParserSettings {
  // GFM Features
  enableGfm: boolean;
  enableTables: boolean;
  enableTaskLists: boolean;
  enableStrikethrough: boolean;
  enableAutolinks: boolean;
  enableFootnotes: boolean;

  // Extensions
  enableMath: boolean;
  enableMermaid: boolean;
  enableCallouts: boolean;
  enableHeadingAnchors: boolean;

  // MD++ Features
  enableDirectives: boolean;
  enableAIContext: boolean;

  // Plugins
  enabledPlugins: string[];
}

export const DEFAULT_SETTINGS: ParserSettings = {
  enableGfm: true,
  enableTables: true,
  enableTaskLists: true,
  enableStrikethrough: true,
  enableAutolinks: true,
  enableFootnotes: true,
  enableMath: true,
  enableMermaid: true,
  enableCallouts: true,
  enableHeadingAnchors: true,
  enableDirectives: true,
  enableAIContext: true,
  enabledPlugins: ['bootstrap', 'admonitions'],
};

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParserSettings;
  onSettingsChange: (settings: ParserSettings) => void;
  availablePlugins: string[];
}

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  availablePlugins,
}: SettingsDialogProps) {
  if (!isOpen) return null;

  const handleToggle = (key: keyof ParserSettings) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({ ...settings, [key]: !settings[key] });
    }
  };

  const handlePluginToggle = (plugin: string) => {
    const plugins = settings.enabledPlugins.includes(plugin)
      ? settings.enabledPlugins.filter(p => p !== plugin)
      : [...settings.enabledPlugins, plugin];
    onSettingsChange({ ...settings, enabledPlugins: plugins });
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

          {/* Extensions Section */}
          <section className="settings-section">
            <h3>Extensions</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableMath}
                onChange={() => handleToggle('enableMath')}
              />
              <span>Math / LaTeX (KaTeX)</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableMermaid}
                onChange={() => handleToggle('enableMermaid')}
              />
              <span>Mermaid Diagrams</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableCallouts}
                onChange={() => handleToggle('enableCallouts')}
              />
              <span>Callouts / Admonitions</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableHeadingAnchors}
                onChange={() => handleToggle('enableHeadingAnchors')}
              />
              <span>Heading Anchors</span>
            </label>
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

          {/* Plugins Section */}
          <section className="settings-section">
            <h3>Plugins</h3>
            {availablePlugins.map(plugin => (
              <label key={plugin} className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enabledPlugins.includes(plugin)}
                  onChange={() => handlePluginToggle(plugin)}
                />
                <span>{plugin}</span>
              </label>
            ))}
            {availablePlugins.length === 0 && (
              <p className="settings-hint">No plugins loaded</p>
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
