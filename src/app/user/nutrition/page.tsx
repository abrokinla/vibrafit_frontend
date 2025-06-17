
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, CalendarDays, PlusCircle, Trash2, Utensils, Target, ImagePlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Image from 'next/image'; 
import { useTranslations } from 'next-intl';

interface MealLog {
  id: string;
  date: Date;
  description: string;
  calories?: number;
}

interface UserGoalAndImages {
    goal: string;
    images: File[]; 
    imagePreviews: string[]; 
}

// Simulate fetching/saving data (replace with actual API calls)
async function fetchMeals(): Promise<MealLog[]> {
  await new Promise(resolve => setTimeout(resolve, 650));
  return [
    // Sample data, could be localized if description keys are used
    { id: 'm1', date: new Date(Date.now() - 3600000), description: 'Lunch: Grilled chicken salad with vinaigrette.', calories: 450 },
    { id: 'm2', date: new Date(Date.now() - 18000000), description: 'Breakfast: Greek yogurt with granola and honey.', calories: 300 },
  ];
}

async function addMeal(description: string): Promise<{ success: boolean; newMeal?: MealLog }> {
  await new Promise(resolve => setTimeout(resolve, 750));
  const newMeal: MealLog = { id: `m${Date.now()}`, date: new Date(), description: description };
  return { success: true, newMeal };
}

async function deleteMeal(id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 550));
     return { success: true };
}

async function fetchUserGoalAndImages(userId: string): Promise<{ goal: string, imageUrls: string[] }> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return { goal: "", imageUrls: [] }; 
}

async function saveUserGoalAndImages(userId: string, goal: string, images: File[]): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Saving goal:", goal, "for user:", userId);
    console.log("Saving images:", images.map(f => f.name));
    return { success: true };
}

export default function NutritionPage() {
  const t = useTranslations('NutritionPage');
  const { toast } = useToast();
  const [newMealDescription, setNewMealDescription] = useState('');
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  const [userGoalData, setUserGoalData] = useState<UserGoalAndImages>({ goal: '', images: [], imagePreviews: [] });
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = "user123"; // Simulating userId

  useEffect(() => {
    setIsLoadingMeals(true);
    fetchMeals().then(data => {
      setMealHistory(data);
      setIsLoadingMeals(false);
    });

    setIsLoadingGoal(true);
    fetchUserGoalAndImages(userId).then(data => {
        setUserGoalData(prev => ({ ...prev, goal: data.goal, imagePreviews: data.imageUrls }));
        setIsLoadingGoal(false);
    });
  }, [userId]);

  const handleAddMeal = async () => {
    if (!newMealDescription.trim()) {
      toast({ title: t('toastEmptyLogTitle'), description: t('toastEmptyLogDesc'), variant: "destructive" });
      return;
    }
    setIsSavingMeal(true);
    try {
      const result = await addMeal(newMealDescription);
      if (result.success && result.newMeal) {
        setMealHistory(prev => [result.newMeal!, ...prev]);
        setNewMealDescription('');
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
    setDeletingMealId(id);
    try {
      const result = await deleteMeal(id);
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

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setUserGoalData(prev => ({ ...prev, goal: e.target.value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const newImages = filesArray.slice(0, 3 - userGoalData.images.length);
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setUserGoalData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUserGoalData(prev => {
        const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
        const updatedPreviews = prev.imagePreviews.filter((_, index) => index !== indexToRemove);
        URL.revokeObjectURL(prev.imagePreviews[indexToRemove]);
        return { ...prev, images: updatedImages, imagePreviews: updatedPreviews };
    });
  };

  const handleSaveGoalAndImages = async () => {
    if (!userGoalData.goal.trim()) {
        toast({ title: t('toastGoalRequiredTitle'), description: t('toastGoalRequiredDesc'), variant: "destructive"});
        return;
    }
    setIsSavingGoal(true);
    try {
        const result = await saveUserGoalAndImages(userId, userGoalData.goal, userGoalData.images);
        if (result.success) {
            toast({ title: t('toastGoalSavedTitle'), description: t('toastGoalSavedDesc') });
        } else {
            toast({ title: t('toastSaveFailedTitle'), description: t('toastSaveFailedDesc'), variant: "destructive" });
        }
    } catch (error) {
        toast({ title: t('toastErrorTitle'), description: t('toastErrorDesc'), variant: "destructive"});
    } finally {
        setIsSavingGoal(false);
    }
  };

  const todayCalories = mealHistory
    .filter(meal => format(meal.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);

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
          {isLoadingGoal ? (
            <div className="h-20 bg-muted rounded animate-pulse"></div>
          ) : (
            <>
              <div>
                <Label htmlFor="fitness-goal" className="text-base font-medium">{t('yourFitnessGoalLabel')}</Label>
                <Textarea
                  id="fitness-goal"
                  placeholder={t('fitnessGoalPlaceholder')}
                  rows={3}
                  value={userGoalData.goal}
                  onChange={handleGoalChange}
                  disabled={isSavingGoal}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="progress-images" className="text-base font-medium">{t('progressImagesLabel')}</Label>
                <p className="text-xs text-muted-foreground mb-2">{t('progressImagesDescription')}</p>
                <Input
                  id="progress-images"
                  type="file"
                  accept="image/png, image/jpeg, image/gif"
                  multiple
                  onChange={handleImageChange}
                  disabled={isSavingGoal || userGoalData.images.length >= 3}
                  ref={fileInputRef}
                  className="file:text-primary file:font-semibold file:mr-2"
                />
              </div>
              {userGoalData.imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {userGoalData.imagePreviews.map((previewUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={previewUrl}
                        alt={t('progressImageAlt', { index: index + 1 })}
                        width={150}
                        height={150}
                        className="rounded-md object-cover aspect-square border"
                        data-ai-hint="fitness progress"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isSavingGoal}
                        aria-label={t('deleteMealLabel')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGoalAndImages} disabled={isSavingGoal || isLoadingGoal || !userGoalData.goal.trim()}>
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
        <CardContent>
          <Textarea
            placeholder={t('mealLogPlaceholder')}
            rows={3}
            value={newMealDescription}
            onChange={(e) => setNewMealDescription(e.target.value)}
            disabled={isSavingMeal}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddMeal} disabled={isSavingMeal || !newMealDescription.trim()}>
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
                            {format(meal.date, 'PPP p')}
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
                         <Trash2 className="h-4 w-4 animate-spin" />
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

    