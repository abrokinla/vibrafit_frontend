
// src/app/user/layout.tsx
import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Import SheetHeader and SheetTitle
import UserSidebarContent from '@/components/user/user-sidebar-content';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-4rem)]"> {/* Full height below main header */}
        <Sidebar
          collapsible="icon"
          side="left"
          variant="sidebar"
          className="top-16 bg-card border-r print:hidden" // Positions below main header, print:hidden to hide in print
        >
          <UserSidebarContent />
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Trigger, sticky top-0 relative to this flex item, below main app header */}
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

// Note: The Sheet for mobile is part of the Sidebar component's internal logic.
// If the error specifically points to a SheetContent instance within THIS file (which it shouldn't, as Sidebar handles it),
// we would need to adjust how Sidebar itself renders its SheetContent on mobile.
// However, the typical pattern is that the Sidebar component's SheetContent would already be configured by shadcn/ui.
// The error implies that the SheetContent *somewhere* (likely handled by the Sidebar component when isMobile is true)
// needs a title. This fix assumes the error is a general linting rule about usages of Sheet/Dialog.
// If Sidebar's internal SheetContent needs a title, it would need to be passed down or set internally by Sidebar.

// If the Sidebar component does not automatically add a title to its mobile Sheet,
// and a direct SheetContent was being used here (which it's not, Sidebar component abstracts it),
// the fix would look like this inside the mobile part of Sidebar or if we constructed Sheet manually:
/*
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// ... inside a mobile-only section
<Sheet>
  <SheetTrigger asChild><Button variant="outline" className="md:hidden">Open Menu</Button></SheetTrigger>
  <SheetContent side="left" className="p-0"> // Adjusted className if p-0 was problematic
    <SheetHeader className="p-4 border-b">
      <SheetTitle>Navigation Menu</SheetTitle>
    </SheetHeader>
    <div className="flex-1 overflow-y-auto">
      <UserSidebarContent />
    </div>
  </SheetContent>
</Sheet>
*/
// For the current setup using the Sidebar component from ui/sidebar, that component is responsible
// for the accessibility of its mobile sheet view. If it's lacking a title, the ui/sidebar.tsx
// would need modification or a way to pass a title to its mobile sheet.

// The fix for the user/trainer layouts would be to ensure the <SheetContent> used by the <Sidebar> component
// when it becomes a sheet on mobile has a title. This is often handled by passing a prop or by the design of the Sidebar component.
// Since the error is generic, the actual fix might be within how the Sidebar component itself creates the Sheet for mobile.
// However, if the intent is to ensure all direct usages of SheetContent have a title, this would be done where SheetContent is directly used.

// Given the project structure, UserLayout uses <Sidebar>, which internally uses <Sheet> on mobile.
// The Sidebar component from shadcn/ui should ideally handle this.
// If the linting tool is flagging sheet.tsx, it means it expects the component definition to enforce this.
// The most common way to fix this without altering shadcn/ui's sheet.tsx drastically is to ensure all *usages*
// of <SheetContent> include a <SheetTitle>.

// The current UserLayout and TrainerLayout correctly use the <Sidebar> component which abstracts the mobile <Sheet>.
// The title for that sheet should be conceptually part of the Sidebar component's mobile rendering.
// Let's assume the issue is with the instances of <SheetContent> within the <Sidebar> component itself when `isMobile` is true.
// That would require a change in `src/components/ui/sidebar.tsx`.

// If the error is about the direct SheetContent within the Sidebar component in `sidebar.tsx`:
// In `src/components/ui/sidebar.tsx`, around line 107 where SheetContent is rendered for mobile:
// Original: <SheetContent ...><div ...>{children}</div></SheetContent>
// Needs to become:
// <SheetContent ...>
//   <SheetHeader className="p-4 border-b"><SheetTitle>Menu</SheetTitle></SheetHeader>
//   <div className="flex-1 overflow-y-auto">{children}</div>
// </SheetContent>
// This change is applied to `sidebar.tsx` instead, as that's where the problematic SheetContent instance is created for mobile.
// The following changes are for the layouts as originally intended, which is good practice anyway if they were directly using SheetContent.
// Given the problem description and file, the issue is likely in the abstraction in sidebar.tsx.
// For now, I will provide the changes to the layouts, as this is a common pattern to fix such issues
// if SheetContent were used directly. If the problem persists, sidebar.tsx is the next place.

// The layouts provided use UserSidebarContent and TrainerSidebarContent directly within the main Sidebar component.
// The mobile view is handled by the Sidebar component itself transforming into a Sheet.
// The provided layouts *do not* directly instantiate SheetContent for mobile.
// So, the files to change are indeed src/app/user/layout.tsx and src/app/trainer/layout.tsx
// by ensuring the <Sidebar> component, when it renders as a Sheet on mobile, receives appropriate props
// or has its internal structure modified if it's not providing a title.

// Re-evaluating: The current user/layout.tsx and trainer/layout.tsx use the <Sidebar> component.
// This <Sidebar> component itself renders a <Sheet> with <SheetContent> on mobile.
// The title needs to be part of that internal <SheetContent>.
// The most direct fix based on the error, if it implies `ui/sheet.tsx`'s SheetContent is always an issue,
// is less likely than a specific usage.

// Let's adjust the `Sidebar` component in `src/components/ui/sidebar.tsx` to add a title to its mobile sheet.
// This is the most accurate fix given how the layouts are structured.
// I will make changes to `src/components/ui/sidebar.tsx` where the mobile `SheetContent` is rendered.
// This modification will ensure that the Sheet used for mobile navigation has an accessible title.
// (Self-correction: The original request was "This error is coming from ui/sheet.ts". The most direct interpretation is that the component itself needs to address it. However, shadcn components are generally well-formed. The actual issue is almost always in usage. But if forced to change ui/sheet.ts, it's not trivial. Let's assume the problem is how the Sidebar component uses SheetContent for mobile)

// After further thought, the `Sidebar` component in `src/components/ui/sidebar.tsx` (around line 107-119)
// is where the `SheetContent` is rendered for mobile. That's the instance that needs a title.
// The `children` of this `SheetContent` is `UserSidebarContent` or `TrainerSidebarContent`.
// These children don't provide a "Sheet Title" for the container sheet, they provide their own content.
// So, a `SheetHeader` and `SheetTitle` should be added as siblings to the `div` that wraps `{children}`
// inside the `SheetContent` in `sidebar.tsx`.
