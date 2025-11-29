
// src/app/[locale]/user/find-trainer/[trainerId]/page.tsx
'use client';
export const runtime = 'edge';  

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Star, CheckCircle, Info, Image as ImageIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CombinedProfileData, fetchTimelinePosts, Post } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

type TrainerProfile = CombinedProfileData;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}
async function fetchTrainerById(trainerUserId: string, token: string | null): Promise<TrainerProfile | null> {
  if (!trainerUserId || !token) return null;

  try {
    // Single consolidated API call
    const res = await fetch(apiUrl(`/users/${trainerUserId}/public-profile/`), {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch trainer data');
    const data = await res.json();

    // Data is already consolidated from the backend
    return { ...data } as TrainerProfile;

  } catch (err) {
    return null;
  }
}

export default function TrainerDetailPage() {
  const t = useTranslations('TrainerDetailPage');
  const params = useParams(); 
  const router = useRouter();
  const { toast } = useToast();
  
  // Ensure trainerId is a string
  const trainerId = Array.isArray(params.trainerId) ? params.trainerId[0] : params.trainerId as string;

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [trainerPosts, setTrainerPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'none' | 'pending' | 'active'>('none');

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
        const [trainerData, postsData] = await Promise.all([
          fetchTrainerById(trainerId, token),
          fetchTimelinePosts(trainerId) // Fetch posts by trainer
        ]);

        if (!trainerData) throw new Error("Trainer not found or could not be loaded.");

        // Set subscription status from the consolidated response
        setSubscriptionStatus((trainerData as any).subscriptionStatus?.status || 'none');

        setTrainer(trainerData);
        setTrainerPosts(postsData);

      } catch (err: any) {
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
    if (!trainer || !trainerId) {
      return;
    }

    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast({ title: t('errorTitle'), description: t('toastErrorNotAuthenticated'), variant: "destructive" });
      return;
    }

    const requestData = {
      trainer: trainerId,
      // Backend automatically sets status, start_date, and end_date
    };

    const requestUrl = apiUrl('/users/subscriptions/');

    setIsSubscribing(true);
    try {
      const subRes = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(requestData),
      });

      if (!subRes.ok) {
        const errorData = await subRes.json();
        throw new Error(errorData.detail || 'Subscription request failed.');
      }

      toast({
        title: t('toastSubscribedTitle'),
        description: t('toastSubscribedDescription', { trainerName: trainer.name }),
      });

     setSubscriptionStatus('pending');

    } catch (error: any) {
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
  
  const specializations: string[] = trainer.specializations || [];

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
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">{t('profileTab')}</TabsTrigger>
                <TabsTrigger value="media">{t('mediaTab')}</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
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
                        {trainer.certifications && Array.isArray(trainer.certifications) && trainer.certifications.length > 0 ? (
                            <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
                                {trainer.certifications.map((cert: string, index: number) => <li key={index}>{cert.trim()}</li>)}
                            </ul>
                        ) : <p className="text-muted-foreground">{t('noCertificationsListed')}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">{t('specializationsSectionTitle')}</h3>
                     {specializations.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {specializations.map((spec: string, index: number) => (
                                <Badge key={index} variant="default" className="text-sm py-1 px-3 shadow-sm">{spec}</Badge>
                            ))}
                        </div>
                      ) : <p className="text-muted-foreground">{t('noSpecializationsListed')}</p>}
                  </div>
                </CardContent>
            </TabsContent>
            <TabsContent value="media">
                <CardContent className="pt-6">
                    {trainerPosts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {trainerPosts.map(post => (
                                (post.imageUrl || post.videoUrl) && (
                                <div key={post.id} className="relative aspect-square w-full overflow-hidden rounded-md border group">
                                    {post.imageUrl ? (
                                        <Image src={post.imageUrl} alt={t('postImageAlt')} fill style={{ objectFit: 'cover' }} unoptimized />
                                    ) : (
                                        <div className="bg-black h-full w-full flex items-center justify-center">
                                            <Video className="h-12 w-12 text-white" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                        <p className="text-white text-xs text-center line-clamp-3">{post.content}</p>
                                    </div>
                                </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <ImageIcon className="mx-auto h-12 w-12 mb-4" />
                            <p>{t('noMediaMessage')}</p>
                        </div>
                    )}
                </CardContent>
            </TabsContent>
        </Tabs>

        <CardFooter className="border-t pt-6 flex flex-col items-center">
          {subscriptionStatus === 'active' ? (
              <div className="text-center">
                  <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                      <CheckCircle className="h-6 w-6"/> {t('subscribedMessage', { trainerName: trainer.name })}
                  </p>
                  <Link href="/user/dashboard" passHref>
                      <Button variant="outline" className="mt-4">{t('goToDashboardButton')}</Button>
                  </Link>
              </div>
          ) : subscriptionStatus === 'pending' ? (
              <div className="text-center">
                  <p className="text-lg font-semibold text-yellow-600 flex items-center justify-center gap-2">
                      <Info className="h-6 w-6"/> Subscription Pending
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Your subscription request is awaiting trainer approval</p>
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
