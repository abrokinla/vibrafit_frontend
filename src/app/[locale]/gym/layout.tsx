// src/app/[locale]/gym/layout.tsx
export const runtime = 'edge';

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import GymSidebarContent from '@/components/gym/gym-sidebar-content';

export default function GymLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider mobileSheetTitle="Gym Menu">
      <div className="flex h-[calc(100vh-4rem)]"> 
        <Sidebar
          collapsible="icon"
          side="left"
          variant="sidebar"
          className="top-16 bg-card border-r print:hidden"
        >
          <GymSidebarContent />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden p-4 border-b sticky top-0 bg-background z-10 print:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
