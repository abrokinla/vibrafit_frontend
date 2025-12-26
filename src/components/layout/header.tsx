'use client';

import { Link, useRouter, usePathname } from '@/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dumbbell, MessageSquare, Bell } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslations } from 'next-intl';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useNotifications } from '@/hooks/useNotifications';

// Add these API functions
import { apiUrl, tokenManager } from '@/lib/api';

async function getAuthHeaders() {
  const token = tokenManager.getAccessToken();
  if (!token) throw new Error('NO_CREDENTIALS');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] text-[10px] font-medium">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Header() {
  const t = useTranslations('Header');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const currentPathname = usePathname();
  const router = useRouter();

  // Use real-time notifications hook
  const { unreadCount } = useNotifications();

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? tokenManager.getAccessToken() : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    setUserRole(role);

    if (token) {
      setIsLoggedIn(true);
      if (role === 'trainer') {
        setDashboardPath('/trainer/dashboard');
      } else if (role === 'admin') {
        setDashboardPath('/admin/dashboard');
      } else if (role === 'gym') {
        setDashboardPath('/gym/dashboard');
      } else {
        setDashboardPath('/user/dashboard');
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [currentPathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isOnboarded');
    setIsLoggedIn(false);
    router.push('/signin');
  };
  
  const messagesPath = userRole === 'trainer' ? '/trainer/messages' : '/user/messages';

  if (isLoggedIn === null) return null; 

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Dumbbell className="h-6 w-6" />
          <span>{t('appName')}</span>
        </Link>
        <nav className="flex items-center gap-1 md:gap-2">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href={messagesPath as any}>
                  <MessageSquare />
                  {isClient && <CountBadge count={unreadCount} />}
                  <span className="sr-only">{t('messagesButton')}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell />
                {isClient && <CountBadge count={0} />}
                <span className="sr-only">{t('notificationsButton')}</span>
              </Button>
              <Link href={dashboardPath as any} passHref>
                <Button variant="ghost" className="hidden sm:inline-flex">{t('dashboardButton')}</Button>
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
          <ThemeSwitcher />
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
