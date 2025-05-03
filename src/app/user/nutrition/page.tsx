'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Apple, CalendarDays, PlusCircle, Trash2, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface MealLog {
  id: string;
  date: Date;
  description: string; // e.g., "Breakfast: Oatmeal with berries", "Lunch: Chicken Salad", "Dinner: Salmon and Veggies"
  calories?: number; // Optional calorie tracking
}

// Simulate fetching/saving data (replace with actual API calls)
async function fetchMeals(): Promise<MealLog[]> {
  await new Promise(resolve => setTimeout(resolve, 650));
  // Fetch from backend, ordered by date descending
  return [
    { id: 'm1', date: new Date(Date.now() - 3600000), description: 'Lunch: Grilled chicken salad with vinaigrette.', calories: 450 },
    { id: 'm2', date: new Date(Date.now() - 18000000), description: 'Breakfast: Greek yogurt with granola and honey.', calories: 300 },
    { id: 'm3', date: new Date(Date.now() - 90000000), description: 'Dinner (Yesterday): Salmon fillet with roasted asparagus.', calories: 600 },
  ];
}

async function addMeal(description: string): Promise<{ success: boolean; newMeal?: MealLog }> {
  await new Promise(resolve => setTimeout(resolve, 750));
  console.log("Adding meal:", description);
  const newMeal: MealLog = {
    id: `m${Date.now()}`,
    date: new Date(),
    description: description,
    // TODO: Potentially parse calories from description or add a separate input
  };
  // Send data to backend
  return { success: true, newMeal };
}

async function deleteMeal(id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 550));
     console.log("Deleting meal:", id);
     // Send delete request to backend
     return { success: true };
}


export default function NutritionPage() {
  const { toast } = useToast();
  const [newMealDescription, setNewMealDescription] = useState('');
  const [mealHistory, setMealHistory] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
   const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchMeals().then(data => {
      setMealHistory(data);
      setIsLoading(false);
    });
  }, []);

  const handleAddMeal = async () => {
    if (!newMealDescription.trim()) {
      toast({
        title: "Empty Log",
        description: "Please describe your meal.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await addMeal(newMealDescription);
      if (result.success && result.newMeal) {
        setMealHistory(prev => [result.newMeal!, ...prev]);
        setNewMealDescription('');
        toast({
          title: "Meal Logged",
          description: "Your meal has been added successfully.",
        });
      } else {
        toast({
          title: "Log Failed",
          description: "Could not save your meal. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to add meal:", error);
       toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

    const handleDeleteMeal = async (id: string) => {
        setDeletingId(id);
        try {
            const result = await deleteMeal(id);
            if(result.success) {
                setMealHistory(prev => prev.filter(m => m.id !== id));
                toast({
                    title: "Meal Deleted",
                    description: "The meal log has been removed.",
                });
            } else {
                 toast({
                    title: "Deletion Failed",
                    description: "Could not delete the meal log.",
                    variant: "destructive",
                });
            }
        } catch (error) {
             console.error("Failed to delete meal:", error);
             toast({
                title: "Error",
                description: "An unexpected error occurred during deletion.",
                variant: "destructive",
             });
        } finally {
            setDeletingId(null);
        }
  };


  // Placeholder: Calculate total calories for today
  const todayCalories = mealHistory
    .filter(meal => format(meal.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Nutrition Log</h1>
      <p className="text-muted-foreground">Track your meals and stay mindful of your eating habits.</p>

       {/* Quick Summary (Optional) */}
       <Card className="shadow-sm bg-secondary">
           <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary"/> Today's Summary
             </CardTitle>
           </CardHeader>
           <CardContent>
              <p className="text-2xl font-bold">{todayCalories} kcal</p>
              <p className="text-xs text-muted-foreground">(Estimated based on logged meals)</p>
           </CardContent>
       </Card>


      {/* Add New Meal Section */}
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
            disabled={isSaving}
          />
          {/* Optional: Add input for calories */}
          {/* <div className="mt-4">
             <Label htmlFor="calories">Estimated Calories (optional)</Label>
             <Input id="calories" type="number" placeholder="e.g., 450" />
          </div> */}
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddMeal} disabled={isSaving || !newMealDescription.trim()}>
            {isSaving ? 'Logging...' : 'Log Meal'}
          </Button>
        </CardFooter>
      </Card>

      {/* Meal History Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Meal History</CardTitle>
          <CardDescription>Your previously logged meals.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
               <div className="h-16 bg-muted rounded animate-pulse"></div>
               <div className="h-16 bg-muted rounded animate-pulse"></div>
               <div className="h-16 bg-muted rounded animate-pulse"></div>
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
                            {format(meal.date, 'PPP p')} {/* Format date and time */}
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
                      disabled={deletingId === meal.id}
                      aria-label="Delete meal"
                       className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === meal.id ? (
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
