/**
 * i18n Configuration for Electron Main Process
 * Supports: English, German, Dutch, French, Spanish, Portuguese
 */

import i18n from 'i18next';

// Import all translations for main process (menu, dialogs)
import enMenu from './locales/en/menu.json';
import enDialogs from './locales/en/dialogs.json';

import deMenu from './locales/de/menu.json';
import deDialogs from './locales/de/dialogs.json';

import nlMenu from './locales/nl/menu.json';
import nlDialogs from './locales/nl/dialogs.json';

import frMenu from './locales/fr/menu.json';
import frDialogs from './locales/fr/dialogs.json';

import esMenu from './locales/es/menu.json';
import esDialogs from './locales/es/dialogs.json';

import ptMenu from './locales/pt/menu.json';
import ptDialogs from './locales/pt/dialogs.json';

// Supported languages
export const SUPPORTED_LANGUAGES = ['en', 'de', 'nl', 'fr', 'es', 'pt'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// All translation resources for main process
const resources = {
  en: {
    menu: enMenu,
    dialogs: enDialogs,
  },
  de: {
    menu: deMenu,
    dialogs: deDialogs,
  },
  nl: {
    menu: nlMenu,
    dialogs: nlDialogs,
  },
  fr: {
    menu: frMenu,
    dialogs: frDialogs,
  },
  es: {
    menu: esMenu,
    dialogs: esDialogs,
  },
  pt: {
    menu: ptMenu,
    dialogs: ptDialogs,
  },
};

// Create a separate i18n instance for main process
const i18nMain = i18n.createInstance();

/**
 * Initialize i18n for the main process
 */
export function initMainI18n(initialLanguage: string = 'en'): typeof i18nMain {
  const normalizedLang = normalizeLanguageCode(initialLanguage);

  i18nMain.init({
    resources,
    lng: normalizedLang,
    fallbackLng: 'en',
    defaultNS: 'menu',
    ns: ['menu', 'dialogs'],
    interpolation: {
      escapeValue: false,
    },
  });

  return i18nMain;
}

/**
 * Normalize language code (e.g., 'de-DE' -> 'de', 'en-US' -> 'en')
 */
export function normalizeLanguageCode(code: string): SupportedLanguage {
  const shortCode = code.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(shortCode as SupportedLanguage)) {
    return shortCode as SupportedLanguage;
  }
  return 'en';
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(code: string): boolean {
  const shortCode = code.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(shortCode as SupportedLanguage);
}

/**
 * Change language in main process
 */
export function changeMainLanguage(lng: string): void {
  const normalizedLang = normalizeLanguageCode(lng);
  i18nMain.changeLanguage(normalizedLang);
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

export default i18nMain;
