import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Dumbbell className="h-6 w-6" />
          <span>Vibrafit</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Placeholder for future authenticated user links */}
          {/* <Link href="/dashboard" passHref>
            <Button variant="ghost">Dashboard</Button>
          </Link> */}
          <Link href="/signin" passHref>
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/signup" passHref>
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
