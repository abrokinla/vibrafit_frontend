// src/app/[locale]/user/measurements/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, TrendingUp, Loader2 } from "lucide-react";
import ProgressOverviewChart from '@/components/user/progress-overview-chart'; 
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { getUserData, saveMetrics } from '@/lib/api';
import { useRouter } from "next/navigation";

const METRIC_FIELDS = [
  { id: 'weight', label: 'Weight (kg)', icon: Scale },
  { id: 'height', label: 'Height (cm)', icon: Ruler },
  { id: 'body_fat', label: 'Body Fat (%)', icon: TrendingUp },
  { id: 'bmi', label: 'BMI', icon: TrendingUp },
  { id: 'muscle_mass', label: 'Muscle Mass (kg)', icon: TrendingUp },
  { id: 'waist_circumference', label: 'Waist Circumference (cm)', icon: TrendingUp },
];

export default function MeasurementsPage() {
  const t = useTranslations('MeasurementsPage');
  const router = useRouter();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<Record<string, number | string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    
    const fetchData = async () => {
    try {
      const data = await getUserData();
      const initialMetrics = {
          weight: data.metrics?.weight ?? '',
          height: data.metrics?.height ?? '',
          body_fat: data.metrics?.body_fat ?? '',
          bmi: data.metrics?.bmi ?? '',
          muscle_mass: data.metrics?.muscle_mass ?? '',
          waist_circumference: data.metrics?.waist_circumference ?? '',
        };
        setMetrics(initialMetrics);
        if (data.updated_at) {
          setLastUpdated(new Date(data.updated_at).toLocaleString());
        }
      } catch (error: any) {
        toast({
          title: t('toastErrorLoadTitle'),
          description: error.message || t('toastErrorLoadDesc'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast, t]);
   const handleSaveChanges = async () => {
    setIsSaving(true);

    try {
      const metricsToSave: { type: string; value: number }[] = [];

      for (const [type, value] of Object.entries(metrics)) {
        if (value !== '' && !isNaN(Number(value))) {
          metricsToSave.push({ type, value: parseFloat(String(value)) });
        }
      }
      const result = await saveMetrics(metricsToSave);

      if (!result.success) {
        throw new Error(result.message || "Metric update failed.");
      }

      setLastUpdated(new Date().toLocaleString());

      toast({
        title: t('toastUpdatedTitle'),
        description: t('toastUpdatedDesc'),
      });
    } catch (error: any) {
      if (error?.response?.status === 401 || error?.message?.includes("401")) {
        toast({
          title: t('sessionExpiredTitle') || "Session expired",
          description: t('sessionExpiredDesc') || "Please sign in again.",
          variant: "destructive",
        });

        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        toast({
          title: t('toastErrorSaveTitle'),
          description: error.message || t('toastErrorSaveDesc'),
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMetrics(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const lastUpdatedText = lastUpdated
    ? t('lastUpdated', { date: lastUpdated })
    : t('noUpdatesRecorded');

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{t('updateMetricsTitle')}</CardTitle>
        <CardDescription>{lastUpdatedText}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
            ))}
            <div className="h-10 w-28 bg-muted rounded animate-pulse mt-2"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {METRIC_FIELDS.map(({ id, label, icon: Icon }) => (
                <div className="space-y-2" key={id}>
                  <Label htmlFor={id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" /> {t(`${id}Label`, { default: label })}
                  </Label>
                  <Input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    placeholder={t(`${id}Placeholder`, { default: label })}
                    value={metrics[id] ?? ''}
                    onChange={handleInputChange(id)}
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? t('savingButton') : t('saveButton')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('progressChartTitle')}</CardTitle>
          <CardDescription>{t('progressChartDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="h-[250px] bg-muted rounded animate-pulse"></div>
          ) : (
            <ProgressOverviewChart /> // Assuming this chart fetches its own data or can receive it
          )}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
          {t('chartDataDisclaimer')}
        </CardFooter>
      </Card>
    </div>
  );
}

