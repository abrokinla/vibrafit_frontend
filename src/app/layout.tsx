// src/app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vibrafit",
  description: "Your personalized fitness journey tracker and motivator.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
