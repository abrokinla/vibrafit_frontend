'use client';

import { Suspense, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Dumbbell, Apple, Sparkles, UserPlus } from "lucide-react";
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart';
import RecentActivityFeed from '@/components/user/recent-activity-feed';
import { getUserData, UserData } from '@/lib/api';
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


export default function UserDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<UserData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  // —————————————— Load User Data ——————————————
  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const data = await getUserData();
        setUser(data);
                
        if (!data.is_onboarded) {
          setShowOnboarding(true);
        }
      } catch (err: any) {        
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          // Clear everything and kick back to sign-in
          localStorage.clear();
          router.push('/signin');
          return;
        }
        console.error('Failed to load user:', err);
        toast({
          title: 'Error',
          description: 'Could not load your profile.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
  
    loadUser();
  }, [router, toast]);

 
useEffect(() => {
  const loadUser = async () => {
    setIsLoadingUser(true);
    try {
      const data = await getUserData();
      setUser(data);
      
      if (!data.is_onboarded) {
        setShowOnboarding(true);
      } else {
        setShowOnboarding(false);
      }
    } catch (err: any) {      
      if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
        // Clear everything and kick back to sign-in
        localStorage.clear();
        router.push('/signin');
        return;
      }
      console.error('Failed to load user:', err);
      toast({
        title: 'Error',
        description: 'Could not load your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  loadUser();
}, [router, toast]);

const handleOnboardingComplete = async () => {
  try {
    console.log("Onboarding completed, refreshing user data...");     
    const updatedUser = await getUserData();    
    setUser(updatedUser);
    
    setShowOnboarding(!updatedUser.is_onboarded);
    
    toast({
      title: 'Welcome!',
      description: "You're all set up.",
    });
  } catch (error) {
    console.error('Failed to refresh after onboarding', error);
    toast({
      title: 'Refresh Error',
      description: 'Could not update your dashboard info.',
      variant: 'destructive',
    });
  }
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