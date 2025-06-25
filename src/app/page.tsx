'use client';
export const runtime = 'edge';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const userLang = navigator.language || 'en';
    const locale = userLang.startsWith('es') ? 'es' : 'en';
    router.replace(`/${locale}`);
  }, [router]);

  return null;
}
