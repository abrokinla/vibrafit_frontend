'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, MessageSquare, ClipboardList, BellRing } from "lucide-react";
import { Link, useRouter } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import OnboardingModal from '@/components/trainer/onboarding-modal';
import TrainerRecentActivityFeed from '@/components/trainer/TrainerRecentActivityFeed';
import { useToast } from "@/hooks/use-toast";
import { getUserData, UserData, fetchPendingSubscriptions, fetchConversations, fetchActiveClientCount } from '@/lib/api';
import { useTranslations } from 'next-intl';

export default function TrainerDashboardPage() {
  const t = useTranslations('TrainerDashboardPage');
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const [trainerData, setTrainerData] = useState({
    clientCount: 0,
    unreadMessages: 0,
    pendingActions: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingUser(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const userData = await getUserData();
        setUser(userData);
        if (!userData.is_onboarded) setShowOnboarding(true);

        // Fetch stats
        const [pendingSubs, conversations, activeClientCount] = await Promise.all([
          fetchPendingSubscriptions(),
          fetchConversations(),
          fetchActiveClientCount(),
        ]);

        const unreadMessages = conversations.reduce((sum, conv) => sum + conv.unread_count, 0);

        setTrainerData({
          clientCount: activeClientCount,
          unreadMessages,
          pendingActions: pendingSubs.length,
        });
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({ 
          title: t('errorLoadProfile'), 
          description: err.message || t('errorLoadProfileDescription'), 
          variant: 'destructive' 
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadData();
  }, [router, toast, t]);

  const handleOnboardingClose = async () => {
    try {
      const updatedUser = await getUserData();
      setUser(updatedUser);
      setShowOnboarding(!updatedUser.is_onboarded);
    } catch (error) {
      toast({ 
        title: t('refreshErrorToastTitle'), 
        description: t('refreshErrorToastDescription'), 
        variant: 'destructive' 
      });
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
            <p className="text-xs text-muted-foreground">{t('clientsFromLastMonth', { count: 0 })}</p>
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
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.pendingActions}</div>
            <Link href="/trainer/requests" className="text-xs text-primary hover:underline">
              {t('reviewRequestsLink')}
            </Link>
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
          <TrainerRecentActivityFeed limit={5} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('clientManagementTitle')}</CardTitle>
          <CardDescription>{t('clientManagementDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{t('clientManagementPlaceholder')}</p>
          {/* TODO: Implement client management section */}
          {/* Suggestions:
             - Fetch list of active clients using fetchActiveClients
             - Display client cards with names, profile pictures, and links to profiles or routines
             - Example structure:
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
               {clients.map(client => (
                 <Card key={client.id}>
                   <CardContent>
                     <p>{client.name}</p>
                     <Link href={`/trainer/clients/${client.id}`}>View Profile</Link>
                   </CardContent>
                 </Card>
               ))}
             </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
}