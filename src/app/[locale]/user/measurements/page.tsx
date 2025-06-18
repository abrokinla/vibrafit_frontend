// src/app/[locale]/user/measurements/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, TrendingUp, Loader2 } from "lucide-react";
import ProgressOverviewChart from '@/components/user/progress-overview-chart'; 
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import { getUserData, saveUserProfile, UserData } from '@/lib/api'; // Import API functions

export default function MeasurementsPage() {
  const t = useTranslations('MeasurementsPage');
  const { toast } = useToast();
  const [weight, setWeight] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [bodyFat, setBodyFat] = useState<number | string>(''); // Assuming bodyFat is part of UserData now
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
        try {
            const data = await getUserData(); // Fetch user data which includes measurements
            setWeight(data.weight || '');
            setHeight(data.height || '');
            setBodyFat(data.bodyFat || ''); // Assuming bodyFat exists on UserData
            if (data.updated_at) { // Use updated_at from UserData if available
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
      const measurementsToSave: Partial<UserData> = {};
      if (weight !== '') measurementsToSave.weight = parseFloat(String(weight));
      if (height !== '') measurementsToSave.height = parseFloat(String(height));
      if (bodyFat !== '') measurementsToSave.bodyFat = parseFloat(String(bodyFat));


      const result = await saveUserProfile(measurementsToSave); // Use saveUserProfile
      if (result.success) {
         setLastUpdated(new Date().toLocaleString()); 
         toast({
            title: t('toastUpdatedTitle'),
            description: t('toastUpdatedDesc'),
          });
      } else {
         toast({
            title: t('toastUpdateFailedTitle'),
            description: t('toastUpdateFailedDesc'),
            variant: "destructive",
          });
      }
    } catch (error: any) {
      console.error("Failed to save measurements:", error);
      toast({
        title: t('toastErrorSaveTitle'),
        description: error.message || t('toastErrorSaveDesc'),
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     // Allow empty string, numbers, and numbers with a single decimal point
     if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setter(value); 
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
               <div className="h-10 bg-muted rounded animate-pulse"></div>
               <div className="h-10 bg-muted rounded animate-pulse"></div>
               <div className="h-10 bg-muted rounded animate-pulse"></div>
               <div className="h-10 w-28 bg-muted rounded animate-pulse mt-2"></div>
             </div>
           ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" /> {t('weightLabel')}
                  </Label>
                  <Input
                    id="weight"
                    type="text" // Use text to allow better control with regex
                    inputMode="decimal" // Hint for mobile keyboards
                    placeholder={t('weightPlaceholder')}
                    value={weight}
                    onChange={handleInputChange(setWeight)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                     <Ruler className="h-4 w-4" /> {t('heightLabel')}
                  </Label>
                  <Input
                    id="height"
                    type="text"
                    inputMode="decimal"
                    placeholder={t('heightPlaceholder')}
                    value={height}
                    onChange={handleInputChange(setHeight)}
                     disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> {t('bodyFatLabel')}
                  </Label>
                  <Input
                    id="bodyFat"
                    type="text"
                    inputMode="decimal"
                    placeholder={t('bodyFatPlaceholder')}
                    value={bodyFat}
                     onChange={handleInputChange(setBodyFat)}
                    disabled={isSaving}
                  />
                </div>
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

