/**
 * Dynamic Language Discovery for MD++
 *
 * Scans i18n folders to discover available languages.
 * New languages can be added by simply creating JSON files in the locale folders.
 * Falls back to English for missing translations.
 */

import { join, basename } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';

/**
 * Language metadata
 */
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
}

/**
 * Known language metadata for common languages
 * Add new entries here when adding new languages
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
 * Get language info with fallback for unknown languages
 */
export function getLanguageInfo(code: string): LanguageInfo {
  const metadata = LANGUAGE_METADATA[code];
  if (metadata) {
    return { code, ...metadata };
  }
  // Fallback: use code as name
  return {
    code,
    name: code.toUpperCase(),
    nativeName: code.toUpperCase(),
  };
}

/**
 * Discover available languages by scanning i18n locale directories
 *
 * @param localesPath - Path to the locales directory (e.g., app/i18n/locales)
 * @returns Array of discovered language codes
 */
export function discoverLanguages(localesPath: string): string[] {
  const languages = new Set<string>();

  try {
    if (!existsSync(localesPath)) {
      console.warn(`[i18n] Locales path does not exist: ${localesPath}`);
      return ['en']; // Always have English as fallback
    }

    const entries = readdirSync(localesPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Check if directory contains at least one .json file
        const langPath = join(localesPath, entry.name);
        const files = readdirSync(langPath);
        const hasJsonFiles = files.some(f => f.endsWith('.json'));

        if (hasJsonFiles) {
          languages.add(entry.name);
        }
      }
    }
  } catch (error) {
    console.error('[i18n] Error discovering languages:', error);
  }

  // Ensure English is always available
  languages.add('en');

  // Sort languages: English first, then alphabetically by code
  const sorted = Array.from(languages).sort((a, b) => {
    if (a === 'en') return -1;
    if (b === 'en') return 1;
    return a.localeCompare(b);
  });

  return sorted;
}

/**
 * Discover languages from plugin i18n directories
 *
 * @param pluginsPath - Path to the plugins directory
 * @returns Array of discovered language codes from all plugins
 */
export function discoverPluginLanguages(pluginsPath: string): string[] {
  const languages = new Set<string>();

  try {
    if (!existsSync(pluginsPath)) {
      return [];
    }

    const plugins = readdirSync(pluginsPath, { withFileTypes: true });

    for (const plugin of plugins) {
      if (plugin.isDirectory()) {
        const i18nPath = join(pluginsPath, plugin.name, 'i18n');

        if (existsSync(i18nPath)) {
          const files = readdirSync(i18nPath);

          for (const file of files) {
            if (file.endsWith('.json')) {
              const langCode = basename(file, '.json');
              languages.add(langCode);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[i18n] Error discovering plugin languages:', error);
  }

  return Array.from(languages);
}

/**
 * Get all supported languages by combining core and plugin languages
 *
 * @param localesPath - Path to core locales directory
 * @param pluginsPath - Optional path to plugins directory
 * @returns Array of LanguageInfo for all supported languages
 */
export function getSupportedLanguages(
  localesPath: string,
  pluginsPath?: string
): LanguageInfo[] {
  const coreLanguages = discoverLanguages(localesPath);
  const pluginLanguages = pluginsPath ? discoverPluginLanguages(pluginsPath) : [];

  // Combine and deduplicate
  const allCodes = new Set([...coreLanguages, ...pluginLanguages]);

  // Sort: English first, then alphabetically
  const sorted = Array.from(allCodes).sort((a, b) => {
    if (a === 'en') return -1;
    if (b === 'en') return 1;
    return a.localeCompare(b);
  });

  return sorted.map(code => getLanguageInfo(code));
}

/**
 * Load all translation files from a locale directory
 *
 * @param localesPath - Path to the locales directory
 * @param langCode - Language code (e.g., 'de')
 * @returns Object with namespace keys and translation objects
 */
export function loadLocaleTranslations(
  localesPath: string,
  langCode: string
): Record<string, unknown> {
  const translations: Record<string, unknown> = {};
  const langPath = join(localesPath, langCode);

  try {
    if (!existsSync(langPath)) {
      return translations;
    }

    const files = readdirSync(langPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const namespace = basename(file, '.json');
        const filePath = join(langPath, file);

        try {
          const content = readFileSync(filePath, 'utf-8');
          translations[namespace] = JSON.parse(content);
        } catch (error) {
          console.error(`[i18n] Error loading ${filePath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`[i18n] Error loading translations for ${langCode}:`, error);
  }

  return translations;
}

/**
 * Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
 */
export function normalizeLanguageCode(
  code: string,
  availableLanguages: string[]
): string {
  const shortCode = code.split('-')[0].toLowerCase();

  if (availableLanguages.includes(shortCode)) {
    return shortCode;
  }

  // Fallback to English
  return 'en';
}

/**
 * Check if a language is available
 */
export function isLanguageAvailable(
  code: string,
  availableLanguages: string[]
): boolean {
  const shortCode = code.split('-')[0].toLowerCase();
  return availableLanguages.includes(shortCode);
}
