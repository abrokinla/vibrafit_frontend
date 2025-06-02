'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dashboardPath, setDashboardPath] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;

    if (token) {
      setIsLoggedIn(true);
      if (role === 'trainer') {
        setDashboardPath('/trainer/dashboard');
      } else {
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
          <span>Vibrafit</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href={dashboardPath}>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
