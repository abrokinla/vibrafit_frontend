'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/navigation';
import { locales as appLocalesConfig } from '../i18n-config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange = (newLocale: string) => {
    router.replace(pathname as any, { locale: newLocale });        
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger className="w-auto md:w-[130px] text-xs md:text-sm pl-2 pr-1 md:pl-3 md:pr-2 py-1 h-9">
        <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <div className="hidden md:block">
                <SelectValue placeholder={t('placeholder')} />
            </div>
        </div>
      </SelectTrigger>
      <SelectContent align="end">
        {(appLocalesConfig as readonly string[]).map((loc) => (
          <SelectItem key={loc} value={loc}>
            {loc === 'en' ? t('english') : t('spanish')}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}