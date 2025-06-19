// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './src/i18n-config';

export default getRequestConfig(async ({ request }) => {
  const requestLocale = request?.headers.get('x-next-intl-locale');

  console.warn(`[next-intl] src/i18n.ts: getRequestConfig called with requestLocale: ${requestLocale}`);

  const currentLocaleToLoad = locales.includes(requestLocale as any)
    ? (requestLocale as typeof locales[number])
    : defaultLocale;

  try {
    const messages = (await import(`./messages/${currentLocaleToLoad}.json`)).default;
    console.warn(`[next-intl] Loaded messages for locale: ${currentLocaleToLoad}`);
    return {
      messages,
      locale: currentLocaleToLoad
    };
  } catch (error) {
    console.error(
      `[next-intl] Failed to load messages for "${currentLocaleToLoad}". Falling back to default locale "${defaultLocale}".`,
      error
    );

    const fallbackMessages = (await import(`./messages/${defaultLocale}.json`)).default;
    return {
      messages: fallbackMessages,
      locale: defaultLocale
    };
  }
});