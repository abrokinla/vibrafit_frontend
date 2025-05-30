
// src/app/user/find-trainer/[trainerId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Star, CheckCircle, Info, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import type { CombinedProfileData } from '@/lib/api';

type TrainerProfile = CombinedProfileData;

async function fetchTrainerById(trainerId: string): Promise<TrainerProfile | null> {
  try {
    const res = await fetch(`https://vibrafit.onrender.com/api/trainer-profile/by-user/${trainerId}/`, {
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
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { trainerId } = useParams();

  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
  const fetchTrainerDetails = async () => {
    if (!trainerId) 
      return <div>Loading...</div>;

    setIsLoading(true);
    try {
      const trainerData = await fetchTrainerById(trainerId);
      if (!trainerData) throw new Error("Trainer not found");
      setTrainer(trainerData);

      const subRes = await fetch(`https://vibrafit.onrender.com/api/subscriptions/subscription-status/?trainer_id=${trainerId}`, {
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
        title: "Error",
        description: "Could not load trainer details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  fetchTrainerDetails();
}, [trainerId, toast]);


  const handleSubscribe = async () => {
  if (!trainer) return;

  const token = localStorage.getItem('accessToken');
  if (!token) {
    toast({
      title: "Error",
      description: "User not authenticated.",
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
    // 1. Create subscription
    const subRes = await fetch('https://vibrafit.onrender.com/api/subscriptions/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainer: trainerId,
        status: "active",
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      }),
    });

    if (!subRes.ok) {
      const errorText = await subRes.text();
      throw new Error(errorText || 'Subscription failed.');
    }

    // 2. Update user profile with trainerId
    const userRes = await fetch('https://vibrafit.onrender.com/api/users/profile/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trainerId: trainerId,
      }),
    });

    if (!userRes.ok) {
      const errorText = await userRes.text();
      throw new Error(errorText || 'Failed to update user profile.');
    }

    toast({
      title: "Subscription Successful!",
      description: `You are now subscribed to ${trainer.name}.`,
    });

    setIsSubscribed(true);
    router.push('/user/dashboard');

  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "An unexpected error occurred during subscription.",
      variant: "destructive",
    });
  } finally {
    setIsSubscribing(false);
  }
};

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 md:px-0">
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
        <h2 className="text-2xl font-semibold text-destructive mb-4">Trainer Not Found</h2>
        <p className="text-muted-foreground mb-6">The trainer profile you are looking for does not exist or could not be loaded.</p>
        <Link href="/user/find-trainer" passHref>
          <Button variant="outline">Back to Trainer List</Button>
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
                {trainer?.name
                  ? trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : 'T'}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold text-primary">{trainer.name}</CardTitle>
          {trainer.rating && (
            <div className="flex items-center justify-center gap-1 text-lg text-muted-foreground mt-1">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <span>{trainer.rating.toFixed(1)}</span>
              <span className="text-sm ml-1">(Based on user reviews)</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">{trainer.bio}</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary"><Info className="h-5 w-5" /> About Me</h3>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{trainer.bio}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Briefcase className="h-5 w-5"/> Experience</h3>
                <p className="text-muted-foreground">{trainer.experience_years} years of professional training</p>
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><Award className="h-5 w-5"/> Certifications</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 pl-1">
                  {trainer.certifications
                  ? trainer.certifications
                      .split(',')
                      .map((cert, index) => <li key={index}>{cert.trim()}</li>)
                  : <li>No certifications listed.</li>}
                </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><h3 className="h-5 w-5"/> Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {trainer.specializations
              ? trainer.specializations
                  .split(',')
                  .map((spec, index) => (
                    <Badge key={index} variant="default" className="text-sm py-1 px-3 shadow-sm">
                      {spec.trim()}
                    </Badge>
                  ))
              : <p>No specializations listed.</p>}
            </div>
          </div>

          {/* Placeholder for availability or other sections */}
          {/* <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary"><CalendarDays className="h-5 w-5"/> Availability</h3>
            <p className="text-muted-foreground">Contact for scheduling details.</p>
          </div> */}

        </CardContent>
        <CardFooter className="border-t pt-6 flex flex-col items-center">
            {isSubscribed ? (
                 <div className="text-center">
                    <p className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                        <CheckCircle className="h-6 w-6"/> You are subscribed to {trainer.name}!
                    </p>
                    <Link href="/user/dashboard" passHref>
                        <Button variant="outline" className="mt-4">Go to Dashboard</Button>
                    </Link>
                 </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                        Ready to take the next step in your fitness journey with {trainer.name}?
                    </p>
                    <Button
                        size="lg"
                        className="w-full md:w-auto bg-gradient-to-r from-primary to-teal-600 hover:from-primary/90 hover:to-teal-600/90 text-primary-foreground shadow-md"
                        onClick={handleSubscribe}
                        disabled={isSubscribing}
                    >
                        {isSubscribing ? 'Subscribing...' : `Subscribe to ${trainer.name}`}
                    </Button>
                </>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
