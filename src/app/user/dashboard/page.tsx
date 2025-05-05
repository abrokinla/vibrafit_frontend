'use client'; // Make this a client component to manage state

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Dumbbell, Apple, Sparkles, UserPlus } from "lucide-react"; // Added UserPlus icon
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart';
import RecentActivityFeed from '@/components/user/recent-activity-feed';
import OnboardingModal from '@/components/user/onboarding-modal'; // Import the modal
import { Button } from '@/components/ui/button'; // Import Button
import { useToast } from '@/hooks/use-toast'; // Import useToast

// Example data fetching functions (replace with actual API calls)
// These should ideally be moved outside or handled differently in a real app
// For now, keeping them here but they won't run on the client directly.
// You'd typically fetch data within useEffect or use a data fetching library.
async function getRecentWorkouts() {
  // Simulate fetching server-side data if needed elsewhere, but feed needs client-side fetching
  // await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, type: 'workout' as const, description: 'Completed 5k run', date: new Date(Date.now() - 86400000) },
    { id: 2, type: 'workout' as const, description: 'Weightlifting session', date: new Date(Date.now() - 172800000) },
  ];
}

async function getRecentMeals() {
  // await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { id: 3, type: 'meal' as const, description: 'Logged breakfast: Oats & Berries', date: new Date(Date.now() - 3600000) },
    { id: 4, type: 'meal' as const, description: 'Logged lunch: Chicken Salad', date: new Date(Date.now() - 14400000) },
  ];
}

// Simulate fetching user data (replace with actual auth/API call)
async function getUserData() {
   // await new Promise(resolve => setTimeout(resolve, 300));
   // Simulate a user who hasn't set a goal yet
   return {
     id: 'user123',
     name: 'Alex',
     goal: '', // Empty goal signifies onboarding needed
     currentProgress: 'Just started!',
     isOnboarded: false, // Explicit flag is better
     trainerId: null, // Add trainerId field, initially null
   };
}


export default function UserDashboardPage() {
   const { toast } = useToast(); // Initialize useToast
   // User data state
   const [user, setUser] = useState<Awaited<ReturnType<typeof getUserData>> | null>(null);
   const [showOnboarding, setShowOnboarding] = useState(false);
   const [isLoadingUser, setIsLoadingUser] = useState(true);

   // Fetch user data on mount
   useEffect(() => {
     getUserData().then(userData => {
       setUser(userData);
       // Determine if onboarding is needed based on fetched data
       if (!userData.goal || !userData.isOnboarded) {
         setShowOnboarding(true);
       }
       setIsLoadingUser(false);
     });
   }, []);

   // Function to update user state and hide modal after onboarding step
   const handleOnboardingComplete = () => {
     // Refetch user data or update local state to reflect onboarding completion
     getUserData().then(updatedUserData => {
        // Simulate goal being set after onboarding
        // Also, assume the user is marked as onboarded in the backend now
        const tempUpdatedUser = { ...updatedUserData, goal: "Goal set during onboarding!", isOnboarded: true };
        setUser(tempUpdatedUser);
     });
     setShowOnboarding(false);
   };

   // --- Client-side state for feed data ---
   const [recentActivities, setRecentActivities] = useState<Awaited<ReturnType<typeof getRecentWorkouts>>>([]);
   const [isLoadingFeed, setIsLoadingFeed] = useState(true);

   useEffect(() => {
       // Fetch feed data on client
       Promise.all([getRecentWorkouts(), getRecentMeals()]).then(([workouts, meals]) => {
           const combined = [...workouts, ...meals].sort((a, b) => b.date.getTime() - a.date.getTime());
           setRecentActivities(combined);
           setIsLoadingFeed(false);
       });
   }, []);
   // --- End feed data state ---

   // Placeholder handler for finding a trainer
   const handleFindTrainer = () => {
       // TODO: Implement logic to browse/subscribe to trainers (e.g., open modal, navigate to page)
       console.log('Finding a trainer...');
       toast({
           title: "Feature Coming Soon",
           description: "The ability to find and subscribe to trainers is under development.",
       });
       // Example: Simulate subscribing and updating user state
       // setUser(prev => prev ? { ...prev, trainerId: 'trainer456' } : null);
   };


   if (isLoadingUser || !user) {
     // Show loading state while fetching user data
     return (
        <div className="space-y-8">
            <div className="h-10 w-1/2 bg-muted rounded animate-pulse"></div> {/* Placeholder for Welcome message */}
            <div className="h-24 bg-muted rounded animate-pulse"></div> {/* Placeholder for Motivation card */}
             <div className="grid gap-6 md:grid-cols-3">
                <div className="h-24 bg-muted rounded animate-pulse"></div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
                <div className="h-24 bg-muted rounded animate-pulse"></div>
             </div>
             <div className="h-64 bg-muted rounded animate-pulse"></div> {/* Placeholder for Chart */}
             <div className="h-40 bg-muted rounded animate-pulse"></div> {/* Placeholder for Activity Feed */}
             <div className="h-32 bg-muted rounded animate-pulse"></div> {/* Placeholder for Trainer card */}
        </div>
     );
   }


  return (
    <div className="space-y-8">
       {/* Onboarding Modal */}
        <OnboardingModal
            isOpen={showOnboarding}
            onClose={handleOnboardingComplete}
            userId={user.id}
        />

      <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>

      {/* AI Motivation Card - Needs to handle potential missing goal */}
      {user.goal && !showOnboarding ? ( // Only show if goal exists and onboarding is done
          <Suspense fallback={<Card><CardHeader><CardTitle>Loading Motivation...</CardTitle></CardHeader><CardContent><div className="h-20 bg-muted rounded animate-pulse"></div></CardContent></Card>}>
              {/* @ts-expect-error Server Component usage in Client Component needs careful handling or refactoring */}
             <AiMotivationCard userId={user.id} goal={user.goal} progress={user.currentProgress} />
          </Suspense>
      ) : (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle className="text-lg text-primary">Set Your Goal!</CardTitle>
                    <CardDescription className="text-sm">Complete the initial prompt to start receiving personalized motivation.</CardDescription>
                </div>
            </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">Waiting for you to set your goal...</p>
            </CardContent>
          </Card>
      )}


      {/* Key Metrics / Quick Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-- kg</div> {/* Show placeholder or fetch */}
            <p className="text-xs text-muted-foreground">Update in Measurements</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div> {/* Show placeholder or fetch */}
            <p className="text-xs text-muted-foreground">Log in Workouts</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">----</div> {/* Show placeholder or fetch */}
            <p className="text-xs text-muted-foreground">Log in Nutrition</p>
          </CardContent>
        </Card>

        {/* Find a Trainer Card */}
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
                        <div className="text-2xl font-bold">Subscribed!</div> {/* Placeholder */}
                        <p className="text-xs text-muted-foreground">View Trainer Profile</p> {/* TODO: Link this */}
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

      {/* Progress Chart */}
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Your weight trend (Update in Measurements).</CardDescription>
        </CardHeader>
        <CardContent>
           <ProgressOverviewChart />
        </CardContent>
      </Card>


      {/* Recent Activity Feed */}
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
           {isLoadingFeed ? (
               <div className="space-y-4"><div className="h-10 bg-muted rounded animate-pulse"></div><div className="h-10 bg-muted rounded animate-pulse"></div></div>
           ) : (
               // Pass fetched data directly to the client component
               <RecentActivityFeed activities={recentActivities} />
           )}
        </CardContent>
      </Card>

    </div>
  );
}
