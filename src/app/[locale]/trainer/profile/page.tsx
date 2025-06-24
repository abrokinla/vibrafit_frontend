// src/app/[locale]/trainer/profile/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Award, Info, Briefcase } from "lucide-react";
import { CombinedProfileData, fetchCombinedProfile, saveTrainerProfile, TrainerProfileData } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';

interface TrainerPageProfileData extends CombinedProfileData {}

export default function TrainerProfilePage() {
  const t = useTranslations('TrainerProfilePage');
  const { toast } = useToast();
  const [profile, setProfile] = useState<TrainerPageProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await fetchCombinedProfile();
        setProfile(data as TrainerPageProfileData); 
      } catch (err: any) {
        console.error('Error loading profile:', err);
        toast({
          title: t('toastErrorGeneric'),
          description: err.message || t('errorLoadingProfile'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast, t]);

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (!profile) return;
      const { name, value } = e.target;

      setProfile(prev => {
        if (!prev) return prev;

        if (name === 'experience_years') {
          const num = value === '' ? null : Number(value);
          return { ...prev, experience_years: num };
        }

        if (name === 'specializations_string') {
          return {
            ...prev,
            specializations_string: value, // temp string field just for UI
          };
        }

        return { ...prev, [name]: value };
      });
    }

    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const yrs = profile.experience_years;
    if (yrs !== null && (isNaN(yrs) || yrs < 0)) {
      toast({
        title: t('errorInvalidInput'),
        description: t('errorExperienceYears'),
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const specializationsArray =
        typeof profile.specializations === 'string'
          ? (profile.specializations as string).split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(profile.specializations)
            ? profile.specializations
            : [];

      const toSave: Partial<TrainerProfileData> = {
        bio: profile.bio,
        certifications: profile.certifications,
        specializations: specializationsArray,
        experience_years: profile.experience_years,
      };

      const result = await saveTrainerProfile(toSave);
      // After saving, fetch the profile again to get the possibly array-formatted specializations
      const updatedProfile = await fetchCombinedProfile();
      setProfile(updatedProfile as TrainerPageProfileData);

      if (result.success) {
        toast({
          title: t('toastProfileUpdatedTitle'),
          description: t('toastProfileUpdatedDesc'),
        });
      } else {
        toast({
          title: t('toastUpdateFailedTitle'),
          description: t('toastUpdateFailedDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save profile', error);
      toast({
        title: t('toastErrorGeneric'),
        description: t('toastErrorDesc'), 
        variant: 'destructive',
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
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>)}
            <div className="h-20 bg-muted rounded animate-pulse"></div>
            <div className="h-16 bg-muted rounded animate-pulse"></div>
          </CardContent>
          <CardFooter><div className="h-10 w-24 bg-muted rounded animate-pulse"></div></CardFooter>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-destructive">{t('errorLoadingProfile')}</p>;
  }

  const specializationsString = Array.isArray(profile.specializations) 
                                 ? profile.specializations.join(', ')
                                 : (profile.specializations as string || '');


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <Card className="shadow-lg max-w-3xl border">
        <CardHeader>
          <CardTitle>{t('professionalInfoTitle')}</CardTitle>
          <CardDescription>{t('professionalInfoDescription')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center gap-2"><Info className="h-4 w-4 text-primary"/>{t('summaryLabel')}</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio || ""}
                onChange={handleInputChange}
                disabled={isSaving}
                rows={4}
                placeholder={t('summaryPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="experience_years" className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary"/>{t('experienceLabel')}</Label>
                    <Input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        value={profile.experience_years ?? ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        placeholder={t('experiencePlaceholder')}
                        min="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="certifications" className="flex items-center gap-2"><Award className="h-4 w-4 text-primary"/>{t('certificationsLabel')}</Label>
                    <Input
                        id="certifications"
                        name="certifications"
                        value={profile.certifications || ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        placeholder={t('certificationsPlaceholder')}
                    />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specializations_string">{t('specializationsLabel')}</Label>
              <Textarea
                id="specializations_string"
                name="specializations_string" // Use a different name for the input field if needed
                value={specializationsString} 
                onChange={handleInputChange} 
                disabled={isSaving}
                rows={3}
                placeholder={t('specializationsPlaceholder')}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('savingButton') : t('saveButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
