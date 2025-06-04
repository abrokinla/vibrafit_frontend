

'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image'; 
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Scale, Dumbbell, Apple, UserPlus, Camera, UploadCloud, Play } from "lucide-react";
import { getUserData, UserData } from '@/lib/api';
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart';
import RecentActivityFeed from '@/components/user/recent-activity-feed';
import OnboardingModal from '@/components/user/onboarding-modal';
import { useToast } from '@/hooks/use-toast';
import { uploadProgressPhoto } from '@/lib/utils'; 

// Example data fetching functions
async function getRecentWorkouts() {
  return [
    { id: 1, type: 'workout' as const, description: 'Completed Full Body Blast routine', date: new Date(Date.now() - 86400000) },
    { id: 2, type: 'workout' as const, description: 'Logged 3km recovery jog', date: new Date(Date.now() - 172800000) },
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
   const [trainerName, setTrainerName] = useState<string | null>(null);
   const [showOnboarding, setShowOnboarding] = useState(false);
   const [isLoadingUser, setIsLoadingUser] = useState(true);
   const [recentActivities, setRecentActivities] = useState<Array<{id: number; type: 'workout' | 'meal'; description: string; date: Date}>>([]);
   const [isLoadingFeed, setIsLoadingFeed] = useState(true);

   const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
   const [currentPhotoPreview, setCurrentPhotoPreview] = useState<string | null>(null);
   const [isUploadingBefore, setIsUploadingBefore] = useState(false);
   const [isUploadingCurrent, setIsUploadingCurrent] = useState(false);

   const beforeFileInputRef = useRef<HTMLInputElement>(null);
   const currentFileInputRef = useRef<HTMLInputElement>(null);


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

  useEffect(() => {
    if (!user?.trainerId) return;

    fetch(`https://vibrafit.onrender.com/api/users/${user.trainerId}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Could not load trainer');
        return res.json();
      })
      .then((t: { name: string }) => setTrainerName(t.name))
      .catch(console.error);
  }, [user]);

  // still loading user?
  if (!user) return <Card className="shadow-sm p-4">Loading…</Card>;

  const hasTrainer = Boolean(user.trainerId);

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

   const handlePhotoUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
        photoType: 'before' | 'current'
    ) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        const setIsUploading = photoType === 'before' ? setIsUploadingBefore : setIsUploadingCurrent;
        const setPreview = photoType === 'before' ? setBeforePhotoPreview : setCurrentPhotoPreview;
        const dbField = photoType === 'before' ? 'beforePhotoUrl' : 'currentPhotoUrl';


        setIsUploading(true);
        const tempPreviewUrl = URL.createObjectURL(file);
        setPreview(tempPreviewUrl);

        try {
            const result = await uploadProgressPhoto(user.id.toString(), photoType, file);
            if (result.success && result.newUrl) {
                setUser(prev => prev ? { ...prev, [dbField]: result.newUrl } : null);
                toast({ title: `${photoType === 'before' ? 'Before' : 'Current'} Photo Updated!`, description: "Your photo has been saved." });
            } else {
                toast({ title: "Upload Failed", description: "Could not save your photo.", variant: "destructive" });
                setPreview(user[dbField]); 
                URL.revokeObjectURL(tempPreviewUrl);
            }
        } catch (error) {
            console.error(`Failed to upload ${photoType} photo:`, error);
            toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
            setPreview(user[dbField]);
            URL.revokeObjectURL(tempPreviewUrl);
        } finally {
            setIsUploading(false);
            if (event.target) event.target.value = "";
        }
    };


   if (isLoadingUser || !user) {
     return (
        <div className="space-y-8 animate-pulse">
            <div className="h-10 w-1/2 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div> {/* Start training placeholder */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div> 
            <div className="h-40 bg-muted rounded"></div> 
        </div>
     );
   }


  return (
    <div className="space-y-8">
        <OnboardingModal
            isOpen={showOnboarding}
            onClose={handleOnboardingComplete}
            userId={user.id.toString()}
        />

      <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>

      {/* <Suspense fallback={<Card><CardHeader><CardTitle>Loading Motivation...</CardTitle></CardHeader><CardContent><div className="h-20 bg-muted rounded animate-pulse"></div></CardContent></Card>}>
        // COMMENT @ts-expect-error Server Component
        <AiMotivationCard userId={user.id} goal={user.goal || ''} progress={user.currentProgress} />
      </Suspense> */}

      {/* Start Training CTA */}
      <Card className="shadow-md bg-gradient-to-r from-teal-500 to-primary hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="text-2xl text-primary-foreground flex items-center gap-2">
                <Play className="h-7 w-7" /> Ready for Today's Workout?
            </CardTitle>
            <CardDescription className="text-teal-100">
                Access your personalized routine and track your progress.
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Link href="/user/workouts" passHref>
                <Button size="lg" variant="secondary" className="w-full md:w-auto shadow-md hover:bg-white/90 text-primary font-semibold">
                    Go to My Workouts
                </Button>
            </Link>
        </CardContent>
      </Card>


      {/* Progress Pictures Section */}
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> Progress Pictures
            </CardTitle>
            <CardDescription>Track your visual transformation. Upload your before and current photos.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <Label htmlFor="before-photo-input" className="text-lg font-semibold">Before</Label>
                <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    <Image
                        src={beforePhotoPreview || user.beforePhotoUrl || "https://placehold.co/400x400.png"}
                        alt="Before progress"
                        layout="fill"
                        objectFit="cover"
                        className={isUploadingBefore ? 'opacity-50' : ''}
                        data-ai-hint="fitness before"
                    />
                    {isUploadingBefore && <UploadCloud className="h-12 w-12 text-primary animate-pulse absolute" />}
                </div>
                <input
                    type="file"
                    id="before-photo-input"
                    ref={beforeFileInputRef}
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                    className="hidden"
                    disabled={isUploadingBefore}
                />
                <Button
                    onClick={() => beforeFileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={isUploadingBefore}
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isUploadingBefore ? 'Uploading...' : (user.beforePhotoUrl || beforePhotoPreview ? 'Change Before Photo' : 'Upload Before Photo')}
                </Button>
            </div>

            <div className="space-y-3">
                <Label htmlFor="current-photo-input" className="text-lg font-semibold">Current</Label>
                 <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    <Image
                        src={currentPhotoPreview || user.currentPhotoUrl || "https://placehold.co/400x400.png"}
                        alt="Current progress"
                        layout="fill"
                        objectFit="cover"
                        className={isUploadingCurrent ? 'opacity-50' : ''}
                        data-ai-hint="fitness after"
                    />
                    {isUploadingCurrent && <UploadCloud className="h-12 w-12 text-primary animate-pulse absolute" />}
                </div>
                <input
                    type="file"
                    id="current-photo-input"
                    ref={currentFileInputRef}
                    accept="image/png, image/jpeg, image/gif"
                    onChange={(e) => handlePhotoUpload(e, 'current')}
                    className="hidden"
                    disabled={isUploadingCurrent}
                />
                <Button
                    onClick={() => currentFileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                    disabled={isUploadingCurrent}
                >
                    <UploadCloud className="mr-2 h-4 w-4" />
                     {isUploadingCurrent ? 'Uploading...' : (user.currentPhotoUrl || currentPhotoPreview ? 'Update Current Photo' : 'Upload Current Photo')}
                </Button>
            </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">These images can be shared with your trainer to track visual progress.</p>
        </CardFooter>
      </Card>


      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-- kg</div> {/* This would come from measurements page */}
            <Link href="/user/measurements" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">Update in Measurements</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div> {/* This would be calculated */}
            <Link href="/user/workouts" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">Log in Workouts</Button>
            </Link>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Today</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">----</div> {/* This would come from nutrition page */}
            <Link href="/user/nutrition" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">Log in Nutrition</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
      <CardHeader className="flex items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {hasTrainer ? 'Your Trainer' : 'Find a Trainer'}
        </CardTitle>
        <UserPlus className="h-4 w-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        {hasTrainer ? (
          <>
            <div className="text-lg font-bold">
              {trainerName ?? 'Loading…'}
            </div>
            <p className="text-xs text-muted-foreground">
              You’re connected!
            </p>
            <Link href={`/user/find-trainer/${user.trainerId}`} passHref>
              <Button
                variant="link"
                size="sm"
                className="text-xs p-0 h-auto mt-1"
              >
                View Trainer Profile
              </Button>
            </Link>
          </>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              Get personalized guidance.
            </div>
            <Link href="/user/find-trainer" passHref>
              <Button size="sm" className="w-full">
                Browse Trainers
              </Button>
            </Link>
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

    