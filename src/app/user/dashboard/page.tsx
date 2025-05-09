'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Dumbbell, Apple, Sparkles, UserPlus } from "lucide-react";
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart';
import RecentActivityFeed from '@/components/user/recent-activity-feed';
import OnboardingModal from '@/components/user/onboarding-modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Example data fetching functions
async function getRecentWorkouts() {
  return [
    { id: 1, type: 'workout' as const, description: 'Completed 5k run', date: new Date(Date.now() - 86400000) },
    { id: 2, type: 'workout' as const, description: 'Weightlifting session', date: new Date(Date.now() - 172800000) },
  ];
}

async function getRecentMeals() {
  return [
    { id: 3, type: 'meal' as const, description: 'Logged breakfast: Oats & Berries', date: new Date(Date.now() - 3600000) },
    { id: 4, type: 'meal' as const, description: 'Logged lunch: Chicken Salad', date: new Date(Date.now() - 14400000) },
  ];
}

interface UserData {
  id: string;
  name: string;
  goal: string;
  currentProgress: string;
  isOnboarded: boolean;
  trainerId: string | null;
  profilePictureUrl: string | null;
}

async function getUserData(): Promise<UserData> {
   // Simulate a new user who hasn't been onboarded and hasn't set a goal yet
   // In a real app, this would come from your authentication and database
   return {
     id: 'user123',
     name: 'Alex Rider', // Example name
     goal: '', // Goal is initially empty, to be set in Nutrition page
     currentProgress: 'Ready to start!',
     isOnboarded: false, // This flag determines if onboarding modal is shown
     trainerId: null,
     profilePictureUrl: null, // Initially no profile picture
   };
}


export default function UserDashboardPage() {
   const { toast } = useToast();
   const [user, setUser] = useState<UserData | null>(null);
   const [showOnboarding, setShowOnboarding] = useState(false);
   const [isLoadingUser, setIsLoadingUser] = useState(true);
   const [recentActivities, setRecentActivities] = useState<Awaited<ReturnType<typeof getRecentWorkouts>>>([]);
   const [isLoadingFeed, setIsLoadingFeed] = useState(true);

   useEffect(() => {
     setIsLoadingUser(true);
     getUserData().then(userData => {
       setUser(userData);
       if (!userData.isOnboarded) {
         setShowOnboarding(true);
       }
       setIsLoadingUser(false);
     }).catch(error => {
        console.error("Failed to load user data", error);
        toast({ title: "Error", description: "Could not load your profile.", variant: "destructive" });
        setIsLoadingUser(false);
     });

     // Fetch feed data on client
     Promise.all([getRecentWorkouts(), getRecentMeals()]).then(([workouts, meals]) => {
         const combined = [...workouts, ...meals].sort((a, b) => b.date.getTime() - a.date.getTime());
         setRecentActivities(combined);
         setIsLoadingFeed(false);
     }).catch(error => {
        console.error("Failed to load activity feed", error);
        setIsLoadingFeed(false);
     });
   }, [toast]);

   const handleOnboardingComplete = () => {
     setUser(prevUser => prevUser ? { ...prevUser, isOnboarded: true } : null);
     setShowOnboarding(false);
     toast({ title: "Welcome!", description: "You're all set up. You can set your fitness goal on the Nutrition page." });
   };

   const handleFindTrainer = () => {
       console.log('Finding a trainer...');
       toast({
           title: "Feature Coming Soon",
           description: "The ability to find and subscribe to trainers is under development.",
       });
   };

   if (isLoadingUser || !user) {
     return (
        <div className="space-y-8">
            <div className="h-10 w-1/2 bg-muted rounded animate-pulse"></div>
            <div className="h-24 bg-muted rounded animate-pulse"></div>
             <div className="grid gap-6 md:grid-cols-3">
                <div className="h-24 bg-muted rounded animate-pulse"></div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
             </div>
             <div className="h-64 bg-muted rounded animate-pulse"></div>
             <div className="h-40 bg-muted rounded animate-pulse"></div>
             <div className="h-32 bg-muted rounded animate-pulse"></div>
        </div>
     );
   }


  return (
    <div className="space-y-8">
        <OnboardingModal
            isOpen={showOnboarding}
            onClose={handleOnboardingComplete}
            userId={user.id}
        />

      <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>

      {/* AI Motivation Card - Will adapt based on goal presence */}
      <Suspense fallback={<Card><CardHeader><CardTitle>Loading Motivation...</CardTitle></CardHeader><CardContent><div className="h-20 bg-muted rounded animate-pulse"></div></CardContent></Card>}>
        {/* @ts-expect-error Server Component */}
        <AiMotivationCard userId={user.id} goal={user.goal || ''} progress={user.currentProgress} />
      </Suspense>


      {/* Key Metrics / Quick Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-- kg</div>
            <p className="text-xs text-muted-foreground">Update in Measurements</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Log in Workouts</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">----</div>
            <p className="text-xs text-muted-foreground">Log in Nutrition</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                {user.trainerId ? 'Your Trainer' : 'Find a Trainer'}
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {user.trainerId ? (
                    <>
                        <div className="text-2xl font-bold">Subscribed!</div>
                        <p className="text-xs text-muted-foreground">View Trainer Profile</p>
                    </>
                ) : (
                    <>
                        <div className="text-sm text-muted-foreground mb-2">Get personalized guidance.</div>
                        <Button size="sm" onClick={handleFindTrainer}>
                            Browse Trainers
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
      </div>

       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Your weight trend (Update in Measurements).</CardDescription>
        </CardHeader>
        <CardContent>
           <ProgressOverviewChart />
        </CardContent>
      </Card>

       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
           {isLoadingFeed ? (
               <div className="space-y-4"><div className="h-10 bg-muted rounded animate-pulse"></div><div className="h-10 bg-muted rounded animate-pulse"></div></div>
           ) : (
               <RecentActivityFeed activities={recentActivities} />
           )}
        </CardContent>
      </Card>
    </div>
  );
}
