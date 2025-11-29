// src/app/[locale]/gym/coaches/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowLeft, Users } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchMyGyms, GymData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function GymCoachesPage() {
  const t = useTranslations('GymCoachesPage');
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    loadGyms();
  }, [toast, t]);

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
            {t('coachesManagement')}
          </CardTitle>
          <CardDescription>{t('coachesManagementDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('comingSoon')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('coachesFeatureDesc')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('contactSupport')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
