/**
 * i18n Configuration for MD++
 * Supports: English, German, Dutch, French, Spanish, Portuguese
 *
 * Plugin translations are loaded dynamically from each plugin's i18n folder.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import core translations (not plugin-specific)
import enCommon from './locales/en/common.json';
import enMenu from './locales/en/menu.json';
import enDialogs from './locales/en/dialogs.json';
import enHelp from './locales/en/help.json';

import deCommon from './locales/de/common.json';
import deMenu from './locales/de/menu.json';
import deDialogs from './locales/de/dialogs.json';
import deHelp from './locales/de/help.json';

import nlCommon from './locales/nl/common.json';
import nlMenu from './locales/nl/menu.json';
import nlDialogs from './locales/nl/dialogs.json';
import nlHelp from './locales/nl/help.json';

import frCommon from './locales/fr/common.json';
import frMenu from './locales/fr/menu.json';
import frDialogs from './locales/fr/dialogs.json';
import frHelp from './locales/fr/help.json';

import esCommon from './locales/es/common.json';
import esMenu from './locales/es/menu.json';
import esDialogs from './locales/es/dialogs.json';
import esHelp from './locales/es/help.json';

import ptCommon from './locales/pt/common.json';
import ptMenu from './locales/pt/menu.json';
import ptDialogs from './locales/pt/dialogs.json';
import ptHelp from './locales/pt/help.json';

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

// Core translation resources (without plugin translations)
const resources = {
  en: {
    common: enCommon,
    menu: enMenu,
    dialogs: enDialogs,
    help: enHelp,
  },
  de: {
    common: deCommon,
    menu: deMenu,
    dialogs: deDialogs,
    help: deHelp,
  },
  nl: {
    common: nlCommon,
    menu: nlMenu,
    dialogs: nlDialogs,
    help: nlHelp,
  },
  fr: {
    common: frCommon,
    menu: frMenu,
    dialogs: frDialogs,
    help: frHelp,
  },
  es: {
    common: esCommon,
    menu: esMenu,
    dialogs: esDialogs,
    help: esHelp,
  },
  pt: {
    common: ptCommon,
    menu: ptMenu,
    dialogs: ptDialogs,
    help: ptHelp,
  },
};

/**
 * Initialize i18n for the renderer process
 */
export function initI18n(initialLanguage: string = 'en') {
  // Normalize language code (e.g., 'de-DE' -> 'de')
  const normalizedLang = normalizeLanguageCode(initialLanguage);

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: normalizedLang,
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'menu', 'dialogs', 'help'],
      interpolation: {
        escapeValue: false, // React already escapes
      },
      react: {
        useSuspense: false,
      },
    });

  return i18n;
}

/**
 * Plugin translation type
 */
export interface PluginTranslation {
  name: string;
  description: string;
  toolbar?: Record<string, string>;
  settings?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Add plugin translations to i18n
 * Each plugin's translations are added as a separate namespace: plugin-{pluginId}
 *
 * @param pluginId - The plugin identifier (e.g., 'katex', 'mermaid')
 * @param translations - Object mapping language codes to translation objects
 */
export function addPluginTranslations(
  pluginId: string,
  translations: Record<string, PluginTranslation>
): void {
  const namespace = `plugin-${pluginId}`;

  for (const [lang, translation] of Object.entries(translations)) {
    if (i18n.hasResourceBundle(lang, namespace)) {
      // Merge with existing translations
      i18n.addResourceBundle(lang, namespace, translation, true, true);
    } else {
      // Add new resource bundle
      i18n.addResourceBundle(lang, namespace, translation);
    }
  }
}

/**
 * Get plugin translation for the current language
 * Falls back to English if the translation doesn't exist
 *
 * @param pluginId - The plugin identifier
 * @param key - The translation key (e.g., 'name', 'toolbar.group')
 * @returns The translated string or the key if not found
 */
export function getPluginTranslation(pluginId: string, key: string): string {
  const namespace = `plugin-${pluginId}`;
  return i18n.t(`${namespace}:${key}`, { defaultValue: key });
}

/**
 * Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
 */
export function normalizeLanguageCode(code: string): SupportedLanguage {
  const shortCode = code.split('-')[0].toLowerCase();
  const supported = SUPPORTED_LANGUAGES.find(l => l.code === shortCode);
  return supported ? supported.code : 'en';
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  const shortCode = code.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.some(l => l.code === shortCode);
}

/**
 * Get display name for a language code
 */
export function getLanguageDisplayName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
}

export default i18n;
