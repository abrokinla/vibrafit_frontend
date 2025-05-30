
// src/app/user/find-trainer/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, Zap, UserCircle, Star } from "lucide-react"; // Added Star for ratings
import { Badge } from '@/components/ui/badge';

interface TrainerSummary {
  id: string;
  name: string;
  profilePictureUrl: string | null;
  specializations: string[];
  bio: string;
  experienceYears?: number;
  rating?: number;
}

async function fetchAvailableTrainers(): Promise<TrainerSummary[]> {
  const res = await fetch('https://vibrafit.onrender.com/api/users/trainers/', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch trainers');
  return await res.json();
}

export default function FindTrainerPage() {
  const [trainers, setTrainers] = useState<TrainerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAvailableTrainers().then(data => {
      setTrainers(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Your Trainer</h1>
        <p className="text-muted-foreground">
          Browse our certified trainers and find the perfect match for your fitness journey.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-md animate-pulse">
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
        <p className="text-muted-foreground text-center py-10">No trainers available at the moment. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <Card key={trainer.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 mb-3 border-2 border-primary/50" data-ai-hint="trainer profile">
                  <AvatarImage src={trainer.profilePictureUrl || undefined} alt={trainer.name} />
                  <AvatarFallback className="text-3xl">
                    {trainer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{trainer.name}</CardTitle>
                {trainer.rating && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span>{trainer.rating.toFixed(1)}</span>
                     {/* <span className="ml-1">(Placeholder Reviews)</span> */}
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{trainer.bio}</p>
                {trainer.specializations.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Specializes in:</h4>
                    <div className="flex flex-wrap gap-2">
                      {trainer.specializations.slice(0, 3).map((spec) => ( // Show max 3 specializations
                        <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link href={`/user/find-trainer/${trainer.id}`} passHref className="w-full">
                  <Button className="w-full">
                    <UserCircle className="mr-2 h-4 w-4" /> View Profile & Subscribe
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
