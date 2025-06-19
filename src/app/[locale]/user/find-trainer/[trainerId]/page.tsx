// src/app/[locale]/user/find-trainer/[trainerId]/page.tsx
'use client';
export const runtime = 'edge';  

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Keep this for client component param access
import { Link, useRouter } from '@/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Star, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CombinedProfileData } from '@/lib/api'; // Assuming this includes user and trainer profile fields
import { useTranslations } from 'next-intl';

type TrainerProfile = CombinedProfileData; // Use your existing combined type

async function fetchTrainerById(trainerUserId: string, token: string | null): Promise<TrainerProfile | null> {
  if (!trainerUserId || !token) return null;

  try {
    const userRes = await fetch(`https://vibrafit.onrender.com/api/users/${trainerUserId}/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) throw new Error('Failed to fetch base trainer user data');
    const userData = await userRes.json();

    const profileRes = await fetch(`https://vibrafit.onrender.com/api/trainer-profile/by-user/${trainerUserId}/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    let trainerProfileData = {};
    if (profileRes.ok) {
      trainerProfileData = await profileRes.json();
    } else {
      // It's possible a trainer user exists but hasn't filled out their trainer profile
      console.warn(`Trainer profile details not found for user ID: ${trainerUserId}. Response status: ${profileRes.status}`);
    }

    return { ...userData, ...trainerProfileData } as TrainerProfile;

  } catch (err) {
    console.error("Error fetching trainer by ID:", err);
    return null;
  }
}

export default function TrainerDetailPage() {
  const t = useTranslations('TrainerDetailPage');
  const params = useParams(); // Gets { locale: 'xx', trainerId: 'yy' }
  const router = useRouter();
  const { toast } = useToast();
  
  // Ensure trainerId is a string
  const trainerId = Array.isArray(params.trainerId) ? params.trainerId[0] : params.trainerId as string;

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false); // State to track current subscription

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!trainerId || !token) {
        setIsLoading(false);
        if(!trainerId) toast({ title: t('errorTitle'), description: t('errorTrainerIdMissing'), variant: "destructive" });
        if(!token) toast({ title: t('errorTitle'), description: t('toastErrorNotAuthenticated'), variant: "destructive" });
        return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const trainerData = await fetchTrainerById(trainerId, token);
        if (!trainerData) throw new Error("Trainer not found or could not be loaded.");
        setTrainer(trainerData);

        // Check subscription status
        const subStatusRes = await fetch(`https://vibrafit.onrender.com/api/subscriptions/subscription-status/?trainer_id=${trainerId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (subStatusRes.ok) {
          const subStatusData = await subStatusRes.json();
          setIsSubscribed(subStatusData.isSubscribed);
        } else {
          console.warn('Could not determine subscription status.');
        }

      } catch (err: any) {
        console.error("Error in TrainerDetailPage useEffect:", err);
        toast({
          title: t('errorTitle'),
          description: err.message || t('errorLoadDetails'),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [trainerId, toast, t]);


  const handleSubscribe = async () => {
  if (!trainer || !trainerId) return;

  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast({ title: t('errorTitle'), description: t('toastErrorNotAuthenticated'), variant: "destructive" });
    return;
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + 1); // Example: 1 month subscription

  const formatDate = (date: Date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

  setIsSubscribing(true);
  try {
    // Step 1: Create subscription
    const subRes = await fetch('https://vibrafit.onrender.com/api/subscriptions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        trainer: trainerId, // Send trainer's user ID
        status: "active",
        start_date: formatDate(startDate), 
        end_date: formatDate(endDate),
      }),
    });
    if (!subRes.ok) {
      const errorData = await subRes.json();
      throw new Error(errorData.detail || 'Subscription creation failed.');
    }

    // Step 2: Update user's profile to link trainerId
    const userProfileUpdateRes = await fetch('https://vibrafit.onrender.com/api/users/profile/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ trainerId: trainerId }), // Link current user to this trainer
    });
    if (!userProfileUpdateRes.ok) {
        const errorData = await userProfileUpdateRes.json();
        // Attempt to roll back subscription if user profile update fails? Complex.
        // For now, log and notify.
        console.error("Failed to update user profile with trainerId, but subscription might be created:", errorData.detail);
        throw new Error(errorData.detail || 'Failed to update user profile with trainer.');
    }
    
    localStorage.setItem('trainerId', trainerId); // Store trainerId for the user

    toast({
      title: t('toastSubscribedTitle'),
      description: t('toastSubscribedDescription', { trainerName: trainer.name }),
    });
    setIsSubscribed(true); // Update UI to reflect subscription
    router.push('/user/dashboard'); // Redirect to dashboard

  } catch (error: any) {
    console.error("Subscription process error:", error);
    toast({ title: t('errorTitle'), description: error.message || t('toastErrorSubscription'), variant: "destructive" });
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
  
  const specializations = Array.isArray(trainer.specializations) 
    ? trainer.specializations 
    : (typeof trainer.specializations === 'string' ? trainer.specializations.split(',').map(s => s.trim()).filter(s => s) : []);

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
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary"><Info className="h-5 w-5" /> {t('aboutMeSectionTitle')}</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{trainer.bio || t('noBioListed')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Briefcase className="h-5 w-5"/> {t('experienceSectionTitle')}</h3>
                <p className="text-muted-foreground">
                    {trainer.experience_years ? `${trainer.experience_years} ${t('experienceSuffix')}` : t('noExperienceListed')}
                </p>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Award className="h-5 w-5"/> {t('certificationsSectionTitle')}</h3>
                {trainer.certifications && trainer.certifications.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
                        {trainer.certifications.split(',').map((cert, index) => <li key={index}>{cert.trim()}</li>)}
                    </ul>
                ) : <p className="text-muted-foreground">{t('noCertificationsListed')}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">{t('specializationsSectionTitle')}</h3>
             {specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {specializations.map((spec, index) => (
                        <Badge key={index} variant="default" className="text-sm py-1 px-3 shadow-sm">{spec}</Badge>
                    ))}
                </div>
              ) : <p className="text-muted-foreground">{t('noSpecializationsListed')}</p>}
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

