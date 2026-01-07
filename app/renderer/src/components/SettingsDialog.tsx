/**
 * MD++ Settings Dialog Component
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProfileSelector from './ProfileSelector';
import ProfileModificationDialog from './ProfileModificationDialog';
import ThemeSelector from './ThemeSelector';
import type { Profile, ProfileModificationAction } from '../types/profiles';
import type { Theme } from '../types/themes';
import { getSupportedLanguages } from '../../../i18n';

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

  // Theme (reference to theme ID, stored in profiles)
  defaultThemeId: string;
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
  // Default theme
  defaultThemeId: 'dark',
};

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParserSettings;
  onSettingsChange: (settings: ParserSettings) => void;
  onOpenPluginManager?: () => void;
  /** Profile management props */
  profiles?: Profile[];
  activeProfile?: Profile;
  hasCustomProfile?: boolean;
  onSelectProfile?: (id: string) => void;
  onCreateProfile?: (name: string) => void;
  onDeleteProfile?: (id: string) => void;
  onRenameProfile?: (id: string, newName: string) => void;
  onModificationAction?: (action: ProfileModificationAction, pendingSettings: ParserSettings) => void;
  isNameTaken?: (name: string, excludeId?: string) => boolean;
  /** Theme props (simple mode - selection only) */
  themes?: Theme[];
  activeTheme?: Theme;
  onSelectDefaultTheme?: (themeId: string) => void;
}

export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onOpenPluginManager,
  profiles,
  activeProfile,
  hasCustomProfile = false,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onRenameProfile,
  onModificationAction,
  isNameTaken,
  themes,
  activeTheme,
  onSelectDefaultTheme,
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation('common');

  // State for profile modification dialog
  const [showModificationDialog, setShowModificationDialog] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<ParserSettings | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Handle language change
  const handleLanguageChange = async (newLanguage: string) => {
    try {
      // Update renderer i18n
      await i18n.changeLanguage(newLanguage);
      setCurrentLanguage(newLanguage);

      // Notify main process to update menus and save setting
      await window.electronAPI.setLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Check if profile management is enabled
  const hasProfileSupport = !!(
    profiles &&
    activeProfile &&
    onSelectProfile &&
    onCreateProfile &&
    onDeleteProfile &&
    onRenameProfile &&
    onModificationAction &&
    isNameTaken
  );

  if (!isOpen) return null;

  const handleSettingsChange = (newSettings: ParserSettings) => {
    // If active profile is read-only, show modification dialog
    if (hasProfileSupport && activeProfile?.isReadOnly) {
      setPendingSettings(newSettings);
      setShowModificationDialog(true);
    } else {
      onSettingsChange(newSettings);
    }
  };

  const handleModificationAction = (action: ProfileModificationAction) => {
    setShowModificationDialog(false);
    if (pendingSettings && onModificationAction) {
      onModificationAction(action, pendingSettings);
    }
    setPendingSettings(null);
  };

  const handleToggle = (key: keyof ParserSettings) => {
    if (typeof settings[key] === 'boolean') {
      handleSettingsChange({ ...settings, [key]: !settings[key] });
    }
  };


  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-dialog" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>{t('settings.title')}</h2>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* Profile Selector */}
          {hasProfileSupport && (
            <section className="settings-section profile-section">
              <ProfileSelector
                profiles={profiles!}
                activeProfile={activeProfile!}
                hasCustomProfile={hasCustomProfile}
                onSelectProfile={onSelectProfile!}
                onCreateProfile={onCreateProfile!}
                onDeleteProfile={onDeleteProfile!}
                onRenameProfile={onRenameProfile!}
                isNameTaken={isNameTaken!}
              />
            </section>
          )}

          {/* Language Selector */}
          <section className="settings-section">
            <h3>{t('settings.language')}</h3>
            <label className="settings-select">
              <select
                value={currentLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                {getSupportedLanguages().map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </label>
          </section>

          {/* Default Theme Selector (simple mode - selection only) */}
          {themes && activeTheme && onSelectDefaultTheme && (
            <section className="settings-section">
              <h3>{t('settings.appearance')}</h3>
              <ThemeSelector
                themes={themes}
                activeTheme={activeTheme}
                onSelectTheme={onSelectDefaultTheme}
                label={`${t('settings.defaultTheme')}:`}
                simpleMode
              />
              <p className="settings-hint">
                {t('settings.defaultThemeDescription')}
              </p>
            </section>
          )}

          {/* GFM Section */}
          <section className="settings-section">
            <h3>{t('settings.gfm')}</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableGfm}
                onChange={() => handleToggle('enableGfm')}
              />
              <span>{t('settings.gfmMasterSwitch')}</span>
            </label>
            <div className={`settings-subsection ${!settings.enableGfm ? 'disabled' : ''}`}>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableTables}
                  onChange={() => handleToggle('enableTables')}
                  disabled={!settings.enableGfm}
                />
                <span>{t('settings.tables')}</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableTaskLists}
                  onChange={() => handleToggle('enableTaskLists')}
                  disabled={!settings.enableGfm}
                />
                <span>{t('settings.taskLists')}</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableStrikethrough}
                  onChange={() => handleToggle('enableStrikethrough')}
                  disabled={!settings.enableGfm}
                />
                <span>{t('settings.strikethrough')}</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableAutolinks}
                  onChange={() => handleToggle('enableAutolinks')}
                  disabled={!settings.enableGfm}
                />
                <span>{t('settings.autolinks')}</span>
              </label>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.enableFootnotes}
                  onChange={() => handleToggle('enableFootnotes')}
                  disabled={!settings.enableGfm}
                />
                <span>{t('settings.footnotes')}</span>
              </label>
            </div>
          </section>

          {/* Core Features Section */}
          <section className="settings-section">
            <h3>{t('settings.coreFeatures')}</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableHeadingAnchors}
                onChange={() => handleToggle('enableHeadingAnchors')}
              />
              <span>Heading Anchors</span>
            </label>
            <p className="settings-hint" style={{ marginTop: '12px' }}>
              {t('settings.mathKatex')}, {t('settings.mermaidDiagrams')}, Callouts → <strong>{t('plugins.title')}</strong>
            </p>
          </section>

          {/* MD++ Features Section */}
          <section className="settings-section">
            <h3>{t('settings.mdppFeatures')}</h3>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableDirectives}
                onChange={() => handleToggle('enableDirectives')}
              />
              <span>{t('settings.componentDirectives')} (:::plugin:component)</span>
            </label>
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={settings.enableAIContext}
                onChange={() => handleToggle('enableAIContext')}
              />
              <span>{t('settings.aiContextBlocks')}</span>
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
                  onChange={(e) => handleSettingsChange({
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
            <h3>{t('plugins.title')}</h3>
            <p className="settings-hint">
              {settings.enabledPlugins.length} {t('plugins.enabled').toLowerCase()}
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
                {t('plugins.title')}
              </button>
            )}
          </section>
        </div>

        <div className="settings-footer">
          <button className="settings-btn secondary" onClick={() => handleSettingsChange(DEFAULT_SETTINGS)}>
            {t('common.reset')}
          </button>
          <button className="settings-btn primary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>

      {/* Profile Modification Dialog */}
      {hasProfileSupport && (
        <ProfileModificationDialog
          isOpen={showModificationDialog}
          hasCustomProfile={hasCustomProfile}
          sourceProfileName={activeProfile?.name || ''}
          onAction={handleModificationAction}
          isNameTaken={(name) => isNameTaken!(name)}
        />
      )}
    </div>
  );
}
