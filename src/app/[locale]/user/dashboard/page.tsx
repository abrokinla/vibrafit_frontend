// src/app/[locale]/user/dashboard/page.tsx
'use client';
export const runtime = 'edge';


import { Suspense, useState, useEffect, useRef } from 'react';
import Image from 'next/image'; 
import { Link, useRouter } from '@/navigation'; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Scale, Dumbbell, Apple, UserPlus, Camera, UploadCloud, Play } from "lucide-react";
import { getUserData, UserData, LoggedMeal, DailyLog, Activity } from '@/lib/api';
import AiMotivationCard from '@/components/user/ai-motivation-card';
import ProgressOverviewChart from '@/components/user/progress-overview-chart';
import RecentActivityFeed from '@/components/user/recent-activity-feed';
import OnboardingModal from '@/components/user/onboarding-modal';
import { useToast } from "@/hooks/use-toast";
import { uploadProgressPhoto } from '@/lib/utils'; 
import { useTranslations } from 'next-intl';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const BASE_URL = "https://vibrafit.onrender.com/api";

export async function fetchMealsFromApi(token: string): Promise<LoggedMeal[]> {
  const res = await fetch(`${BASE_URL}/logged-meals/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to fetch meals");
  }

  return res.json();
}

export async function fetchDailyLogs(token: string): Promise<DailyLog[]> {
  const res = await fetch(`${BASE_URL}/daily-logs/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error('Failed to fetch daily logs');
  }

  return res.json();
}

export async function fetchRecentActivities(token: string, limit = 10): Promise<Activity[]> {
  const [meals, logs] = await Promise.all([
    fetchMealsFromApi(token),
    fetchDailyLogs(token),
  ]);

  const mealActivities: Activity[] = meals.map(meal => ({
    id: meal.id,
    type: 'meal',
    description: meal.description,
    date: parseISO(meal.date),
  }));

  const workoutActivities: Activity[] = logs.flatMap(log => {
    let exercises: any[] = [];

    if (typeof log.actual_exercise === 'string') {
      try {
        exercises = JSON.parse(log.actual_exercise);
      } catch (err) {
        console.warn("Failed to parse actual_exercise JSON", err);
        exercises = [];
      }
    } else if (Array.isArray(log.actual_exercise)) {
      exercises = log.actual_exercise;
    }

    return exercises.map((exercise, index) => ({
      id: Number(`${log.id}${index}`),
      type: 'workout',
      description: exercise.name || 'Exercise',
      date: parseISO(log.date),
    }));
  });




  const combined: Activity[] = [...mealActivities, ...workoutActivities];

  return combined
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

export default function UserDashboardPage() {
   const t = useTranslations('UserDashboardPage');
   const router = useRouter();
   const { toast } = useToast();
   const [user, setUser] = useState<UserData | null>(null);
   const [trainerName, setTrainerName] = useState<string | null>(null);
   const [showOnboarding, setShowOnboarding] = useState(false);
   const [isLoadingUser, setIsLoadingUser] = useState(true);
   const [isLoadingFeed, setIsLoadingFeed] = useState(true);
   const [mealHistory, setMealHistory] = useState<LoggedMeal[]>([]);
   const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
   const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

   const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
   const [currentPhotoPreview, setCurrentPhotoPreview] = useState<string | null>(null);
   const [isUploadingBefore, setIsUploadingBefore] = useState(false);
   const [isUploadingCurrent, setIsUploadingCurrent] = useState(false);

   const beforeFileInputRef = useRef<HTMLInputElement>(null);
   const currentFileInputRef = useRef<HTMLInputElement>(null);
  
   useEffect(() => {
    const loadUserAndActivities = async () => {
      setIsLoadingUser(true);
      setIsLoadingFeed(true);
      try {
        const data = await getUserData();
        setUser(data);
        
        if (!data.is_onboarded) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }

        if (data.trainerId) {
            const token = localStorage.getItem('accessToken');
            if (token) {
                 const trainerRes = await fetch(`https://vibrafit.onrender.com/api/users/${data.trainerId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                 });
                 if (trainerRes.ok) {
                    const trainerDetails = await trainerRes.json();
                    setTrainerName(trainerDetails.name);
                 } else {
                    console.warn('Could not fetch trainer details for dashboard.');
                 }
            }
        }
      
      } catch (err: any) {      
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        console.error('Failed to load user:', err);
        toast({
          title: t('errorLoadProfile'),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUser(false);
        setIsLoadingFeed(false);
      }
    };

    loadUserAndActivities();
  }, [router, toast, t]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    (async () => {
      try {
        const meals = await fetchMealsFromApi(token);
        setMealHistory(meals);

        const logs = await fetchDailyLogs(token);
        setDailyLogs(logs);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    })();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    (async () => {
      try {
        const activities = await fetchRecentActivities(token, 10);
        setRecentActivities(activities);
      } catch (err) {
        console.error('Failed to fetch recent activity:', err);
      }
    })();
  }, []);

  const todayCalories = mealHistory
    .filter((meal: LoggedMeal) =>
      format(new Date(meal.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    )
    .reduce((sum, meal) => sum + (meal.calories ?? 0), 0);

  const workoutsThisWeek = dailyLogs
    .filter((log: DailyLog) => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, {
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 })
      }) && Array.isArray(log.actual_exercise) && log.actual_exercise.length > 0;
    })
    .length;
  
  const handleOnboardingComplete = async () => {
    try {   
      const updatedUser = await getUserData();    
      setUser(updatedUser);
      setShowOnboarding(!updatedUser.is_onboarded);
      toast({
        title: t('welcomeToastTitle'),
        description: t('welcomeToastDescription'),
      });
    } catch (error) {
      console.error('Failed to refresh after onboarding', error);
      toast({
        title: t('refreshErrorToastTitle'),
        description: t('refreshErrorToastDescription'),
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
                toast({ title: t('photoUpdatedToastTitle', { photoType: photoType.charAt(0).toUpperCase() + photoType.slice(1) }), description: t('photoUpdatedToastDescription') });
            } else {
                toast({ title: t('uploadFailedToastTitle'), description: t('uploadFailedToastDescription'), variant: "destructive" });
                setPreview(user[dbField as keyof UserData] as string | null); 
                URL.revokeObjectURL(tempPreviewUrl);
            }
        } catch (error) {
            console.error(`Failed to upload ${photoType} photo:`, error);
            toast({ title: t('errorUnexpected'), variant: "destructive" });
            setPreview(user[dbField as keyof UserData] as string | null);
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
            <div className="h-32 bg-muted rounded"></div>
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

      <h1 className="text-3xl font-bold">{t('welcomeBack', { name: user.name || "User" })}</h1>

      <Suspense fallback={<Card><CardHeader><CardTitle>{t('loadingMotivation')}</CardTitle></CardHeader><CardContent><div className="h-20 bg-muted rounded animate-pulse"></div></CardContent></Card>}>
        <AiMotivationCard
          userId={user.id.toString()}
          goal={user.goal?.description || ''}
          progress=""
        />
      </Suspense>

      <Card className="shadow-md bg-gradient-to-r from-teal-500 to-primary hover:shadow-lg transition-shadow">
        <CardHeader>
            <CardTitle className="text-2xl text-primary-foreground flex items-center gap-2">
                <Play className="h-7 w-7" /> {t('readyForWorkoutTitle')}
            </CardTitle>
            <CardDescription className="text-teal-100">
                {t('readyForWorkoutDescription')}
            </CardDescription>
        </CardHeader>
        <CardContent>
             <Link href="/user/workouts" passHref>
                <Button size="lg" variant="secondary" className="w-full md:w-auto shadow-md hover:bg-white/90 text-primary font-semibold">
                    {t('goToWorkoutsButton')}
                </Button>
            </Link>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> {t('progressPicturesTitle')}
            </CardTitle>
            <CardDescription>{t('progressPicturesDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <Label htmlFor="before-photo-input" className="text-lg font-semibold">{t('beforeLabel')}</Label>
                <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    <Image
                        src={beforePhotoPreview || user.beforePhotoUrl || "https://placehold.co/400x400.png"}
                        alt={t('beforePhotoAlt')}
                        fill
                        style={{objectFit:"cover"}}
                        className={isUploadingBefore ? 'opacity-50' : ''}
                        data-ai-hint="fitness before"
                        unoptimized // Good for external URLs that might not be whitelisted
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
                    {isUploadingBefore ? t('uploadingButton') : (user.beforePhotoUrl || beforePhotoPreview ? t('changeBeforeButton') : t('uploadBeforeButton'))}
                </Button>
            </div>

            <div className="space-y-3">
                <Label htmlFor="current-photo-input" className="text-lg font-semibold">{t('currentLabel')}</Label>
                 <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                    <Image
                        src={currentPhotoPreview || user.currentPhotoUrl || "https://placehold.co/400x400.png"}
                        alt={t('currentPhotoAlt')}
                        fill
                        style={{objectFit:"cover"}}
                        className={isUploadingCurrent ? 'opacity-50' : ''}
                        data-ai-hint="fitness after"
                        unoptimized
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
                     {isUploadingCurrent ? t('uploadingButton') : (user.currentPhotoUrl || currentPhotoPreview ? t('updateCurrentButton') : t('uploadCurrentButton'))}
                </Button>
            </div>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">{t('photoShareDisclaimer')}</p>
        </CardFooter>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('weightCardTitle')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.metrics?.weight ? `${user.metrics.weight} kg` : '-- kg'}
            </div>
            <Link href="/user/measurements" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">{t('updateInMeasurementsLink')}</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('workoutsThisWeekCardTitle')}</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workoutsThisWeek || '--'}</div>
            <Link href="/user/workouts" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">{t('logInWorkoutsLink')}</Button>
            </Link>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('caloriesTodayCardTitle')}</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCalories || '----'}</div>
            <Link href="/user/nutrition" passHref>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto">{t('logInNutritionLink')}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {user.trainerId ? t('yourTrainerCardTitle') : t('findTrainerCardTitle')}
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {user.trainerId ? (
              <>
                <div className="text-lg font-bold">
                  {trainerName || t('loadingTrainer')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('youAreConnected')}
                </p>
                <Button asChild variant="link" size="sm" className="text-xs p-0 h-auto mt-1">
                  <Link href={`/profile/${user.trainerId}` as any}>
                    {t('viewTrainerProfileLink')}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  {t('getPersonalizedGuidance')}
                </div>
                <Link href="/user/find-trainer" passHref>
                  <Button size="sm" className="w-full">
                    {t('browseTrainersButton')}
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('weightProgressCardTitle')}</CardTitle>
          <CardDescription>{t('weightProgressDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           <ProgressOverviewChart />
        </CardContent>
      </Card>

       <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('recentActivityCardTitle')}</CardTitle>
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
