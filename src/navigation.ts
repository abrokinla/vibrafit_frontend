// src/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './i18n';

// Define routing configuration
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
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
  }
});

// Create navigation using the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = 
  createNavigation(routing);