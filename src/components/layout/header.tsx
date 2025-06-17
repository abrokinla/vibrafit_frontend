
'use client';

import { Link, useRouter, usePathname } from '@/navigation'; // Use from new navigation config
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const t = useTranslations('Header');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string>('');
  const currentPathname = usePathname(); 
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    if (token) {
      setIsLoggedIn(true);
      if (role === 'trainer') {
        setDashboardPath('/trainer/dashboard');
      } else if (role === 'admin') {
        setDashboardPath('/admin/dashboard');
      }
      else {
        setDashboardPath('/user/dashboard');
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isOnboarded');
    setIsLoggedIn(false);
    router.push('/signin'); 
  };

  if (isLoggedIn === null) return null; 

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Dumbbell className="h-6 w-6" />
          <span>{t('appName')}</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          {isLoggedIn ? (
            <>
              <Link href={dashboardPath as any} passHref>
                <Button variant="ghost">{t('dashboardButton')}</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>{t('logoutButton')}</Button>
            </>
          ) : (
            <>
              <Link href="/signin" passHref>
                <Button variant="outline">{t('signInButton')}</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button>{t('signUpButton')}</Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
