// src/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './i18n';

export const localePrefix = 'always'; // Consistent with middleware.ts

// Define pathnames - use string values for non-localized routes
export const pathnames = {
  '/': '/',
  '/signin': '/signin',
  '/signup': '/signup',
  '/admin/dashboard': '/admin/dashboard',
  '/trainer/dashboard': '/trainer/dashboard',
  '/trainer/profile': '/trainer/profile',
  '/trainer/routines': '/trainer/routines',
  '/user/dashboard': '/user/dashboard',
  '/user/find-trainer': '/user/find-trainer',
  '/user/find-trainer/[trainerId]': {
    en: '/user/find-trainer/[trainerId]',
    es: '/user/buscar-entrenador/[trainerId]',
  },
  '/user/measurements': '/user/measurements',
  '/user/nutrition': '/user/nutrition',
  '/user/profile': '/user/profile',
  '/user/workouts': '/user/workouts',
} as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
  pathnames,
  localePrefix
});