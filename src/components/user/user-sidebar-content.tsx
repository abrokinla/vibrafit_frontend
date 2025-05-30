
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Scale, Dumbbell, Apple, LogOut, User, Upload, Settings, Search } from 'lucide-react'; // Changed SearchUsers to Search
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUserData, UserData } from '@/lib/api';
import { uploadProfilePicture } from '@/lib/utils';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'; 
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'; 

const navItems = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/measurements', label: 'Measurements', icon: Scale },
  { href: '/user/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/user/nutrition', label: 'Nutrition & Goals', icon: Apple },
  { href: '/user/find-trainer', label: 'Find a Trainer', icon: Search }, // Changed SearchUsers to Search
  { href: '/user/profile', label: 'My Profile', icon: User },
];

interface UserSidebarData {
  name: string;
  profilePictureUrl: string | null;
}

// async function fetchUserData(): Promise<UserSidebarData> {
//   return {
//     name: 'Alex Rider',
//     profilePictureUrl: null,
//   };
// }

// async function uploadProfilePicture(file: File): Promise<{ success: boolean, newUrl?: string }> {
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   return { success: true, newUrl: URL.createObjectURL(file) };
// }

export default function UserSidebarContent() {
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
    toast({ title: "Signed Out", description: "You have been successfully signed out." });
    localStorage.clear(); // Clear local storage on sign out
    router.push('/signin');
  };

  return (
    <>
      <SidebarHeader className="p-4 group-data-[state=expanded]/sidebar:border-b">
        {/* Expanded View */}
        <div className="flex flex-col items-center space-y-2 group-data-[state=collapsed]/sidebar:hidden">
          <Avatar
            className="h-24 w-24 cursor-pointer ring-2 ring-offset-2 ring-primary hover:ring-accent transition-all"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
            data-ai-hint="profile avatar"
          >
            {userData?.profilePictureUrl ? (
              <AvatarImage src={userData.profilePictureUrl} alt={userData?.name || 'User'} />
            ) : (
              <AvatarFallback className="text-3xl bg-muted">
                {isUploading ? <Upload className="h-8 w-8 animate-pulse text-primary" /> : <User className="h-10 w-10 text-muted-foreground" />}
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
          <Button variant="link" size="sm" onClick={handleAvatarClick} disabled={isUploading} className="text-xs p-0 h-auto text-primary">
            {isUploading ? 'Uploading...' : 'Change Picture'}
          </Button>
        </div>

        {/* Collapsed View (Icon View) */}
        <div className="hidden flex-col items-center group-data-[state=expanded]/sidebar:hidden group-data-[state=collapsed]/sidebar:flex">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar
                  onClick={handleAvatarClick}
                  className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
                  data-ai-hint="profile avatar small"
                >
                  {userData?.profilePictureUrl ? (
                    <AvatarImage src={userData.profilePictureUrl} alt={userData?.name || 'User'} />
                  ) : (
                     <AvatarFallback className="text-xl bg-muted">
                       {isUploading ? <Upload className="h-5 w-5 animate-pulse text-primary" /> : <User className="h-6 w-6 text-muted-foreground" />}
                     </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{userData?.name || 'User Profile'}</p>
                <p className="text-xs text-muted-foreground">Click to change picture</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
           <input
            type="file"
            ref={fileInputRef} 
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 space-y-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-primary/10 text-primary font-semibold'
                  )}
                  isActive={pathname === item.href}
                  tooltip={{children: item.label, side: "right", align:"center"}}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="group-data-[[data-state=collapsed]]/sidebar:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[state=expanded]/sidebar:border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton variant="ghost" className="w-full justify-start" onClick={handleSignOut} tooltip={{children: "Sign Out", side:"right", align:"center"}}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="group-data-[[data-state=collapsed]]/sidebar:hidden">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
