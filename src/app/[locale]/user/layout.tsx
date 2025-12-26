// src/app/[locale]/user/layout.tsx
'use client';

export const runtime = 'edge';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import UserSidebarContent from '@/components/user/user-sidebar-content';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';
import { useEffect, useState } from 'react';
import { tokenManager, apiUrl } from '@/lib/api';

interface User {
  id: number;
  email: string;
  email_verified?: boolean;
  role?: string;
}

export default function UserLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = tokenManager.getAccessToken();
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          setLoading(false);
          return;
        }

        const response = await fetch(apiUrl(`/users/${userId}/`), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <SidebarProvider mobileSheetTitle="User Menu"> {/* Pass title for mobile sheet */}
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          collapsible="icon"
          side="left"
          variant="sidebar"
          className="top-16 bg-card border-r print:hidden"
        >
          <UserSidebarContent />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden p-4 border-b sticky top-0 bg-background z-10 print:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto p-2 md:p-8">
            {!loading && <EmailVerificationBanner user={user} />}
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
