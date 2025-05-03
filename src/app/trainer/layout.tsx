import type { ReactNode } from 'react';
// import TrainerSidebar from '@/components/trainer/trainer-sidebar'; // Optional: Add sidebar later if needed

export default function TrainerLayout({ children }: { children: ReactNode }) {
  // For now, a simple layout. Could add specific trainer navigation later.
  return (
    <div className="p-8">
      {/* <TrainerSidebar /> */}
      {/* <main className="flex-1 p-8"> */}
        {children}
      {/* </main> */}
    </div>
  );
}
