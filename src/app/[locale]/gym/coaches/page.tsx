// src/app/[locale]/gym/coaches/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCheck, ArrowLeft, Users, Loader2, Star } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchMyGyms, fetchGymTrainers, GymData, AdminTrainerData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function GymCoachesPage() {
  const t = useTranslations('GymCoachesPage');
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymData | null>(null);
  const [loadingGyms, setLoadingGyms] = useState(true);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<AdminTrainerData[]>([]);

  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymData = await fetchMyGyms();
        setGyms(gymData);
        if (gymData.length > 0) {
          setSelectedGym(gymData[0]);
        }
      } catch (error) {
        console.error('Failed to load gyms:', error);
        toast({
          title: t('errorLoadingGyms'),
          description: t('errorLoadingGymsDesc'),
          variant: 'destructive',
        });
      } finally {
        setLoadingGyms(false);
      }
    };

    loadGyms();
  }, [toast, t]);

  useEffect(() => {
    const loadCoaches = async () => {
      if (!selectedGym) {
        setCoaches([]);
        return;
      }

      setLoadingCoaches(true);
      try {
        const trainerData = await fetchGymTrainers(selectedGym.id);
        setCoaches(trainerData);
      } catch (error) {
        console.error('Failed to load coaches:', error);
        toast({
          title: t('errorLoadingCoaches'),
          description: t('errorLoadingCoachesDesc'),
          variant: 'destructive',
        });
      } finally {
        setLoadingCoaches(false);
      }
    };

    loadCoaches();
  }, [selectedGym, toast, t]);

  if (gyms.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <UserCheck className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noGymsTitle')}</h3>
            <p className="text-muted-foreground mb-4">{t('noGymsDescription')}</p>
            <Link href="/gym/dashboard" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {t('backToDashboard')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/gym/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {t('coachesManagement')} {!loadingCoaches && `(${coaches.length})`}
          </CardTitle>
          <CardDescription>{t('coachesManagementDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingGyms || loadingCoaches ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : coaches.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-1">{t('noCoachesTitle')}</h3>
              <p className="text-muted-foreground">{t('noCoachesDesc')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coaches.map((coach) => (
                <div key={coach.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={undefined} alt={coach.name || coach.email} />
                      <AvatarFallback>{(coach.name || coach.email || 'T').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{coach.name || t('unknownCoach')}</p>
                      <p className="text-sm text-muted-foreground">{coach.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('experienceYears', { years: coach.experience_years ?? 0 })}
                      </p>
                      {coach.specializations ? (
                        <p className="text-xs mt-1">{t('specializations')}: {coach.specializations}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">
                      <Star className="h-3 w-3 mr-1" />
                      {coach.rating?.toFixed(1) ?? '0.0'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {t('clientsCount', { count: coach.active_clients ?? 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
