
'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary py-4 mt-16 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        {t('rightsReserved', {year: currentYear})}
      </div>
    </footer>
  );
}
