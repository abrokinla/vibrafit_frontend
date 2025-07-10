// src/components/trainer/trainer-sidebar-content.tsx
'use client';

import { Link, useRouter, usePathname } from '@/navigation'; 
import { LayoutDashboard, ClipboardList, User, LogOut, Upload, MessageSquare, Users, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getUserData, UserData } from '@/lib/api'; 
import { uploadProfilePicture } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface TrainerSidebarData { 
  name: string;
  profilePictureUrl: string | null;
}

export default function TrainerSidebarContent() {
  const t = useTranslations('TrainerSidebar');
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trainerData, setTrainerData] = useState<TrainerSidebarData | null>(null); 
  const [isUploading, setIsUploading] = useState(false);

  const navItems = [
    { href: '/trainer/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { href: '/timeline', label: t('timeline'), icon: Users },
    { href: '/trainer/requests', label: t('pendingRequests'), icon: BellRing },
    { href: '/trainer/routines', label: t('clientRoutines'), icon: ClipboardList },
    { href: '/trainer/messages', label: t('messages'), icon: MessageSquare },
    { href: '/trainer/profile', label: t('myProfile'), icon: User },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUserData();
        setTrainerData({ 
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
      }
    };
    load();
  }, [router]);

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
          setTrainerData(prev => prev ? { ...prev, profilePictureUrl: result.newUrl } : null);
          toast({
            title: t('toastProfilePicUpdatedTitle'),
            description: t('toastProfilePicUpdatedDesc'),
          });
        } else {
           toast({
            title: t('toastUploadFailedTitle'),
            description: t('toastUploadFailedDesc'),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error);
        toast({
            title: t('toastErrorTitle'),
            description: t('toastErrorDesc'),
            variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    toast({ title: t('toastSignedOutTitle'), description: t('toastSignedOutDesc') });
    router.push('/signin');
  };

  return (
    <>
      <SidebarHeader className="p-4 group-data-[state=expanded]/sidebar:border-b">
        <div className="flex flex-col items-center space-y-2 group-data-[state=collapsed]/sidebar:hidden">
          <Avatar
            className="h-24 w-24 cursor-pointer ring-2 ring-offset-2 ring-primary hover:ring-accent transition-all"
            onClick={handleAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
            data-ai-hint="trainer avatar"
          >
            {trainerData?.profilePictureUrl ? (
              <AvatarImage src={trainerData.profilePictureUrl} alt={trainerData?.name || 'Trainer'} />
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
          {trainerData?.name && <p className="text-sm font-medium">{trainerData.name}</p>}
          <Button variant="link" size="sm" onClick={handleAvatarClick} disabled={isUploading} className="text-xs p-0 h-auto text-primary">
            {isUploading ? t('uploading') : t('changePicture')}
          </Button>
        </div>
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
                   data-ai-hint="trainer avatar small"
                >
                  {trainerData?.profilePictureUrl ? (
                    <AvatarImage src={trainerData.profilePictureUrl} alt={trainerData?.name || 'Trainer'} />
                  ) : (
                     <AvatarFallback className="text-xl bg-muted">
                       {isUploading ? <Upload className="h-5 w-5 animate-pulse text-primary" /> : <User className="h-6 w-6 text-muted-foreground" />}
                     </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>{trainerData?.name || t('trainerProfileTooltip')}</p>
                <p className="text-xs text-muted-foreground">{t('changePicture')}</p>
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
              <Link href={item.href as any}>
                <SidebarMenuButton
                  variant={pathname.startsWith(item.href) ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname.startsWith(item.href) && 'bg-primary/10 text-primary font-semibold'
                  )}
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, side: "right", align: "center" }}
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
            <SidebarMenuButton variant="ghost" className="w-full justify-start" onClick={handleSignOut} tooltip={{children: t('signOut'), side:"right", align:"center"}}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="group-data-[[data-state=collapsed]]/sidebar:hidden">{t('signOut')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
