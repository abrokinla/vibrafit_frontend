import type { ReactNode } from 'react';
import UserSidebar from '@/components/user/user-sidebar';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <UserSidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
