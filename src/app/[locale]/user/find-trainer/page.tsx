// src/app/[locale]/user/find-trainer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from '@/navigation'; 
import { Briefcase, Zap, UserCircle, Star } from "lucide-react"; 
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

interface TrainerSummary {
  id: string; // User ID of the trainer
  name: string;
  profilePictureUrl: string | null;
  specializations?: string[]; // Assuming from TrainerProfileData
  bio?: string; // Assuming from TrainerProfileData
  experienceYears?: number; // Assuming from TrainerProfileData
  rating?: number; // Assuming from TrainerProfileData
}

async function fetchAvailableTrainers(): Promise<TrainerSummary[]> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    // Handle not authenticated error, maybe redirect to login
    console.error("User not authenticated");
    return [];
  }
  const res = await fetch('https://vibrafit.onrender.com/api/users/trainers/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch trainers');
  const trainersData = await res.json();
  
  // Map to TrainerSummary, assuming the API returns user data including some profile info
  // or that we need to make further calls if profile info is separate
  return trainersData.map((trainer: any) => ({
    id: trainer.id,
    name: trainer.name || 'Trainer Name Missing',
    profilePictureUrl: trainer.profilePictureUrl || null,
    // These fields might come from a nested profile object or need another fetch
    specializations: trainer.trainer_profile?.specializations || [], 
    bio: trainer.trainer_profile?.bio || 'No bio available.',
    experienceYears: trainer.trainer_profile?.experience_years,
    rating: trainer.trainer_profile?.rating, // Assuming rating is available
  }));
}

export default function FindTrainerPage() {
  const t = useTranslations('FindTrainerPage');
  const [trainers, setTrainers] = useState<TrainerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAvailableTrainers().then(data => {
      setTrainers(data);
      setIsLoading(false);
    }).catch(err => {
      console.error("Error fetching trainers:", err);
      setIsLoading(false);
      // Optionally, show a toast notification for the error
    });
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md animate-pulse" aria-label={t('loadingAlt')}>
              <CardHeader className="items-center text-center">
                <div className="h-24 w-24 rounded-full bg-muted mb-3"></div>
                <div className="h-6 w-1/2 bg-muted rounded"></div>
                <div className="h-4 w-1/3 bg-muted rounded mt-1"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-muted rounded"></div>
                <div className="mt-3 flex flex-wrap gap-2">
                    <div className="h-6 w-20 bg-muted rounded-full"></div>
                    <div className="h-6 w-24 bg-muted rounded-full"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : trainers.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">{t('noTrainersAvailable')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-3 border-2 border-primary/50" data-ai-hint="trainer profile">
                  <AvatarImage src={trainer.profilePictureUrl || undefined} alt={trainer.name} />
                  <AvatarFallback className="text-3xl">
                    {trainer.name ? trainer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'T'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{trainer.name}</CardTitle>
                {trainer.rating && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{trainer.rating.toFixed(1)}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{trainer.bio}</p>
                {trainer.specializations && trainer.specializations.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">{t('specializesInLabel')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specializations.slice(0, 3).map((spec, index) => ( 
                        <Badge key={index} variant="secondary" className="text-xs">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/user/find-trainer/${trainer.id}`} passHref className="w-full">
                  <Button className="w-full">
                    <UserCircle className="mr-2 h-4 w-4" /> {t('viewProfileButton')}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
