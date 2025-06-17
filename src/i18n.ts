
// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
// import {notFound} from 'next/navigation'; // Avoid calling notFound directly from here for root layout

// These constants are now defined here and also exported for middleware/navigation
export const locales = ['en', 'es'] as const;
export const defaultLocale = 'es' as const;
export type Locale = typeof locales[number];

console.warn('[next-intl] src/i18n.ts: File loaded. Defining getRequestConfig.');

export default getRequestConfig(async ({locale}) => {
  let currentLocaleToLoad = locale as Locale; // Cast to Locale type
  console.warn(`[next-intl] src/i18n.ts: getRequestConfig called with requested locale: ${locale}`);

  // Validate that the incoming `locale` parameter is valid.
  if (!locales.includes(currentLocaleToLoad)) {
    console.warn(`[next-intl] src/i18n.ts: Invalid locale "${currentLocaleToLoad}" received. Falling back to defaultLocale "${defaultLocale}".`);
    currentLocaleToLoad = defaultLocale;
  }

  let messages;
  try {
    console.warn(`[next-intl] src/i18n.ts: Attempting to load messages for locale "${currentLocaleToLoad}" from "./messages/${currentLocaleToLoad}.json"`);
    messages = (await import(`./messages/${currentLocaleToLoad}.json`)).default;
    console.warn(`[next-intl] src/i18n.ts: Successfully loaded messages for locale "${currentLocaleToLoad}".`);
  } catch (error) {
    console.error(`[next-intl] src/i18n.ts: Failed to load messages for locale "${currentLocaleToLoad}" (path: ./messages/${currentLocaleToLoad}.json). Error:`, error);

    // If the primary attempt failed (even if currentLocaleToLoad was already defaultLocale),
    // explicitly try to load defaultLocale messages as a last resort, if not already tried.
    if (currentLocaleToLoad !== defaultLocale) {
      console.warn(`[next-intl] src/i18n.ts: Attempting to load messages for defaultLocale "${defaultLocale}" as fallback.`);
      try {
        messages = (await import(`./messages/${defaultLocale}.json`)).default;
        console.warn(`[next-intl] src/i18n.ts: Successfully loaded messages for defaultLocale "${defaultLocale}".`);
      } catch (defaultLocaleError) {
        console.error(`[next-intl] src/i18n.ts: CRITICAL - Failed to load messages for defaultLocale "${defaultLocale}" (path: ./messages/${defaultLocale}.json). Error:`, defaultLocaleError);
        // Fallback to empty messages to prevent app crash.
        // This indicates a missing default message file, which is a critical setup error.
        messages = {};
      }
    } else {
      // This means loading for defaultLocale (which was currentLocaleToLoad) already failed.
      console.error(`[next-intl] src/i18n.ts: CRITICAL - Failed to load messages for defaultLocale "${defaultLocale}" (which was the current locale).`);
      messages = {};
    }
  }

  return {
    messages,
    locale: currentLocaleToLoad // Ensure the resolved locale is returned
  };
});

