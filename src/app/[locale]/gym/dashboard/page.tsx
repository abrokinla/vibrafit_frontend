// src/app/[locale]/gym/dashboard/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, Settings, Building, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchMyGyms, GymData, getUserData, tokenManager } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from '@/navigation';
import GymOnboardingModal from '@/components/gym/onboarding-modal';
import Link from 'next/link';
import { UserData } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}

export default function GymDashboardPage() {
  const t = useTranslations('GymDashboardPage');
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingUser(true);
      const token = tokenManager.getAccessToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const userData = await getUserData();
        setUser(userData);
        if (!userData.is_onboarded) setShowOnboarding(true);

        // Only load gyms if user is onboarded
        if (userData.is_onboarded) {
          const gymData = await fetchMyGyms();
          setGyms(gymData);
          if (gymData.length > 0) {
            setSelectedGym(gymData[0]);
          }
        }
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({
          title: t('errorLoadProfile'),
          variant: 'destructive',
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
      // Reload gyms after onboarding is complete
      if (updatedUser.is_onboarded) {
        const gymData = await fetchMyGyms();
        setGyms(gymData);
        if (gymData.length > 0) {
          setSelectedGym(gymData[0]);
        }
      }
    } catch (error) {
      toast({
        title: 'Error refreshing data',
        description: 'Please refresh the page',
        variant: 'destructive',
      });
    }
  };

  if (isLoadingUser || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Building className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('title', { gymName: 'Your Gym' })}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noGymsTitle')}</h3>
            <p className="text-muted-foreground mb-4">{t('noGymsDescription')}</p>
            <Link href="/gym/settings" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {t('createGym')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gym = selectedGym || gyms[0];

  if (!gym) {
    // Fallback if no gym is available (should not happen with proper flow)
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Building className="h-10 w-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{t('title', { gymName: 'Your Gym' })}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading gym details...</h3>
          <p className="text-muted-foreground mb-4">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {showOnboarding && (
        <GymOnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          userId={user.id.toString()}
          gymId={gyms.length > 0 ? gyms[0].id.toString() : ''}
        />
      )}

       <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building className="h-10 w-10 text-primary" />
          <div>
              <h1 className="text-3xl font-bold">{t('title', { gymName: gym?.name || 'Your Gym' })}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {gyms.length > 1 && (
          <select
            value={selectedGym?.id || gyms[0].id}
            onChange={(e) => {
              const gymId = parseInt(e.target.value);
              const gym = gyms.find(g => g.id === gymId);
              setSelectedGym(gym || null);
            }}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
       </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gym.member_count.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('clientsSinceLastMonth', { count: 12 })}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('maxMembers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gym.max_members}</div>
             <p className="text-xs text-muted-foreground">{t('maxCapacity')}</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('subscriptionStatus')}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{gym.subscription_status}</div>
             <p className="text-xs text-muted-foreground">{t('subscriptionStatusDesc')}</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
          <Link href="/gym/clients">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{t('clientManagementTitle')}</CardTitle>
                <CardDescription>{t('clientManagementDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <Users className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>

           <Link href="/gym/coaches">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle>{t('coachManagementTitle')}</CardTitle>
                <CardDescription>{t('coachManagementDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <UserCheck className="h-12 w-12 text-primary" />
                </div>
              </CardContent>
            </Card>
          </Link>
       </div>
    </div>
  );
}
