'use client'; // Add this directive

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setIsLoggedIn(false);

      // Redirect to sign in if not on auth or landing page
      const publicRoutes = ['/', '/signin', '/signup'];
      if (!publicRoutes.includes(pathname)) {
        router.push('/signin');
      }
    } else {
      setIsLoggedIn(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('isOnboarded');
    setIsLoggedIn(false);
    router.push('/signin');
  };
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Dumbbell className="h-6 w-6" />
          <span>Vibrafit</span>
        </Link>
        <nav className="flex items-center gap-4">
        {!isLoggedIn ? (
            <>
              <Link href="/signin" passHref>
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup" passHref>
                <Button>Sign Up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" passHref>
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
