// src/app/[locale]/user/nutrition/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, CalendarDays, PlusCircle, Trash2, Utensils, Target, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Image from 'next/image'; 
import { useTranslations } from 'next-intl';
import { getUserData, saveUserProfile, UserData } from '@/lib/api'; // Import API
import { uploadProgressPhoto } from '@/lib/utils'; // For image uploads

interface MealLog {
  id: string; // Or number, depending on your backend
  date: Date;
  description: string;
  calories?: number;
}

// Simulate fetching/saving meal data (replace with actual API calls)
async function fetchMealsFromApi(token: string): Promise<MealLog[]> {
  // This should fetch meal logs for the user.
  // For now, returning sample data.
  await new Promise(resolve => setTimeout(resolve, 650));
  return [
    { id: 'm1', date: new Date(Date.now() - 3600000), description: 'Lunch: Grilled chicken salad with vinaigrette.', calories: 450 },
    { id: 'm2', date: new Date(Date.now() - 18000000), description: 'Breakfast: Greek yogurt with granola and honey.', calories: 300 },
  ];
}

async function addMealToApi(token: string, description: string, calories?: number): Promise<{ success: boolean; newMeal?: MealLog }> {
  // This should save a new meal log.
  // For now, simulating.
  await new Promise(resolve => setTimeout(resolve, 750));
  const newMeal: MealLog = { id: `m${Date.now()}`, date: new Date(), description: description, calories };
  console.log("Saving meal to API:", { description, calories });
  return { success: true, newMeal };
}

async function deleteMealFromApi(token: string, mealId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 550));
    console.log("Deleting meal from API:", mealId);
    return { success: true };
}


export default function NutritionPage() {
  const t = useTranslations('NutritionPage');
  const { toast } = useToast();
  const [newMealDescription, setNewMealDescription] = useState('');
  const [newMealCalories, setNewMealCalories] = useState<string>('');
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const [user, setUser] = useState<UserData | null>(null);
  const [goal, setGoal] = useState('');
  const [beforePhotoPreview, setBeforePhotoPreview] = useState<string | null>(null);
  const [currentPhotoPreview, setCurrentPhotoPreview] = useState<string | null>(null);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingCurrent, setIsUploadingCurrent] = useState(false);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const beforeFileInputRef = useRef<HTMLInputElement>(null);
  const currentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        // Handle no token case, e.g., redirect to login
        setIsLoadingMeals(false);
        setIsLoadingProfile(false);
        return;
    }

    setIsLoadingMeals(true);
    fetchMealsFromApi(token).then(data => {
      setMealHistory(data);
      setIsLoadingMeals(false);
    }).catch(err => {
        console.error("Error fetching meals:", err);
        toast({ title: t('toastErrorTitle'), description: t('toastErrorFetchMeals'), variant: "destructive" });
        setIsLoadingMeals(false);
    });

    setIsLoadingProfile(true);
    getUserData().then(data => {
        setUser(data);
        setGoal(data.goal || '');
        setBeforePhotoPreview(data.beforePhotoUrl || null);
        setCurrentPhotoPreview(data.currentPhotoUrl || null);
        setIsLoadingProfile(false);
    }).catch(err => {
        console.error("Error fetching user profile data:", err);
        toast({ title: t('toastErrorTitle'), description: t('toastErrorFetchProfile'), variant: "destructive" });
        setIsLoadingProfile(false);
    });

  }, [toast, t]);

  const handleAddMeal = async () => {
    if (!newMealDescription.trim()) {
      toast({ title: t('toastEmptyLogTitle'), description: t('toastEmptyLogDesc'), variant: "destructive" });
      return;
    }
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast({ title: t('toastAuthError'), description: t('toastAuthErrorDesc'), variant: "destructive" });
        return;
    }

    setIsSavingMeal(true);
    try {
      const calories = newMealCalories ? parseInt(newMealCalories, 10) : undefined;
      if (newMealCalories && (isNaN(calories!) || calories! < 0)) {
          toast({ title: t('toastInvalidCaloriesTitle'), description: t('toastInvalidCaloriesDesc'), variant: "destructive"});
          setIsSavingMeal(false);
          return;
      }
      const result = await addMealToApi(token, newMealDescription, calories);
      if (result.success && result.newMeal) {
        setMealHistory(prev => [result.newMeal!, ...prev]);
        setNewMealDescription('');
        setNewMealCalories('');
        toast({ title: t('toastMealLoggedTitle'), description: t('toastMealLoggedDesc') });
      } else {
        toast({ title: t('toastLogFailedTitle'), description: t('toastLogFailedDesc'), variant: "destructive" });
      }
    } catch (error) {
       toast({ title: t('toastErrorTitle'), description: t('toastErrorDesc'), variant: "destructive" });
    } finally {
      setIsSavingMeal(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    const token = localStorage.getItem('accessToken');
     if (!token) {
        toast({ title: t('toastAuthError'), description: t('toastAuthErrorDesc'), variant: "destructive" });
        return;
    }
    setDeletingMealId(id);
    try {
      const result = await deleteMealFromApi(token, id);
      if(result.success) {
        setMealHistory(prev => prev.filter(m => m.id !== id));
        toast({ title: t('toastMealDeletedTitle'), description: t('toastMealDeletedDesc') });
      } else {
        toast({ title: t('toastDeletionFailedTitle'), description: t('toastDeletionFailedDesc'), variant: "destructive" });
      }
    } catch (error) {
      toast({ title: t('toastErrorTitle'), description: t('toastErrorDesc'), variant: "destructive" });
    } finally {
      setDeletingMealId(null);
    }
  };
  
  const handleSaveGoalAndPhotos = async () => {
    if (!user) return;
    if (!goal.trim()) {
        toast({ title: t('toastGoalRequiredTitle'), description: t('toastGoalRequiredDesc'), variant: "destructive"});
        return;
    }
    setIsSavingGoal(true);
    try {
        const payload: Partial<UserData> = { goal };
        // Note: Photo URLs are updated separately via uploadProgressPhoto, then PATCHed to UserData
        // Here we only save the goal text.
        const result = await saveUserProfile(payload);
        if(result.success) {
            setUser(prev => prev ? {...prev, goal } : null);
            toast({ title: t('toastGoalSavedTitle'), description: t('toastGoalSavedDesc') });
        } else {
            toast({ title: t('toastSaveFailedTitle'), description: t('toastSaveFailedDesc'), variant: "destructive" });
        }
    } catch (error: any) {
         toast({ title: t('toastErrorTitle'), description: error.message || t('toastErrorDesc'), variant: "destructive"});
    } finally {
        setIsSavingGoal(false);
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
        // Update the specific preview state as well, to ensure consistency if user object update is slow
        if (photoType === 'before') setBeforePhotoPreview(result.newUrl);
        else setCurrentPhotoPreview(result.newUrl);
        toast({ title: t('photoUpdatedToastTitle', { photoType: t(photoType) }), description: t('photoUpdatedToastDescription') });
      } else {
        toast({ title: t('uploadFailedToastTitle'), description: result.error || t('uploadFailedToastDescription'), variant: "destructive" });
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


  const todayCalories = mealHistory
    .filter(meal => format(meal.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);

  if (isLoadingProfile) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-6 w-6" /> {t('myFitnessGoalTitle')}
          </CardTitle>
          <CardDescription>{t('myFitnessGoalDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <Label htmlFor="fitness-goal" className="text-base font-medium">{t('yourFitnessGoalLabel')}</Label>
                <Textarea
                  id="fitness-goal"
                  placeholder={t('fitnessGoalPlaceholder')}
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  disabled={isSavingGoal}
                  className="mt-1"
                />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Before Photo */}
                <div className="space-y-3">
                    <Label htmlFor="before-photo-input" className="text-lg font-semibold">{t('beforeLabel')}</Label>
                    <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                        <Image
                            src={beforePhotoPreview || user?.beforePhotoUrl || "https://placehold.co/400x400.png"}
                            alt={t('beforePhotoAlt')}
                            fill style={{objectFit:"cover"}}
                            className={isUploadingBefore ? 'opacity-50' : ''} data-ai-hint="fitness before" unoptimized/>
                        {isUploadingBefore && <UploadCloud className="h-12 w-12 text-primary animate-pulse absolute" />}
                    </div>
                    <input type="file" id="before-photo-input" ref={beforeFileInputRef} accept="image/*" 
                           onChange={(e) => handlePhotoUpload(e, 'before')} className="hidden" disabled={isUploadingBefore} />
                    <Button onClick={() => beforeFileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploadingBefore}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {isUploadingBefore ? t('uploadingButton') : (beforePhotoPreview ? t('changeBeforeButton') : t('uploadBeforeButton'))}
                    </Button>
                </div>
                {/* Current Photo */}
                <div className="space-y-3">
                    <Label htmlFor="current-photo-input" className="text-lg font-semibold">{t('currentLabel')}</Label>
                     <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative flex items-center justify-center">
                        <Image
                            src={currentPhotoPreview || user?.currentPhotoUrl || "https://placehold.co/400x400.png"}
                            alt={t('currentPhotoAlt')}
                            fill style={{objectFit:"cover"}}
                            className={isUploadingCurrent ? 'opacity-50' : ''} data-ai-hint="fitness current" unoptimized/>
                        {isUploadingCurrent && <UploadCloud className="h-12 w-12 text-primary animate-pulse absolute" />}
                    </div>
                    <input type="file" id="current-photo-input" ref={currentFileInputRef} accept="image/*"
                           onChange={(e) => handlePhotoUpload(e, 'current')} className="hidden" disabled={isUploadingCurrent} />
                    <Button onClick={() => currentFileInputRef.current?.click()} variant="outline" className="w-full" disabled={isUploadingCurrent}>
                        <UploadCloud className="mr-2 h-4 w-4" />
                         {isUploadingCurrent ? t('uploadingButton') : (currentPhotoPreview ? t('updateCurrentButton') : t('uploadCurrentButton'))}
                    </Button>
                </div>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGoalAndPhotos} disabled={isSavingGoal || isLoadingProfile || !goal.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isSavingGoal ? t('savingGoalButton') : t('saveGoalButton')}
          </Button>
        </CardFooter>
      </Card>

       <Card className="shadow-sm bg-secondary">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary"/> {t('todaysMealSummaryTitle')}
             </CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-2xl font-bold">{todayCalories} {t('caloriesUnit')}</p>
              <p className="text-xs text-muted-foreground">{t('caloriesEstimation')}</p>
           </CardContent>
       </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> {t('logNewMealTitle')}
          </CardTitle>
          <CardDescription>{t('logNewMealDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={t('mealLogPlaceholder')}
            rows={3}
            value={newMealDescription}
            onChange={(e) => setNewMealDescription(e.target.value)}
            disabled={isSavingMeal}
          />
          <div className="space-y-1">
            <Label htmlFor="meal-calories">{t('caloriesOptionalLabel')}</Label>
            <Input 
                id="meal-calories"
                type="number"
                placeholder={t('caloriesPlaceholder')}
                value={newMealCalories}
                onChange={(e) => setNewMealCalories(e.target.value)}
                disabled={isSavingMeal}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddMeal} disabled={isSavingMeal || !newMealDescription.trim()}>
            {isSavingMeal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSavingMeal ? t('loggingMealButton') : t('logMealButton')}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('mealHistoryTitle')}</CardTitle>
          <CardDescription>{t('mealHistoryDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMeals ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}
             </div>
          ) : mealHistory.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">{t('noMealsLogged')}</p>
          ) : (
            <ul className="space-y-4">
              {mealHistory.map((meal) => (
                <li key={meal.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200">
                  <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium flex items-center gap-2">
                        <Apple className="h-4 w-4 text-muted-foreground" />
                        {meal.description}
                     </p>
                     <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(meal.date), 'PPP p')} {/* Ensure meal.date is a Date object */}
                        </span>
                         {meal.calories && (
                            <span className="font-medium">{meal.calories} {t('caloriesUnit')}</span>
                         )}
                     </div>
                  </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMeal(meal.id)}
                      disabled={deletingMealId === meal.id}
                      aria-label={t('deleteMealLabel')}
                       className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingMealId === meal.id ? (
                         <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
         {mealHistory.length > 0 && (
             <CardFooter className="text-sm text-muted-foreground">
                {t('latestEntriesFooter')}
             </CardFooter>
        )}
      </Card>
    </div>
  );
}

