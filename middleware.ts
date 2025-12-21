// middleware.ts (next-intl v4+ compatible)
import createI18nMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n-config';

export default createI18nMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except static files and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
