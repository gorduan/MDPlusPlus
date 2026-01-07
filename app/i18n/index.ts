/**
 * i18n Configuration for MD++ Renderer Process
 *
 * Dynamically loads translations from the main process.
 * New languages can be added by simply creating JSON files in the locale folders.
 * Falls back to English for missing translations.
 *
 * Plugin translations are loaded dynamically from each plugin's i18n folder.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import core translations (statically imported for bundling)
// These serve as fallback when dynamic loading fails
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

/**
 * Language info type
 */
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Known language metadata for display purposes
 * This is used when we receive language codes from the main process
 */
const LANGUAGE_METADATA: Record<string, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  de: { name: 'German', nativeName: 'Deutsch' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
  fr: { name: 'French', nativeName: 'Français' },
  es: { name: 'Spanish', nativeName: 'Español' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  pl: { name: 'Polish', nativeName: 'Polski' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  uk: { name: 'Ukrainian', nativeName: 'Українська' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  zh: { name: 'Chinese', nativeName: '中文' },
  ko: { name: 'Korean', nativeName: '한국어' },
  ar: { name: 'Arabic', nativeName: 'العربية' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी' },
  tr: { name: 'Turkish', nativeName: 'Türkçe' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  th: { name: 'Thai', nativeName: 'ไทย' },
  cs: { name: 'Czech', nativeName: 'Čeština' },
  sv: { name: 'Swedish', nativeName: 'Svenska' },
  da: { name: 'Danish', nativeName: 'Dansk' },
  fi: { name: 'Finnish', nativeName: 'Suomi' },
  no: { name: 'Norwegian', nativeName: 'Norsk' },
  hu: { name: 'Hungarian', nativeName: 'Magyar' },
  ro: { name: 'Romanian', nativeName: 'Română' },
  bg: { name: 'Bulgarian', nativeName: 'Български' },
  hr: { name: 'Croatian', nativeName: 'Hrvatski' },
  sk: { name: 'Slovak', nativeName: 'Slovenčina' },
  sl: { name: 'Slovenian', nativeName: 'Slovenščina' },
  et: { name: 'Estonian', nativeName: 'Eesti' },
  lv: { name: 'Latvian', nativeName: 'Latviešu' },
  lt: { name: 'Lithuanian', nativeName: 'Lietuvių' },
  el: { name: 'Greek', nativeName: 'Ελληνικά' },
  he: { name: 'Hebrew', nativeName: 'עברית' },
  id: { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  ms: { name: 'Malay', nativeName: 'Bahasa Melayu' },
  ca: { name: 'Catalan', nativeName: 'Català' },
  eu: { name: 'Basque', nativeName: 'Euskara' },
  gl: { name: 'Galician', nativeName: 'Galego' },
};

/**
 * Statically bundled translations
 * These are always available as fallback
 */
const bundledResources: Record<string, Record<string, unknown>> = {
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
 * Available languages (dynamically updated from main process)
 */
let availableLanguages: string[] = Object.keys(bundledResources);
let supportedLanguagesInfo: LanguageInfo[] = availableLanguages.map(code => ({
  code,
  ...LANGUAGE_METADATA[code] || { name: code.toUpperCase(), nativeName: code.toUpperCase() }
}));

/**
 * Get language info from metadata
 */
function getLanguageInfo(code: string): LanguageInfo {
  const metadata = LANGUAGE_METADATA[code];
  if (metadata) {
    return { code, ...metadata };
  }
  return {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
  };
}

/**
 * Update available languages from main process
 * Called when app initializes to get dynamically discovered languages
 */
export function updateAvailableLanguages(languages: LanguageInfo[]): void {
  supportedLanguagesInfo = languages;
  availableLanguages = languages.map(l => l.code);
  console.log(`[i18n] Updated available languages: ${availableLanguages.join(', ')}`);
}

/**
 * Get list of supported languages
 */
export function getSupportedLanguages(): LanguageInfo[] {
  return supportedLanguagesInfo;
}

// Legacy export for backward compatibility
export const SUPPORTED_LANGUAGES = supportedLanguagesInfo;
export type SupportedLanguage = string;

/**
 * Initialize i18n for the renderer process
 */
export function initI18n(initialLanguage: string = 'en') {
  // Normalize language code (e.g., 'de-DE' -> 'de')
  const normalizedLang = normalizeLanguageCode(initialLanguage);

  i18n
    .use(initReactI18next)
    .init({
      resources: bundledResources,
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
 * Add translations for a new language dynamically
 * Used when a new language is discovered that wasn't in the bundle
 */
export function addLanguageTranslations(
  langCode: string,
  translations: Record<string, unknown>
): void {
  for (const [namespace, content] of Object.entries(translations)) {
    if (i18n.hasResourceBundle(langCode, namespace)) {
      i18n.addResourceBundle(langCode, namespace, content, true, true);
    } else {
      i18n.addResourceBundle(langCode, namespace, content);
    }
  }

  // Update available languages if not already present
  if (!availableLanguages.includes(langCode)) {
    availableLanguages.push(langCode);
    supportedLanguagesInfo.push(getLanguageInfo(langCode));
  }

  console.log(`[i18n] Added translations for language: ${langCode}`);
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
export function normalizeLanguageCode(code: string): string {
  const shortCode = code.split('-')[0].toLowerCase();

  // Check if the language is available
  if (availableLanguages.includes(shortCode)) {
    return shortCode;
  }

  // Fallback to English
  return 'en';
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  const shortCode = code.split('-')[0].toLowerCase();
  return availableLanguages.includes(shortCode);
}

/**
 * Get display name for a language code
 */
export function getLanguageDisplayName(code: string): string {
  const lang = supportedLanguagesInfo.find(l => l.code === code);
  return lang ? lang.nativeName : code;
}

export default i18n;
