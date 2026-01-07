/**
 * i18n Configuration for Electron Main Process
 *
 * Dynamically discovers and loads available languages.
 * New languages can be added by simply creating JSON files in the locale folders.
 * Falls back to English for missing translations.
 */

import i18n from 'i18next';
import { join } from 'path';
import {
  discoverLanguages,
  getSupportedLanguages,
  loadLocaleTranslations,
  normalizeLanguageCode as normalizeCode,
  LanguageInfo,
} from './languageDiscovery';

// Path to locales directory (relative to this file's compiled location)
let localesPath: string;
let pluginsPath: string | undefined;
let availableLanguages: string[] = ['en'];
let supportedLanguages: LanguageInfo[] = [{ code: 'en', name: 'English', nativeName: 'English' }];

// Create a separate i18n instance for main process
const i18nMain = i18n.createInstance();

/**
 * Set paths for language discovery
 * Must be called before initMainI18n
 */
export function setI18nPaths(locales: string, plugins?: string): void {
  localesPath = locales;
  pluginsPath = plugins;
  console.log(`[i18n] Set locales path: ${localesPath}`);
  if (pluginsPath) {
    console.log(`[i18n] Set plugins path: ${pluginsPath}`);
  }
}

/**
 * Discover and return available languages
 * Call this after setI18nPaths
 */
export function discoverAvailableLanguages(): string[] {
  if (!localesPath) {
    console.warn('[i18n] Locales path not set, using default');
    localesPath = join(__dirname, 'locales');
  }

  availableLanguages = discoverLanguages(localesPath);
  supportedLanguages = getSupportedLanguages(localesPath, pluginsPath);

  console.log(`[i18n] Discovered languages: ${availableLanguages.join(', ')}`);
  return availableLanguages;
}

/**
 * Get list of supported languages with metadata
 */
export function getSupportedLanguagesList(): LanguageInfo[] {
  return supportedLanguages;
}

/**
 * Get list of available language codes
 */
export function getAvailableLanguages(): string[] {
  return availableLanguages;
}

/**
 * Build resources object by dynamically loading all translations
 */
function buildResources(): Record<string, Record<string, unknown>> {
  const resources: Record<string, Record<string, unknown>> = {};

  for (const langCode of availableLanguages) {
    const translations = loadLocaleTranslations(localesPath, langCode);
    if (Object.keys(translations).length > 0) {
      resources[langCode] = translations;
    }
  }

  // Ensure English exists as fallback
  if (!resources.en) {
    resources.en = {};
  }

  return resources;
}

/**
 * Initialize i18n for the main process
 */
export function initMainI18n(initialLanguage: string = 'en'): typeof i18nMain {
  // Discover languages if not already done
  if (availableLanguages.length <= 1) {
    discoverAvailableLanguages();
  }

  const normalizedLang = normalizeLanguageCode(initialLanguage);
  const resources = buildResources();

  // Get all namespaces from English (as the reference)
  const namespaces = resources.en ? Object.keys(resources.en) : ['menu', 'dialogs'];

  i18nMain.init({
    resources,
    lng: normalizedLang,
    fallbackLng: 'en',
    defaultNS: 'menu',
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
  });

  console.log(`[i18n] Main process initialized with language: ${normalizedLang}`);
  console.log(`[i18n] Available languages: ${availableLanguages.join(', ')}`);
  console.log(`[i18n] Namespaces: ${namespaces.join(', ')}`);

  return i18nMain;
}

/**
 * Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
 */
export function normalizeLanguageCode(code: string): string {
  return normalizeCode(code, availableLanguages);
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  const shortCode = code.split('-')[0].toLowerCase();
  return availableLanguages.includes(shortCode);
}

/**
 * Change language in main process
 */
export function changeMainLanguage(lng: string): void {
  const normalizedLang = normalizeLanguageCode(lng);
  i18nMain.changeLanguage(normalizedLang);
  console.log(`[i18n] Main process language changed to: ${normalizedLang}`);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return i18nMain.language;
}

/**
 * Translation function for main process
 */
export function t(key: string, options?: object): string {
  return i18nMain.t(key, options);
}

// Re-export types
export type { LanguageInfo };

export default i18nMain;
