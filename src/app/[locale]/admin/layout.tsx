'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { tokenManager } from '@/lib/api';

export const runtime = 'edge';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenManager.getAccessToken();
        const userRole = localStorage.getItem('userRole');

        if (!token || userRole !== 'admin') {
          router.push('/signin');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        tokenManager.clearTokens();
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }
  return (
    <div className="flex gap-6 min-h-screen bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">Vibrafit Management</p>
        </div>

        <nav className="space-y-2">
          <NavLink href="/admin/dashboard" label="Dashboard" icon="📊" />
          
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Users & Roles</p>
            <NavLink href="/admin/users" label="All Users" icon="👥" />
            <NavLink href="/admin/trainers" label="Trainers" icon="🏋️" />
            <NavLink href="/admin/clients" label="Clients" icon="💪" />
            <NavLink href="/admin/subscriptions" label="Subscriptions" icon="🔐" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Gyms</p>
            <NavLink href="/admin/gyms" label="All Gyms" icon="🏢" />
            <NavLink href="/admin/gym-members" label="Gym Members" icon="📍" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Content</p>
            <NavLink href="/admin/plans" label="Training Plans" icon="📋" />
            <NavLink href="/admin/nutrition" label="Nutrition" icon="🍽️" />
            <NavLink href="/admin/posts" label="Timeline Posts" icon="📸" />
            <NavLink href="/admin/goals" label="Goals" icon="🎯" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Communication</p>
            <NavLink href="/admin/messages" label="Messages" icon="💬" />
            <NavLink href="/admin/conversations" label="Conversations" icon="🗨️" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">Analytics</p>
            <NavLink href="/admin/metrics" label="User Metrics" icon="📈" />
            <NavLink href="/admin/engagement" label="Engagement" icon="⭐" />
            <NavLink href="/admin/logs" label="Activity Logs" icon="📝" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">System</p>
            <NavLink href="/admin/settings" label="Settings" icon="⚙️" />
            <NavLink href="/admin/reports" label="Reports" icon="📊" />
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={async () => {
                try {
                  // Call logout endpoint to clear cookies
                  await fetch('/api/v1/users/auth/logout/', {
                    method: 'POST',
                    credentials: 'include', // Include cookies
                  });
                } catch (error) {
                  console.error('Logout error:', error);
                }

                // Clear local data
                localStorage.clear();
                tokenManager.clearTokens();

                // Redirect to signin
                router.push('/signin');
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors text-red-600 w-full text-left"
            >
              <span className="text-lg">🚪</span>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-foreground hover:text-foreground">
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
