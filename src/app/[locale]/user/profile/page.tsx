// src/app/[locale]/user/profile/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { CalendarIcon, Save, Activity, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { UserData, fetchCombinedProfile, saveUserProfile, saveMetrics } from '@/lib/api'; // Ensure UserData is correctly typed
import { useTranslations } from 'next-intl';

export default function UserProfilePage() {
  const t = useTranslations('UserProfilePage');
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  useEffect(() => {
    (async()=> {
      setIsLoading(true);
      try {
        const data = await fetchCombinedProfile(); // This fetches combined data
        // Ensure fields like trainingLevel, weight, height, bodyFat are initialized if not present
        const profileDataWithDefaults: UserData = {
          ...data,
          training_level: data.training_level || '',
          metrics: {
            weight: data.metrics?.weight ?? null,
            height: data.metrics?.height ?? null,
            body_fat: data.metrics?.body_fat ?? null,
            bmi: data.metrics?.bmi ?? null,
            muscle_mass: data.metrics?.muscle_mass ?? null,
            waist_circumference: data.metrics?.waist_circumference ?? null,
          }
        };

        setProfile(profileDataWithDefaults);

        if (data.date_of_birth) {
          const parsedDate = parseISO(data.date_of_birth);
          if (isValid(parsedDate)) {
              setSelectedDate(parsedDate);
          } else {
              console.warn("Invalid dateOfBirth received:", data.date_of_birth);
              setSelectedDate(undefined);
          }
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        toast ({
          title: t('toastErrorTitle'),
          description: err.message || t('toastProfileLoadError'),
          variant: 'destructive',
        });
      }finally {
        setIsLoading(false);
      }
    })();
  }, [toast, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;

    const { name, value } = e.target as HTMLInputElement;

    if (
      ['weight', 'height', 'body_fat', 'muscle_mass', 'waist_circumference'].includes(name)
    ) {
      const numericValue = value === '' ? null : parseFloat(value);
      const updatedMetrics = { ...profile.metrics, [name]: numericValue };

      // Auto-calculate BMI if both weight and height are available
      const weight = updatedMetrics.weight ?? profile.metrics?.weight;
      const height = updatedMetrics.height ?? profile.metrics?.height;
      if (weight && height) {
        const heightInMeters = height / 100;
        updatedMetrics.bmi = parseFloat((weight / (heightInMeters ** 2)).toFixed(1));
      }

      setProfile({ ...profile, metrics: updatedMetrics });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };


  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!profile) return;
    // Store date_of_birth as ISO string or null
    setProfile({ ...profile, date_of_birth: date ? date.toISOString().split('T')[0] : null });
  };

  const handleTrainingLevelChange = (value: 'beginner' | 'intermediate' | 'advanced' | '') => {
    if (!profile) return;
    setProfile({ ...profile, training_level: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);

    try {
      const profileResult = await saveUserProfile({
        name: profile.name,
        date_of_birth: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
        training_level: profile.training_level || null,
        state: profile.state,
        country: profile.country,
      });

      const metricsToSave: { type: string; value: number }[] = [];

      if (typeof profile.metrics?.weight === 'number') {
        metricsToSave.push({ type: 'weight', value: profile.metrics.weight });
      }
      if (typeof profile.metrics?.height === 'number') {
        metricsToSave.push({ type: 'height', value: profile.metrics.height });
      }
      if (typeof profile.metrics?.body_fat === 'number') {
        metricsToSave.push({ type: 'body_fat', value: profile.metrics.body_fat });
      }
      if (typeof profile.metrics?.muscle_mass === 'number') {
        metricsToSave.push({ type: 'muscle_mass', value: profile.metrics.muscle_mass });
      }
      if (typeof profile.metrics?.waist_circumference === 'number') {
        metricsToSave.push({ type: 'waist_circumference', value: profile.metrics.waist_circumference });
      }
      if (typeof profile.metrics?.bmi === 'number') {
        metricsToSave.push({ type: 'bmi', value: profile.metrics.bmi });
      }
      const metricResult = await saveMetrics(metricsToSave);

      if (profileResult.success && metricResult.success) {
        toast({ title: t('toastProfileUpdatedTitle'), description: t('toastProfileUpdatedDesc') });
      } else {
        toast({
          title: t('toastUpdateFailedTitle'),
          description: t('toastUpdateFailedDesc'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('toastErrorTitle'),
        description: error.message || t('toastErrorDesc'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-4"></div>
        <Card className="shadow-md">
          <CardHeader><div className="h-6 w-1/4 bg-muted rounded animate-pulse"></div></CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>)}
          </CardContent>
          <CardFooter><div className="h-10 w-24 bg-muted rounded animate-pulse"></div></CardFooter>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-destructive">{t('toastProfileLoadError')}</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <Card className="shadow-lg max-w-2xl border">
        <CardHeader>
          <CardTitle>{t('personalDetailsTitle')}</CardTitle>
          <CardDescription>{t('personalDetailsDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fullNameLabel')}</Label>
              <Input id="name" name="name" value={profile.name || ''} onChange={handleInputChange} disabled={isSaving} placeholder={t('fullNamePlaceholder')}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input id="email" name="email" type="email" value={profile.email || ''} disabled
              className="disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">{t('dateOfBirthLabel')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                    disabled={isSaving}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>{t('pickDatePlaceholder')}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    captionLayout="dropdown-buttons"
                    fromYear={1900}
                    toYear={2030}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </div>
             <div className="space-y-2">
                <Label htmlFor="trainingLevel" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" /> {t('trainingLevelLabel')}
                </Label>
                <Select
                    value={profile.training_level || ''}
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | '') => handleTrainingLevelChange(value)}
                    disabled={isSaving}
                >
                    <SelectTrigger id="trainingLevel">
                        <SelectValue placeholder={t('trainingLevelPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="beginner">{t('beginner')}</SelectItem>
                        <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                        <SelectItem value="advanced">{t('advanced')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">{t('stateLabel')}</Label>
                <Input id="state" name="state" value={profile.state || ''} onChange={handleInputChange} disabled={isSaving} placeholder={t('statePlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('countryLabel')}</Label>
                <Input id="country" name="country" value={profile.country || ''} onChange={handleInputChange} disabled={isSaving} placeholder={t('countryPlaceholder')}/>
              </div>
            </div>
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">{t('bodyMetricsSectionTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">{t('weightLabel')} (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.weight ?? ''}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder={t('weightPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">{t('heightLabel')} (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.height ?? ''}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder={t('heightPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body_fat">{t('bodyFatLabel')} (%)</Label>
                  <Input
                    id="body_fat"
                    name="body_fat"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.body_fat ?? ''}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder={t('bodyFatPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscle_mass">{t('muscleMassLabel')} (kg)</Label>
                  <Input
                    id="muscle_mass"
                    name="muscle_mass"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.muscle_mass ?? ''}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder={t('muscleMassPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waist_circumference">{t('waistCircumferenceLabel')} (cm)</Label>
                  <Input
                    id="waist_circumference"
                    name="waist_circumference"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.waist_circumference ?? ''}
                    onChange={handleInputChange}
                    disabled={isSaving}
                    placeholder={t('waistCircumferencePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bmi">{t('bmiLabel')}</Label>
                  <Input
                    id="bmi"
                    name="bmi"
                    type="number"
                    step="0.1"
                    value={profile.metrics?.bmi ?? ''}
                    disabled
                    className="opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || isLoading} className="w-full md:w-auto">
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isSaving ? t('savingButton') : t('saveButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
