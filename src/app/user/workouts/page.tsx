
// src/app/user/workouts/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, CheckSquare, Square, RefreshCw, PlayCircle } from "lucide-react"; // Added PlayCircle
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
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
  videoUrl?: string; 
}

interface DailyUserRoutine {
  date: string; 
  routineName?: string; 
  exercises: Exercise[];
  trainerNotes?: string;
  planId: number;
}


async function fetchDailyRoutineForUser(token: string): Promise<(DailyUserRoutine & { planId: number }) | null> {
  const today = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch('https://vibrafit.onrender.com/api/plans/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch routine");

    const data = await res.json();

    const todayPlan = data.find((plan: any) => plan.startDate === today);
    if (!todayPlan) return null;

    return {
      date: todayPlan.startDate,
      routineName: todayPlan.routineName,
      exercises: todayPlan.exercises.map((ex: any, index: number) => ({
        PlanId: `ex${index}`,
        name: ex.name,
        targetSets: Number(ex.sets),
        targetReps: Number(ex.reps),
        unit: ex.unit,
        notes: ex.notes || '',
      })),
      trainerNotes: '',
      planId: todayPlan.planId, 
    };
  } catch (err) {
    console.error("Error fetching today's routine:", err);
    return null;
  }
}

async function saveWorkoutProgress(token: string, planId: number, completedExercises: Set<string>, totalExercises: number, notes: string) {
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    plan: planId,
    date: today,
    actual_nutrition: "",
    actual_exercise: JSON.stringify(Array.from(completedExercises)),
    completion_percentage: (completedExercises.size / totalExercises) * 100,
    notes,
  };

  const response = await fetch('https://vibrafit.onrender.com/api/daily-logs/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData };
  }

  return { success: true };
}

async function fetchWorkouts(token: string): Promise<WorkoutLog[]> {
  const res = await fetch('https://vibrafit.onrender.com/api/daily-logs/', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch logs");

  const data = await res.json();
  return data.map((log: any) => ({
    id: log.id,
    date: new Date(log.date),
    description: log.description,
  }));
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

  const [dailyRoutine, setDailyRoutine] = useState<DailyUserRoutine | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null); // For video modal
  
  
  useEffect(() => {
    setIsLoadingRoutine(true);
    const token = localStorage.getItem('accessToken')
      if (!token) {
        console.error("No auth token—please log in first");
        return;
      }
    fetchDailyRoutineForUser(token)
      .then(routine => {
        setDailyRoutine(routine);
        setCompletedExercises(new Set());
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingRoutine(false));

    setIsLoadingManualLogs(true);
    fetchWorkouts(token)
      .then(data => setWorkoutHistory(data))
      .catch(err => console.error(err))
      .finally(() => setIsLoadingManualLogs(false));
  }, [token]);

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
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error("No auth token—please log in first");
    toast({ title: "Not logged in", description: "Please login to save progress.", variant: "destructive" });
    return;
  }
  setIsSavingProgress(true);
  try {
    const result = await saveWorkoutProgress(
      token,  // pass token first!
      dailyRoutine.planId,
      completedExercises,
      dailyRoutine.exercises.length,
      ''
    );
    if (result.success) {
      toast({ title: "Progress Saved!", description: "Your workout for today has been logged." });
    } else {
      toast({ title: "Save Failed", description: "Could not save your progress. Please try again.", variant: "destructive" });
    }
  } catch (error) {
    toast({ title: "Error", description: "An unexpected error occurred while saving progress.", variant: "destructive" });
  } finally {
    setIsSavingProgress(false);
  }
};


  const handlePlayVideo = (videoUrl: string) => {
    // For now, just log. In a real app, this would open a modal with a video player.
    console.log("Attempting to play video:", videoUrl);
    toast({ title: "Video Playback", description: `Video player for ${videoUrl} would open here.`});
    // setPlayingVideoUrl(videoUrl); // This would trigger a modal
  };


  const handleAddManualWorkout = async () => {
    // ... (existing manual workout logic)
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
    // ... (existing manual workout logic)
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
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">Your Workouts</h1>
            <p className="text-muted-foreground">Follow your plan, track completion, and log any extra activities.</p>
        </div>
        {/* Optional: Button to "Start Training" if not directly on dashboard */}
      </div>

      {/* Trainer Assigned Routine Section */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" /> 
            {dailyRoutine?.routineName ? `Today's Routine: ${dailyRoutine.routineName}` : `Today's Routine`} ({format(new Date(), 'PPP')})
          </CardTitle>
          {dailyRoutine?.trainerNotes && (
            <CardDescription className="pt-1 text-sm">{dailyRoutine.trainerNotes}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingRoutine ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>)}
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-4"></div>
              <div className="h-10 w-1/3 bg-muted rounded animate-pulse mt-2"></div>
            </div>
          ) : dailyRoutine ? (
            <div className="space-y-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm mb-1 font-medium">
                    <span>Progress: {completedExercises.size} / {dailyRoutine.exercises.length} done</span>
                    <span>{Math.round(routineProgress)}%</span>
                </div>
                <Progress value={routineProgress} className="w-full h-3 [&>div]:bg-green-500" />
              </div>

              <ul className="space-y-3">
                {dailyRoutine.exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center justify-between p-3.5 bg-card border rounded-lg hover:bg-secondary/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        id={`ex-${exercise.id}`}
                        checked={completedExercises.has(exercise.id)}
                        onCheckedChange={() => handleToggleExerciseComplete(exercise.id)}
                        aria-label={`Mark ${exercise.name} as complete`}
                        disabled={isSavingProgress}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <label htmlFor={`ex-${exercise.id}`} className="font-medium cursor-pointer block">{exercise.name}</label>
                        <p className="text-xs text-muted-foreground">
                          {exercise.targetSets} sets &times; {exercise.targetReps} {exercise.unit}
                        </p>
                        {exercise.notes && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Note: {exercise.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {exercise.videoUrl && (
                           <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePlayVideo(exercise.videoUrl!)} aria-label={`Play video for ${exercise.name}`}>
                                <PlayCircle className="h-4 w-4" />
                           </Button>
                        )}
                        {completedExercises.has(exercise.id) && <CheckSquare className="h-5 w-5 text-green-500" />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8 text-lg">
              No workout routine assigned for today. <br/>
              You can log an ad-hoc workout below, or check back later!
            </p>
          )}
        </CardContent>
        {dailyRoutine && dailyRoutine.exercises.length > 0 && (
            <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSaveRoutineProgress} disabled={isSavingProgress || isLoadingRoutine} size="lg">
                {isSavingProgress ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Saving Progress...</> : 'Mark Day as Complete'}
                </Button>
            </CardFooter>
        )}
      </Card>

      {/* Video Player Modal (Conceptual) */}
      {/* {playingVideoUrl && (
        <Dialog open={!!playingVideoUrl} onOpenChange={() => setPlayingVideoUrl(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Exercise Video</DialogTitle></DialogHeader>
            <video src={playingVideoUrl} controls autoPlay className="w-full rounded-md aspect-video"></video>
          </DialogContent>
        </Dialog>
      )} */}


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
               {[1,2].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}
             </div>
          ) : workoutHistory.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No ad-hoc workouts logged yet.</p>
          ) : (
            <ul className="space-y-4">
              {workoutHistory.map((workout) => (
                <li key={workout.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200 shadow-sm">
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
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
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
             <CardFooter className="text-sm text-muted-foreground border-t pt-3 mt-3">
                Showing your latest ad-hoc workouts.
             </CardFooter>
        )}
      </Card>
    </div>
  );
}

    