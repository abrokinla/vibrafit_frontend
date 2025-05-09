'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // For file input
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Apple, CalendarDays, PlusCircle, Trash2, Utensils, Target, ImagePlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import Image from 'next/image'; // For image previews

interface MealLog {
  id: string;
  date: Date;
  description: string;
  calories?: number;
}

interface UserGoalAndImages {
    goal: string;
    images: File[]; // Store selected files for upload
    imagePreviews: string[]; // Store Data URLs for previews
}

// Simulate fetching/saving data (replace with actual API calls)
async function fetchMeals(): Promise<MealLog[]> {
  await new Promise(resolve => setTimeout(resolve, 650));
  return [
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
    // Simulate fetching existing goal and image URLs
    await new Promise(resolve => setTimeout(resolve, 400));
    return { goal: "", imageUrls: [] }; // Initially empty, or load from backend
}

async function saveUserGoalAndImages(userId: string, goal: string, images: File[]): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Saving goal:", goal, "for user:", userId);
    console.log("Saving images:", images.map(f => f.name));
    // In a real app:
    // 1. Upload images to cloud storage (e.g., Firebase Storage)
    // 2. Get the URLs of the uploaded images
    // 3. Save the goal text and image URLs to your database (e.g., Firestore)
    return { success: true };
}


export default function NutritionPage() {
  const { toast } = useToast();
  const [newMealDescription, setNewMealDescription] = useState('');
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState<string | null>(null);

  // State for Goal and Images
  const [userGoalData, setUserGoalData] = useState<UserGoalAndImages>({ goal: '', images: [], imagePreviews: [] });
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [isSavingGoal, setIsSavingGoal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Simulating userId, replace with actual user ID from auth/context
  const userId = "user123";

  useEffect(() => {
    setIsLoadingMeals(true);
    fetchMeals().then(data => {
      setMealHistory(data);
      setIsLoadingMeals(false);
    });

    setIsLoadingGoal(true);
    fetchUserGoalAndImages(userId).then(data => {
        setUserGoalData(prev => ({ ...prev, goal: data.goal, imagePreviews: data.imageUrls /* Assume imageUrls are fetched if any exist */ }));
        setIsLoadingGoal(false);
    });

  }, [userId]);

  const handleAddMeal = async () => {
    if (!newMealDescription.trim()) {
      toast({ title: "Empty Log", description: "Please describe your meal.", variant: "destructive" });
      return;
    }
    setIsSavingMeal(true);
    try {
      const result = await addMeal(newMealDescription);
      if (result.success && result.newMeal) {
        setMealHistory(prev => [result.newMeal!, ...prev]);
        setNewMealDescription('');
        toast({ title: "Meal Logged", description: "Your meal has been added successfully." });
      } else {
        toast({ title: "Log Failed", description: "Could not save your meal.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
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
        toast({ title: "Meal Deleted", description: "The meal log has been removed." });
      } else {
        toast({ title: "Deletion Failed", description: "Could not delete the meal log.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred during deletion.", variant: "destructive" });
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
      // Limit number of images if needed, e.g., to 3
      const newImages = filesArray.slice(0, 3 - userGoalData.images.length);

      const newPreviews = newImages.map(file => URL.createObjectURL(file));

      setUserGoalData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
      }));
      // Clear file input for next selection
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUserGoalData(prev => {
        const updatedImages = prev.images.filter((_, index) => index !== indexToRemove);
        const updatedPreviews = prev.imagePreviews.filter((_, index) => index !== indexToRemove);
        // Revoke object URL for the removed preview to free up memory
        URL.revokeObjectURL(prev.imagePreviews[indexToRemove]);
        return { ...prev, images: updatedImages, imagePreviews: updatedPreviews };
    });
  };

  const handleSaveGoalAndImages = async () => {
    if (!userGoalData.goal.trim()) {
        toast({ title: "Goal Required", description: "Please enter your fitness goal.", variant: "destructive"});
        return;
    }
    setIsSavingGoal(true);
    try {
        const result = await saveUserGoalAndImages(userId, userGoalData.goal, userGoalData.images);
        if (result.success) {
            toast({ title: "Goal & Images Saved", description: "Your fitness goal and images have been updated." });
            // Optionally clear images after saving if desired, or refetch from backend
            // setUserGoalData(prev => ({...prev, images: [], imagePreviews: []}));
        } else {
            toast({ title: "Save Failed", description: "Could not save your goal and images.", variant: "destructive" });
        }
    } catch (error) {
        toast({ title: "Error", description: "An unexpected error occurred while saving.", variant: "destructive"});
    } finally {
        setIsSavingGoal(false);
    }
  };


  const todayCalories = mealHistory
    .filter(meal => format(meal.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Nutrition & Goals</h1>
      <p className="text-muted-foreground">Log your meals, set your fitness goals, and share progress with your trainer.</p>

      {/* Goal Setting and Image Upload Section */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-6 w-6" /> My Fitness Goal & Progress
          </CardTitle>
          <CardDescription>Set or update your primary fitness goal and upload current state images for your trainer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoadingGoal ? (
            <div className="h-20 bg-muted rounded animate-pulse"></div>
          ) : (
            <>
              <div>
                <Label htmlFor="fitness-goal" className="text-base font-medium">Your Fitness Goal</Label>
                <Textarea
                  id="fitness-goal"
                  placeholder="e.g., Lose 5kg in 2 months, run a 10k under 60 minutes, increase bench press by 10kg..."
                  rows={3}
                  value={userGoalData.goal}
                  onChange={handleGoalChange}
                  disabled={isSavingGoal}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="progress-images" className="text-base font-medium">Progress Images (Optional)</Label>
                <p className="text-xs text-muted-foreground mb-2">Upload up to 3 images (PNG, JPG, GIF).</p>
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
                        alt={`Progress image ${index + 1}`}
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
            {isSavingGoal ? 'Saving Goal...' : 'Save Goal & Images'}
          </Button>
        </CardFooter>
      </Card>


       <Card className="shadow-sm bg-secondary">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary"/> Today's Meal Summary
             </CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-2xl font-bold">{todayCalories} kcal</p>
              <p className="text-xs text-muted-foreground">(Estimated based on logged meals)</p>
           </CardContent>
       </Card>


      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Log New Meal
          </CardTitle>
          <CardDescription>Describe what you ate and optionally estimate calories.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Breakfast: Scrambled eggs with spinach (~350 kcal)"
            rows={3}
            value={newMealDescription}
            onChange={(e) => setNewMealDescription(e.target.value)}
            disabled={isSavingMeal}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddMeal} disabled={isSavingMeal || !newMealDescription.trim()}>
            {isSavingMeal ? 'Logging...' : 'Log Meal'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Meal History</CardTitle>
          <CardDescription>Your previously logged meals.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMeals ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}
             </div>
          ) : mealHistory.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No meals logged yet. Add one above!</p>
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
                            <span className="font-medium">{meal.calories} kcal</span>
                         )}
                     </div>
                  </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMeal(meal.id)}
                      disabled={deletingMealId === meal.id}
                      aria-label="Delete meal"
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
                Showing your latest meal entries.
             </CardFooter>
        )}
      </Card>
    </div>
  );
}

