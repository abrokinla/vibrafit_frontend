import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Dumbbell, Apple, Sparkles } from "lucide-react";
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart'; // Placeholder for chart
import RecentActivityFeed from '@/components/user/recent-activity-feed'; // Placeholder for feed

// Example data fetching functions (replace with actual API calls)
async function getRecentWorkouts() {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return [
    { id: 1, type: 'workout', description: 'Completed 5k run', date: new Date(Date.now() - 86400000) }, // Yesterday
    { id: 2, type: 'workout', description: 'Weightlifting session', date: new Date(Date.now() - 172800000) }, // 2 days ago
  ];
}

async function getRecentMeals() {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { id: 3, type: 'meal', description: 'Logged breakfast: Oats & Berries', date: new Date(Date.now() - 3600000) }, // 1 hour ago
    { id: 4, type: 'meal', description: 'Logged lunch: Chicken Salad', date: new Date(Date.now() - 14400000) }, // 4 hours ago
  ];
}


export default function UserDashboardPage() {
  // User data - replace with actual logged-in user data
  const user = {
    id: 'user123',
    name: 'Alex',
    goal: 'Lose 5kg in 2 months',
    currentProgress: 'Lost 1kg, consistent workouts 3 times a week.',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>

      {/* AI Motivation Card */}
      <Suspense fallback={<Card><CardHeader><CardTitle>Loading Motivation...</CardTitle></CardHeader><CardContent><div className="h-20 bg-muted rounded animate-pulse"></div></CardContent></Card>}>
         <AiMotivationCard userId={user.id} goal={user.goal} progress={user.currentProgress} />
      </Suspense>


      {/* Key Metrics / Quick Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">74 kg</div>
            <p className="text-xs text-muted-foreground">-1 kg from last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Goal: 4 sessions</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1850</div>
            <p className="text-xs text-muted-foreground">Goal: 2000 kcal</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Your weight trend over the last 4 weeks.</CardDescription>
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
           <Suspense fallback={<div className="space-y-4"><div className="h-10 bg-muted rounded animate-pulse"></div><div className="h-10 bg-muted rounded animate-pulse"></div></div>}>
             {/* @ts-expect-error Server Component */}
             <RecentActivityFeed workoutsPromise={getRecentWorkouts()} mealsPromise={getRecentMeals()} />
          </Suspense>
        </CardContent>
      </Card>

    </div>
  );
}
