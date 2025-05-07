'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Scale, Dumbbell, Apple, LogOut, User, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useRef, useState, useEffect } from 'react'; // Added React and hooks
import { useToast } from '@/hooks/use-toast';


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

async function fetchUserData(): Promise<UserSidebarData> {
  // await new Promise(resolve => setTimeout(resolve, 200)); // Simulate delay
  return {
    name: 'Alex Rider', // Example
    profilePictureUrl: null, // Example: 'https://picsum.photos/100' or null
  };
}

// Simulate uploading image (replace with actual API call)
async function uploadProfilePicture(file: File): Promise<{ success: boolean, newUrl?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Uploading file:", file.name);
    // In a real app, upload to storage and get URL
    return { success: true, newUrl: URL.createObjectURL(file) }; // Simulate success and return local URL for preview
}


export default function UserSidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<UserSidebarData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUserData().then(setUserData);
  }, []);

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
    console.log('Signing out...');
    // TODO: Implement actual sign out logic (e.g., Firebase signOut, clear context/token)
    // router.push('/signin'); // Example redirect
    toast({ title: "Signed Out", description: "You have been successfully signed out."});
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
