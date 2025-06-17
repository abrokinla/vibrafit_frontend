
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { CalendarIcon, Save, Activity } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { CombinedProfileData, fetchCombinedProfile, saveUserProfile } from '@/lib/api';
import { useTranslations } from 'next-intl';

// Define UserProfileData locally if not already globally available with trainingLevel
interface UserProfileData extends CombinedProfileData {
  trainingLevel?: 'beginner' | 'intermediate' | 'advanced' | '';
}


export default function UserProfilePage() {
  const t = useTranslations('UserProfilePage');
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
    (async()=> {
      try {
        const data = await fetchCombinedProfile();
        // Ensure trainingLevel is part of the data or initialize it
        const profileDataWithLevel = { ...data, trainingLevel: data.trainingLevel || '' };
        setProfile(profileDataWithLevel as UserProfileData);

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
  }, [userId, toast, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!profile) return;
    setProfile({ ...profile, date_of_birth: date ? date.toISOString() : null });
  };

  const handleTrainingLevelChange = (value: 'beginner' | 'intermediate' | 'advanced' | '') => {
    if (!profile) return;
    setProfile({ ...profile, trainingLevel: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    try {
      const profileToSave = {
        ...profile,
        date_of_birth: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      };
      const result = await saveUserProfile(profileToSave);
      if (result.success) {
        toast({ title: t('toastProfileUpdatedTitle'), description: t('toastProfileUpdatedDesc') });
      } else {
        toast({ title: t('toastUpdateFailedTitle'), description: t('toastUpdateFailedDesc'), variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      toast({ title: t('toastErrorTitle'), description: t('toastErrorDesc'), variant: "destructive" });
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
              <Input id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={isSaving} placeholder={t('fullNamePlaceholder')}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input id="email" name="email" type="email" value={profile.email} disabled
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
                    toYear={new Date().getFullYear()}
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
                    value={profile.trainingLevel || ''}
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving || isLoading} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? t('savingButton') : t('saveButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

    