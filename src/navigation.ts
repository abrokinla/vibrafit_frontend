// src/navigation.ts
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './i18n-config';

// Define routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/signin': '/signin',
    '/signup': '/signup',
    '/forgot-password': '/forgot-password',
    '/timeline': '/timeline',
    '/admin/dashboard': '/admin/dashboard',
    '/gym/dashboard': '/gym/dashboard',
    '/trainer/dashboard': '/trainer/dashboard',
    '/trainer/profile': '/trainer/profile',
    '/trainer/routines': '/trainer/routines',
    '/trainer/presets': '/trainer/presets',
    '/trainer/messages': '/trainer/messages',
    '/trainer/requests': '/trainer/requests',
    '/user/dashboard': '/user/dashboard',
    '/user/find-trainer': '/user/find-trainer',
    '/user/find-trainer/[trainerId]':'/user/find-trainer/[trainerId]',
    '/profile/[userId]':'/profile/[userId]',
    '/user/measurements': '/user/measurements',
    '/user/nutrition': '/user/nutrition',
    '/user/profile': '/user/profile',
    '/user/workouts': '/user/workouts',
    '/user/messages': '/user/messages',
  }
});
