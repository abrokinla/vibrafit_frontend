// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './i18n-config';

export default getRequestConfig(async ({ requestLocale }) => {
  const resolvedLocale = await requestLocale;
  const currentLocaleToLoad = locales.includes(resolvedLocale as any)
    ? (resolvedLocale as typeof locales[number])
    : defaultLocale;

  try {
    const messages = (await import(`./messages/${currentLocaleToLoad}.json`)).default;
    return {
      messages,
      locale: currentLocaleToLoad
    };
  } catch (error) {
    const fallbackMessages = (await import(`./messages/${defaultLocale}.json`)).default;
    return {
      messages: fallbackMessages,
      locale: defaultLocale
    };
  }
});