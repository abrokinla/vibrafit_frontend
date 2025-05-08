// src/app/user/workouts/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, CheckSquare, Square, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface WorkoutLog {
  id: string;
  date: Date;
  description: string;
}

// Types for workout routines
interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  unit?: 'reps' | 'seconds' | 'minutes'; // Optional: to specify unit for reps (e.g., plank for 30 seconds)
}

interface DailyUserRoutine {
  date: string; // YYYY-MM-DD
  exercises: Exercise[];
  trainerNotes?: string;
}

// Mock data for daily routine - In a real app, this would come from a backend
const mockDailyRoutine: DailyUserRoutine = {
  date: new Date().toISOString().split('T')[0], // Today's date
  exercises: [
    { id: 'ex1', name: 'Push-ups', targetSets: 3, targetReps: 10, unit: 'reps' },
    { id: 'ex2', name: 'Squats', targetSets: 3, targetReps: 12, unit: 'reps' },
    { id: 'ex3', name: 'Plank', targetSets: 3, targetReps: 30, unit: 'seconds' },
    { id: 'ex4', name: 'Lunges (each leg)', targetSets: 3, targetReps: 10, unit: 'reps' },
    { id: 'ex5', name: 'Bicep Curls', targetSets: 3, targetReps: 12, unit: 'reps' },
  ],
  trainerNotes: "Focus on form! Take 60-90 seconds rest between sets. Stay hydrated.",
};

// Simulate fetching this routine
async function fetchDailyRoutineForUser(userId: string, date: string): Promise<DailyUserRoutine | null> {
  console.log(`Fetching routine for user ${userId} on ${date}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
  // For now, return mock data if date is today, otherwise null
  // In a real app, this would fetch from your database based on userId and date
  if (date === new Date().toISOString().split('T')[0]) {
    return mockDailyRoutine;
  }
  return null; // No routine for other days in this mock
}

async function saveWorkoutProgress(userId: string, date: string, completedExercises: Set<string>): Promise<{ success: boolean }> {
    console.log(`Saving progress for user ${userId} on ${date}:`, Array.from(completedExercises));
    await new Promise(resolve => setTimeout(resolve, 700));
    // In a real app, this would update the user's progress in the database
    return { success: true };
}


// Simulate fetching/saving data for manual logs (existing functionality)
async function fetchWorkouts(): Promise<WorkoutLog[]> {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { id: 'w1', date: new Date(Date.now() - 86400000), description: 'Morning run - 5km, felt good.' },
    { id: 'w2', date: new Date(Date.now() - 86400000 * 3), description: 'Upper body strength training - focused on bench press and rows.' },
  ];
}

async function addWorkout(description: string): Promise<{ success: boolean; newWorkout?: WorkoutLog }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const newWorkout: WorkoutLog = {
      id: `w${Date.now()}`,
      date: new Date(),
      description: description,
  };
  return { success: true, newWorkout };
}

async function deleteWorkout(id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 500));
     return { success: true };
}


export default function WorkoutsPage() {
  const { toast } = useToast();
  const [newWorkoutDescription, setNewWorkoutDescription] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [isLoadingManualLogs, setIsLoadingManualLogs] = useState(true);
  const [isSavingManualLog, setIsSavingManualLog] = useState(false);
  const [deletingManualLogId, setDeletingManualLogId] = useState<string | null>(null);

  // State for Trainer-Assigned Routine
  const [dailyRoutine, setDailyRoutine] = useState<DailyUserRoutine | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const userId = "user123"; // Replace with actual user ID from auth/context

  useEffect(() => {
    // Fetch manual logs
    setIsLoadingManualLogs(true);
    fetchWorkouts().then(data => {
      setWorkoutHistory(data);
      setIsLoadingManualLogs(false);
    });

    // Fetch daily routine
    setIsLoadingRoutine(true);
    const today = new Date().toISOString().split('T')[0];
    fetchDailyRoutineForUser(userId, today).then(routine => {
      setDailyRoutine(routine);
      // TODO: Load completed exercises from backend if previously saved
      setCompletedExercises(new Set()); // Reset for now
      setIsLoadingRoutine(false);
    });
  }, [userId]);

  const handleToggleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const routineProgress = useMemo(() => {
    if (!dailyRoutine || dailyRoutine.exercises.length === 0) {
      return 0;
    }
    return (completedExercises.size / dailyRoutine.exercises.length) * 100;
  }, [dailyRoutine, completedExercises]);

  const handleSaveRoutineProgress = async () => {
    if (!dailyRoutine) return;
    setIsSavingProgress(true);
    try {
      const result = await saveWorkoutProgress(userId, dailyRoutine.date, completedExercises);
      if (result.success) {
        toast({ title: "Progress Saved", description: "Your workout progress has been updated." });
      } else {
        toast({ title: "Save Failed", description: "Could not save your progress.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSavingProgress(false);
    }
  };


  const handleAddManualWorkout = async () => {
    if (!newWorkoutDescription.trim()) {
      toast({ title: "Empty Log", description: "Please describe your workout.", variant: "destructive" });
      return;
    }
    setIsSavingManualLog(true);
    try {
      const result = await addWorkout(newWorkoutDescription);
      if (result.success && result.newWorkout) {
        setWorkoutHistory(prev => [result.newWorkout!, ...prev]);
        setNewWorkoutDescription('');
        toast({ title: "Workout Logged", description: "Your ad-hoc workout has been added." });
      } else {
        toast({ title: "Log Failed", description: "Could not save your workout.", variant: "destructive" });
      }
    } catch (error) {
       toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSavingManualLog(false);
    }
  };

  const handleDeleteManualWorkout = async (id: string) => {
    setDeletingManualLogId(id);
    try {
        const result = await deleteWorkout(id);
        if(result.success) {
            setWorkoutHistory(prev => prev.filter(w => w.id !== id));
            toast({ title: "Workout Deleted", description: "The workout log has been removed." });
        } else {
             toast({ title: "Deletion Failed", description: "Could not delete the workout log.", variant: "destructive" });
        }
    } catch (error) {
         toast({ title: "Error", description: "An unexpected error occurred during deletion.", variant: "destructive" });
    } finally {
        setDeletingManualLogId(null);
    }
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Your Workouts</h1>
            <p className="text-muted-foreground">Stay on track with your daily routine and log any extra activities.</p>
        </div>
      </div>

      {/* Trainer Assigned Routine Section */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" /> Today's Routine ({format(new Date(), 'PPP')})
          </CardTitle>
          {dailyRoutine?.trainerNotes && (
            <CardDescription>{dailyRoutine.trainerNotes}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingRoutine ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>)}
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse mt-4"></div>
            </div>
          ) : dailyRoutine ? (
            <div className="space-y-4">
              <div className="space-y-1 mb-4">
                <div className="flex justify-between items-center text-sm mb-1">
                    <span>Progress</span>
                    <span>{completedExercises.size} / {dailyRoutine.exercises.length} exercises</span>
                </div>
                <Progress value={routineProgress} className="w-full h-3" />
                 <p className="text-xs text-muted-foreground text-right">{Math.round(routineProgress)}% complete</p>
              </div>

              <ul className="space-y-3">
                {dailyRoutine.exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`ex-${exercise.id}`}
                        checked={completedExercises.has(exercise.id)}
                        onCheckedChange={() => handleToggleExerciseComplete(exercise.id)}
                        aria-label={`Mark ${exercise.name} as complete`}
                        disabled={isSavingProgress}
                      />
                      <div>
                        <label htmlFor={`ex-${exercise.id}`} className="font-medium cursor-pointer">{exercise.name}</label>
                        <p className="text-xs text-muted-foreground">
                          {exercise.targetSets} sets x {exercise.targetReps} {exercise.unit || 'reps'}
                        </p>
                      </div>
                    </div>
                     {completedExercises.has(exercise.id) && <CheckSquare className="h-5 w-5 text-green-500" />}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No routine assigned for today. Check back later or log an ad-hoc workout below.
            </p>
          )}
        </CardContent>
        {dailyRoutine && (
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveRoutineProgress} disabled={isSavingProgress || isLoadingRoutine}>
                {isSavingProgress ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save My Progress'}
                </Button>
            </CardFooter>
        )}
      </Card>


      {/* Manual Workout Log Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" /> Log Ad-hoc Workout
          </CardTitle>
          <CardDescription>Completed something extra? Record it here.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Went for a 30-minute bike ride, played basketball with friends..."
            rows={3}
            value={newWorkoutDescription}
            onChange={(e) => setNewWorkoutDescription(e.target.value)}
            disabled={isSavingManualLog}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddManualWorkout} disabled={isSavingManualLog || !newWorkoutDescription.trim()}>
            {isSavingManualLog ? 'Logging...' : 'Log Ad-hoc Workout'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Ad-hoc Workout History</CardTitle>
          <CardDescription>Your previously logged ad-hoc workouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingManualLogs ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}
             </div>
          ) : workoutHistory.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No ad-hoc workouts logged yet.</p>
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
                        {format(workout.date, 'PPP')}
                     </p>
                  </div>
                   <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteManualWorkout(workout.id)}
                      disabled={deletingManualLogId === workout.id}
                      aria-label="Delete workout"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deletingManualLogId === workout.id ? (
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
        {workoutHistory.length > 0 && (
             <CardFooter className="text-sm text-muted-foreground">
                Showing your latest ad-hoc workouts.
             </CardFooter>
        )}
      </Card>
    </div>
  );
}
