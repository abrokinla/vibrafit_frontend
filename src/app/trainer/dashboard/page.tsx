
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, MessageSquare, ClipboardList } from "lucide-react";
import { Link, useRouter } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import OnboardingModal from '@/components/trainer/onboarding-modal';
import { useToast } from "@/hooks/use-toast";
import { getUserData, UserData } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function TrainerDashboardPage() {
  const t = useTranslations('TrainerDashboardPage');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const [trainerData, setTrainerData] = useState({
    clientCount: 0,
    unreadMessages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const data = await getUserData();
        setUser(data);
        if (!data.is_onboarded) setShowOnboarding(true);
        else setShowOnboarding(false);
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({ title: t('errorLoadProfile'), variant: 'destructive' });
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, [router, toast, t]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`https://vibrafit.onrender.com/api/users/${user.id}/`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(res => { if (!res.ok) throw new Error('Could not load trainer'); return res.json(); })
      .then((tr: { clientCount: number; unreadMessages: number }) => {
        setTrainerData({ clientCount: tr.clientCount ?? 0, unreadMessages: tr.unreadMessages ?? 0 });
      })
      .catch(console.error);
  }, [user]);

  const handleOnboardingClose = async () => {
    try {
      const updatedUser = await getUserData();
      setUser(updatedUser);
      setShowOnboarding(!updatedUser.is_onboarded);
    } catch (error) {
      toast({ title: t('refreshErrorToastTitle'), description: t('refreshErrorToastDescription'), variant: 'destructive' });
    }
  };

  if (isLoadingUser || !user) return <Card className="shadow-sm p-4">{t('loadingUser')}</Card>;
  
  return (    
    <div className="space-y-8">
      {showOnboarding && (
        <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} userId={user.id.toString()} />
      )}
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.clientCount}</div>
            <p className="text-xs text-muted-foreground">{t('clientsFromLastMonth', { count: 2})}</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('unreadMessages')}</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.unreadMessages}</div>
             <p className="text-xs text-muted-foreground">{t('messagesRequireAttention')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingActions')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">{t('pendingActionsExample')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('clientRoutines')}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground mb-2">{t('manageRoutinesDescription')}</p>
            <Link href="/trainer/routines" passHref>
                <Button size="sm" className="w-full">{t('manageRoutinesButton')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('recentClientActivityTitle')}</CardTitle>
          <CardDescription>{t('recentClientActivityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground text-center py-4">{t('noRecentClientActivity')}</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('clientManagementTitle')}</CardTitle>
          <CardDescription>{t('clientManagementDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground text-center py-8">{t('clientManagementPlaceholder')}</p>
        </CardContent>
      </Card>
    </div>
  );
}

    