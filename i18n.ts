// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
export const locales = ['en', 'es'] as const;
export const defaultLocale = 'es' as const;
export type Locale = typeof locales[number];

console.warn('[next-intl] src/i18n.ts: File loaded. Defining getRequestConfig.');

export default getRequestConfig(async ({locale}) => {
  let currentLocaleToLoad = locale as Locale;
  console.warn(`[next-intl] src/i18n.ts: getRequestConfig called with requested locale: ${locale}`);

  if (!locales.includes(currentLocaleToLoad)) {
    console.warn(`[next-intl] src/i18n.ts: Invalid locale "${currentLocaleToLoad}" received. Falling back to defaultLocale "${defaultLocale}".`);
    currentLocaleToLoad = defaultLocale;
  }

  let messages;
  try {
    console.warn(`[next-intl] src/i18n.ts: Attempting to load messages for locale "${currentLocaleToLoad}" from "./messages/${currentLocaleToLoad}.json"`);
    // Use relative path from src/i18n.ts to src/messages/
    messages = (await import(`./messages/${currentLocaleToLoad}.json`)).default;
    console.warn(`[next-intl] src/i18n.ts: Successfully loaded messages for locale "${currentLocaleToLoad}".`);
  } catch (error) {
    console.error(`[next-intl] src/i18n.ts: CRITICAL - Failed to load messages for locale "${currentLocaleToLoad}" (path: ./messages/${currentLocaleToLoad}.json). Error:`, error);
    
    if (currentLocaleToLoad !== defaultLocale) {
      console.warn(`[next-intl] src/i18n.ts: Attempting to load messages for defaultLocale "${defaultLocale}" as fallback from "./messages/${defaultLocale}.json".`);
      try {
        messages = (await import(`./messages/${defaultLocale}.json`)).default;
        console.warn(`[next-intl] src/i18n.ts: Successfully loaded messages for defaultLocale "${defaultLocale}".`);
        currentLocaleToLoad = defaultLocale;
      } catch (defaultLocaleError) {
        console.error(`[next-intl] src/i18n.ts: CRITICAL - Failed to load messages for defaultLocale "${defaultLocale}" (path: ./messages/${defaultLocale}.json). Error:`, defaultLocaleError);
        messages = {};
      }
    } else {
      console.error(`[next-intl] src/i18n.ts: CRITICAL - Failed to load messages for defaultLocale "${defaultLocale}" (which was the current locale).`);
      messages = {};
    }
  }

  return {
    messages,
    locale: currentLocaleToLoad
  };
});