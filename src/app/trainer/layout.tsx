
// src/app/trainer/layout.tsx
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Import SheetHeader and SheetTitle
import TrainerSidebarContent from '@/components/trainer/trainer-sidebar-content'; // Will be created

export default function TrainerLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-4rem)]"> {/* Full height below main header */}
        <Sidebar
          collapsible="icon"
          side="left"
          variant="sidebar"
          className="top-16 bg-card border-r print:hidden" // Positions below main header
        >
          <TrainerSidebarContent />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Trigger */}
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
// See comments in user/layout.tsx. The same logic applies here.
// The actual SheetContent instance needing a title is likely within the Sidebar component's mobile rendering logic.
// Change will be made to src/components/ui/sidebar.tsx
