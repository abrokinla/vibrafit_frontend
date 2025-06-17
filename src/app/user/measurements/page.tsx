
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, TrendingUp } from "lucide-react";
import ProgressOverviewChart from '@/components/user/progress-overview-chart'; 
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';

// Simulate fetching data (replace with actual API calls)
async function fetchMeasurements() {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { weight: 74.0, height: 175, bodyFat: 18.5 };
}

async function saveMeasurements(measurements: { weight?: number; height?: number; bodyFat?: number }) {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log("Saving measurements:", measurements);
  return { success: true };
}

export default function MeasurementsPage() {
  const t = useTranslations('MeasurementsPage');
  const { toast } = useToast();
  const [weight, setWeight] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [bodyFat, setBodyFat] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); 

  useEffect(() => {
    setIsLoading(true);
    fetchMeasurements().then(data => {
      setWeight(data.weight);
      setHeight(data.height);
      setBodyFat(data.bodyFat);
      setLastUpdated(new Date(Date.now() - 86400000 * 2)); 
      setIsLoading(false);
    });
  }, []);

   const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const currentMeasurements = {
        weight: typeof weight === 'number' ? weight : (weight === '' ? undefined : parseFloat(weight as string)),
        height: typeof height === 'number' ? height : (height === '' ? undefined : parseFloat(height as string)),
        bodyFat: typeof bodyFat === 'number' ? bodyFat : (bodyFat === '' ? undefined : parseFloat(bodyFat as string)),
      };
      const result = await saveMeasurements(currentMeasurements);
      if (result.success) {
         setLastUpdated(new Date()); 
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
    } catch (error) {
      console.error("Failed to save measurements:", error);
      toast({
        title: t('toastErrorTitle'),
        description: t('toastErrorDesc'),
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setter(value); 
     }
  };

  const lastUpdatedText = lastUpdated
    ? t('lastUpdated', { date: `${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}` })
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
                    type="number"
                    step="0.1"
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
                    type="number"
                    step="1"
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
                    type="number"
                    step="0.1"
                    placeholder={t('bodyFatPlaceholder')}
                    value={bodyFat}
                     onChange={handleInputChange(setBodyFat)}
                    disabled={isSaving}
                  />
                </div>
              </div>
               <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
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
            <ProgressOverviewChart />
          )}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
          {t('chartDataDisclaimer')}
        </CardFooter>
      </Card>
    </div>
  );
}

    