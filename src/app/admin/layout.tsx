import type { ReactNode } from 'react';
// import AdminSidebar from '@/components/admin/admin-sidebar'; // Optional: Add sidebar later if needed

export default function AdminLayout({ children }: { children: ReactNode }) {
  // For now, a simple layout. Could add specific admin navigation later.
  return (
    <div className="p-8">
      {/* <AdminSidebar /> */}
      {/* <main className="flex-1 p-8"> */}
        {children}
      {/* </main> */}
    </div>
  );
}
