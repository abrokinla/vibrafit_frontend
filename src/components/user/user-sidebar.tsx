'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scale, Dumbbell, Apple, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/measurements', label: 'Measurements', icon: Scale },
  { href: '/user/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/user/nutrition', label: 'Nutrition', icon: Apple },
];

export default function UserSidebar() {
  const pathname = usePathname();

  // TODO: Implement actual sign out logic
  const handleSignOut = () => {
    console.log('Signing out...');
    // Redirect to sign-in or home page after sign out
    // router.push('/signin');
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col min-h-[calc(100vh-4rem)] sticky top-16"> {/* Adjust min-h based on header height */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                pathname === item.href && 'bg-primary/10 text-primary'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
      <div className="px-4 py-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
