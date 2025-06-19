// src/app/[locale]/admin/layout.tsx
import type { ReactNode } from 'react';
export const runtime = 'edge';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-8">
        {children}
    </div>
  );
}
