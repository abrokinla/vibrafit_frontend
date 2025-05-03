'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Use Textarea for logging
import { Dumbbell, CalendarDays, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns'; // For date formatting

interface WorkoutLog {
  id: string;
  date: Date;
  description: string;
}

// Simulate fetching/saving data (replace with actual API calls)
async function fetchWorkouts(): Promise<WorkoutLog[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  // In a real app, fetch from your backend/database, ordered by date descending
  return [
    { id: 'w1', date: new Date(Date.now() - 86400000), description: 'Morning run - 5km, felt good.' },
    { id: 'w2', date: new Date(Date.now() - 86400000 * 3), description: 'Upper body strength training - focused on bench press and rows.' },
    { id: 'w3', date: new Date(Date.now() - 86400000 * 5), description: 'Yoga session - 30 minutes, improved flexibility.' },
  ];
}

async function addWorkout(description: string): Promise<{ success: boolean; newWorkout?: WorkoutLog }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log("Adding workout:", description);
  const newWorkout: WorkoutLog = {
      id: `w${Date.now()}`, // Simple temporary ID
      date: new Date(),
      description: description,
  };
  // In a real app, send data to your backend/database
  return { success: true, newWorkout };
}

async function deleteWorkout(id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 500));
     console.log("Deleting workout:", id);
    // In a real app, send delete request to your backend/database
     return { success: true };
}


export default function WorkoutsPage() {
  const { toast } = useToast();
  const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchWorkouts().then(data => {
      setWorkoutHistory(data);
      setIsLoading(false);
    });
  }, []);

  const handleAddWorkout = async () => {
    if (!newWorkoutDescription.trim()) {
      toast({
        title: "Empty Log",
        description: "Please describe your workout.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await addWorkout(newWorkoutDescription);
      if (result.success && result.newWorkout) {
        setWorkoutHistory(prev => [result.newWorkout!, ...prev]); // Add to the top
        setNewWorkoutDescription(''); // Clear input
        toast({
          title: "Workout Logged",
          description: "Your workout has been added successfully.",
        });
      } else {
        toast({
          title: "Log Failed",
          description: "Could not save your workout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to add workout:", error);
       toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    setDeletingId(id); // Indicate which item is being deleted
    try {
        const result = await deleteWorkout(id);
        if(result.success) {
            setWorkoutHistory(prev => prev.filter(w => w.id !== id));
            toast({
                title: "Workout Deleted",
                description: "The workout log has been removed.",
            });
        } else {
             toast({
                title: "Deletion Failed",
                description: "Could not delete the workout log.",
                variant: "destructive",
            });
        }
    } catch (error) {
         console.error("Failed to delete workout:", error);
         toast({
            title: "Error",
            description: "An unexpected error occurred during deletion.",
            variant: "destructive",
         });
    } finally {
        setDeletingId(null); // Reset deleting indicator
    }
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Workout Log</h1>
      <p className="text-muted-foreground">Record your exercise sessions and track your consistency.</p>

      {/* Add New Workout Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Log New Workout
          </CardTitle>
          <CardDescription>Describe the workout you completed today.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Ran 3 miles in 25 minutes, followed by stretching..."
            rows={4}
            value={newWorkoutDescription}
            onChange={(e) => setNewWorkoutDescription(e.target.value)}
            disabled={isSaving}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddWorkout} disabled={isSaving || !newWorkoutDescription.trim()}>
            {isSaving ? 'Logging...' : 'Log Workout'}
          </Button>
        </CardFooter>
      </Card>

      {/* Workout History Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
          <CardDescription>Your previously logged workouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="space-y-4">
               <div className="h-16 bg-muted rounded animate-pulse"></div>
               <div className="h-16 bg-muted rounded animate-pulse"></div>
               <div className="h-16 bg-muted rounded animate-pulse"></div>
             </div>
          ) : workoutHistory.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No workouts logged yet. Add one above!</p>
          ) : (
            <ul className="space-y-4">
              {workoutHistory.map((workout) => (
                <li key={workout.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200">
                  <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        {workout.description}
                     </p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(workout.date, 'PPP')} {/* Format date nicely */}
                     </p>
                  </div>
                   <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      disabled={deletingId === workout.id}
                      aria-label="Delete workout"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingId === workout.id ? (
                        <Trash2 className="h-4 w-4 animate-spin" /> // Basic loading indicator
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        {workoutHistory.length > 0 && (
             <CardFooter className="text-sm text-muted-foreground">
                Showing your latest workouts.
             </CardFooter>
        )}
      </Card>
    </div>
  );
}
