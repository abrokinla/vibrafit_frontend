'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Scale, Dumbbell, Apple, LogOut, User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useRef, useState, useEffect } from 'react';
import { getUserData, UserData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { uploadProfilePicture } from '@/lib/utils';


const navItems = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/measurements', label: 'Measurements', icon: Scale },
  { href: '/user/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/user/nutrition', label: 'Nutrition', icon: Apple },
];

// Simulate fetching user data (replace with actual context/API call)
interface UserSidebarData {
  name: string;
  profilePictureUrl: string | null;
}

export default function UserSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<UserSidebarData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserData();
        setUserData({
          name: data.name,
          profilePictureUrl: data.profilePictureUrl,
        });
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        console.error('Failed to load sidebar user:', err);
        toast({
          title: 'Error',
          description: 'Could not load user info.',
          variant: 'destructive',
        });
      }
    };
    load();
  }, [router, toast]);

  // 2) Trigger file picker
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const result = await uploadProfilePicture(file);
        if (result.success && result.newUrl) {
          setUserData(prev => prev ? { ...prev, profilePictureUrl: result.newUrl } : null);
          toast({
            title: "Profile Picture Updated",
            description: "Your new profile picture has been set.",
          });
        } else {
           toast({
            title: "Upload Failed",
            description: "Could not upload your profile picture.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        toast({
            title: "Error",
            description: "An unexpected error occurred during upload.",
            variant: "destructive",
        });
      } finally {
        setIsUploading(false);
         // Reset file input to allow re-uploading the same file if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    toast({ title: "Signed Out", description: "You have been signed out." });
    router.push('/signin');
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col min-h-[calc(100vh-4rem)] sticky top-16">
      {/* Profile Picture Section */}
      <div className="p-4 border-b flex flex-col items-center space-y-2">
        <Avatar
          className="h-24 w-24 cursor-pointer ring-2 ring-offset-2 ring-primary hover:ring-accent transition-all"
          onClick={handleAvatarClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
        >
          {userData?.profilePictureUrl ? (
            <AvatarImage src={userData.profilePictureUrl} alt={userData?.name || 'User'} />
          ) : (
             <AvatarFallback className="text-3xl">
                {isUploading ? <Upload className="h-8 w-8 animate-pulse" /> : <User className="h-10 w-10" />}
            </AvatarFallback>
          )}
        </Avatar>        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          className="hidden"
          disabled={isUploading}
          style={{ display: 'none' }}
        />
        {userData?.name && <p className="text-sm font-medium">{userData.name}</p>}
        <Button variant="link" size="sm" onClick={handleAvatarClick} disabled={isUploading} className="text-xs p-0 h-auto">
          {isUploading ? 'Uploading...' : 'Change Picture'}
        </Button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                pathname === item.href && 'bg-primary/10 text-primary'
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Sign Out Section */}
      <div className="px-4 py-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
