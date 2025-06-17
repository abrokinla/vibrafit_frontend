
// src/app/user/find-trainer/[trainerId]/page.tsx
'use client';

export const runtime = 'edge'; 

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import { Link, useRouter, usePathname } from '@/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Star, CheckCircle, Info, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CombinedProfileData } from '@/lib/api';
import { useTranslations } from 'next-intl';

type TrainerProfile = CombinedProfileData;

async function fetchTrainerById(trainerId: string | string[]): Promise<TrainerProfile | null> {
  const id = Array.isArray(trainerId) ? trainerId[0] : trainerId;
  if (!id) return null;

  try {
    const res = await fetch(`https://vibrafit.onrender.com/api/trainer-profile/by-user/${id}/`, {
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch trainer');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default function TrainerDetailPage() {
  const t = useTranslations('TrainerDetailPage');
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const trainerId = params.trainerId; 

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
  const fetchTrainerDetails = async () => {
    if (!trainerId) {
        setIsLoading(false);
        toast({ title: t('errorTitle'), description: t('errorTrainerIdMissing'), variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      const trainerData = await fetchTrainerById(trainerId);
      if (!trainerData) throw new Error("Trainer not found");
      setTrainer(trainerData);

      const subRes = await fetch(`https://vibrafit.onrender.com/api/subscriptions/subscription-status/?trainer_id=${Array.isArray(trainerId) ? trainerId[0] : trainerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      const data = await subRes.json();
      if (subRes.ok) {
        setIsSubscribed(data.isSubscribed);
      } else {
        console.warn('Could not determine subscription status');
      }

    } catch (err) {
      console.error(err);
      toast({
        title: t('errorTitle'),
        description: t('errorLoadDetails'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchTrainerDetails();
}, [trainerId, toast, t]);


  const handleSubscribe = async () => {
  if (!trainer || !trainerId) return;
  const currentTrainerId = Array.isArray(trainerId) ? trainerId[0] : trainerId;

  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast({
      title: t('errorTitle'),
      description: t('toastErrorNotAuthenticated'),
      variant: "destructive",
    });
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + 1);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  setIsSubscribing(true);
  try {
    const subRes = await fetch('https://vibrafit.onrender.com/api/subscriptions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        trainer: currentTrainerId, status: "active",
        start_date: formattedStartDate, end_date: formattedEndDate,
      }),
    });
    if (!subRes.ok) {
      const errorText = await subRes.text();
      throw new Error(errorText || 'Subscription failed.');
    }

    const userRes = await fetch('https://vibrafit.onrender.com/api/users/profile/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trainerId: currentTrainerId }),
    });
    if (!userRes.ok) {
      const errorText = await userRes.text();
      throw new Error(errorText || 'Failed to update user profile.');
    }

    toast({
      title: t('toastSubscribedTitle'),
      description: t('toastSubscribedDescription', { trainerName: trainer.name }),
    });
    setIsSubscribed(true);
    router.push('/user/dashboard');
  } catch (error) {
    console.error(error);
    toast({ title: t('errorTitle'), description: t('toastErrorSubscription'), variant: "destructive" });
  } finally {
    setIsSubscribing(false);
  }
};

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0" aria-label={t('loadingAlt')}>
        <Card className="max-w-3xl mx-auto shadow-lg animate-pulse">
          <CardHeader className="text-center border-b pb-6">
            <div className="h-32 w-32 rounded-full bg-muted mx-auto mb-4"></div>
            <div className="h-8 w-1/2 bg-muted rounded mx-auto mb-2"></div>
            <div className="h-5 w-1/4 bg-muted rounded mx-auto"></div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-5 w-1/3 bg-muted rounded mb-1"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-4 w-5/6 bg-muted rounded"></div>
                </div>
            ))}
             <div className="flex flex-wrap gap-2 mt-3">
                <div className="h-7 w-24 bg-muted rounded-full"></div>
                <div className="h-7 w-28 bg-muted rounded-full"></div>
                <div className="h-7 w-20 bg-muted rounded-full"></div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="h-12 w-full bg-muted rounded"></div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">{t('trainerNotFoundTitle')}</h2>
        <p className="text-muted-foreground mb-6">{t('trainerNotFoundDescription')}</p>
        <Link href="/user/find-trainer" passHref>
          <Button variant="outline">{t('backToTrainerListButton')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <Card className="max-w-3xl mx-auto shadow-xl border border-primary/10">
        <CardHeader className="text-center border-b pb-6 bg-gradient-to-b from-primary/5 to-transparent">
          <Avatar className="h-32 w-32 mx-auto mb-4 border-4 border-background shadow-md ring-2 ring-primary" data-ai-hint="trainer headshot">
            <AvatarImage src={trainer.profilePictureUrl || undefined} alt={trainer.name} />
              <AvatarFallback className="text-5xl bg-muted text-primary">
                {trainer?.name ? trainer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-primary">{trainer.name}</CardTitle>
          { (trainer as any).rating && ( 
            <div className="flex items-center justify-center gap-1 text-lg text-muted-foreground mt-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span>{((trainer as any).rating as number).toFixed(1)}</span>
              <span className="text-sm ml-1">{t('ratingSuffix')}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">{trainer.bio}</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary"><Info className="h-5 w-5" /> {t('aboutMeSectionTitle')}</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{trainer.bio}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Briefcase className="h-5 w-5"/> {t('experienceSectionTitle')}</h3>
                <p className="text-muted-foreground">{trainer.experience_years} {t('experienceSuffix')}</p>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Award className="h-5 w-5"/> {t('certificationsSectionTitle')}</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
                  {trainer.certifications ? trainer.certifications.split(',').map((cert, index) => <li key={index}>{cert.trim()}</li>)
                  : <li>{t('noCertificationsListed')}</li>}
                </ul>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">{t('specializationsSectionTitle')}</h3>
            <div className="flex flex-wrap gap-2">
              {(trainer.specializations as unknown as string) 
              ? (trainer.specializations as unknown as string).split(',').map((spec, index) => (
                    <Badge key={index} variant="default" className="text-sm py-1 px-3 shadow-sm">{spec.trim()}</Badge>))
              : <p>{t('noSpecializationsListed')}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col items-center">
            {isSubscribed ? (
                 <div className="text-center">
                    <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle className="h-6 w-6"/> {t('subscribedMessage', { trainerName: trainer.name })}
                    </p>
                    <Link href="/user/dashboard" passHref>
                        <Button variant="outline" className="mt-4">{t('goToDashboardButton')}</Button>
                    </Link>
                 </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        {t('subscribePrompt', { trainerName: trainer.name })}
                    </p>
                    <Button size="lg"
                        className="w-full md:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-primary-foreground shadow-md"
                        onClick={handleSubscribe} disabled={isSubscribing}>
                        {isSubscribing ? t('subscribingButton') : t('subscribeButton', { trainerName: trainer.name })}
                    </Button>
                </>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}

    