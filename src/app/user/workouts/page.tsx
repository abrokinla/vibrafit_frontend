
// src/app/user/workouts/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, CheckSquare, Square, RefreshCw, PlayCircle } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format as formatDate } from 'date-fns'; // Renamed to avoid conflict
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useRouter } from '@/navigation'; 
import { useTranslations } from 'next-intl';

interface WorkoutLog {
  id: string;
  date: Date;
  description: string;
}

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

type FetchedRoutine = {
  routine: DailyUserRoutine;
  completedExercises: Set<string>;
};

async function fetchTodayWorkoutLog(token: string): Promise<any | null> {
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch('https://vibrafit.onrender.com/api/daily-logs/', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch logs");
  const logs = await res.json();
  const todayLog = logs.find((log: any) => log.date === today);
  if (!todayLog) return null;
  return {
    id: todayLog.id,
    date: todayLog.date,
    plan: todayLog.plan,
    actual_exercise: JSON.parse(todayLog.actual_exercise || '[]'),
    actual_nutrition: todayLog.actual_nutrition,
    completion_percentage: todayLog.completion_percentage,
    notes: todayLog.notes,
  };
}

async function fetchDailyRoutineForUser(token: string): Promise<FetchedRoutine | null> {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [logsRes, plansRes] = await Promise.all([
      fetch('https://vibrafit.onrender.com/api/daily-logs/', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch('https://vibrafit.onrender.com/api/plans/', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (!logsRes.ok || !plansRes.ok) throw new Error("Failed to fetch logs or plans");
    const logs = await logsRes.json();
    const plans = await plansRes.json();
    const todayLog = logs.find((log: any) => log.date === today);
    let completedExercises = new Set<string>();

    if (todayLog) {
      const matchingPlan = plans.find((plan: any) => plan.planId === todayLog.plan);
      if (!matchingPlan) return null;
      const exercises = matchingPlan.exercises.map((ex: any, index: number) => ({
        id: `ex${index}`, name: ex.name, targetSets: Number(ex.sets),
        targetReps: Number(ex.reps), unit: ex.unit, notes: ex.notes || '',
      }));
      completedExercises = new Set(JSON.parse(todayLog.actual_exercise || '[]'));
      return {
        routine: { date: today, routineName: matchingPlan.routineName, exercises, trainerNotes: todayLog.notes, planId: matchingPlan.planId },
        completedExercises,
      };
    }
    const todayPlan = plans.find((plan: any) => {
      const planStartDate = new Date(plan.startDate);
      const todayDate = new Date();
      return plan.frequency === 'daily' && planStartDate <= todayDate;
    });
    if (!todayPlan) return null;
    const exercises = todayPlan.exercises.map((ex: any, index: number) => ({
      id: `ex${index}`, name: ex.name, targetSets: Number(ex.sets),
      targetReps: Number(ex.reps), unit: ex.unit, notes: ex.notes || '',
    }));
    return {
      routine: { date: todayPlan.startDate, routineName: todayPlan.routineName, exercises, trainerNotes: '', planId: todayPlan.planId },
      completedExercises: new Set(),
    };
  } catch (err) {
    console.error("Error fetching today's routine:", err);
    return null;
  }
}

async function saveWorkoutProgress(token: string, planId: number, completedExercises: Set<string>, totalExercises: number, notes: string) {
  const today = new Date().toISOString().split('T')[0];
  const payload = {
    plan: planId, date: today, actual_nutrition: "",
    actual_exercise: JSON.stringify(Array.from(completedExercises)),
    completion_percentage: totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0,
    notes,
  };  
  const response = await fetch('https://vibrafit.onrender.com/api/daily-logs/', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },    
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to save workout:", errorData);
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
    id: log.id, date: new Date(log.date),
    description: log.notes || "Workout logged", 
  }));
}

async function addWorkout(description: string): Promise<{ success: boolean; newWorkout?: WorkoutLog }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const newWorkout: WorkoutLog = { id: `w${Date.now()}`, date: new Date(), description: description };
  return { success: true, newWorkout };
}

async function deleteWorkout(id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 500));
     return { success: true };
}

export default function WorkoutsPage() {
  const t = useTranslations('WorkoutsPage');
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
  
  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.push('/signin');
      return;
    }
    setIsLoadingRoutine(true);
    fetchDailyRoutineForUser(token)
      .then(result => {
        if (result) { setDailyRoutine(result.routine); setCompletedExercises(result.completedExercises); }
        else { setDailyRoutine(null); setCompletedExercises(new Set()); }
      })
      .catch(err => { console.error(err); toast({title: t('toastErrorGeneric'), description: t('toastErrorLoadRoutine'), variant: "destructive"})})
      .finally(() => setIsLoadingRoutine(false));
    setIsLoadingManualLogs(true);
    fetchWorkouts(token)
      .then(data => setWorkoutHistory(data))
      .catch(err => { console.error(err); toast({title: t('toastErrorGeneric'), description: t('toastErrorLoadHistory'), variant: "destructive"})})
      .finally(() => setIsLoadingManualLogs(false));
  }, [token, router, toast, t]);

  const handleToggleExerciseComplete = (exerciseId: string, checked: boolean | string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (checked) newSet.add(exerciseId); else newSet.delete(exerciseId);
      return newSet;
    });
  };

  const routineProgress = useMemo(() => {
    if (!dailyRoutine || dailyRoutine.exercises.length === 0) return 0;
    return (completedExercises.size / dailyRoutine.exercises.length) * 100;
  }, [dailyRoutine, completedExercises]);

  const handleSaveRoutineProgress = async () => {
    if (!dailyRoutine || !dailyRoutine.planId) {
        toast({ title: t('toastErrorGeneric'), description: t('toastErrorNoRoutineToSave'), variant: "destructive" }); return;
    }
    if (!token) { toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" }); return; }
    setIsSavingProgress(true);
    try {
      const result = await saveWorkoutProgress(token, dailyRoutine.planId, completedExercises, dailyRoutine.exercises.length, '');
      if (result.success) toast({ title: t('toastProgressSaved'), description: t('toastProgressSavedDesc') });
      else toast({ title: t('toastSaveFailed'), description: (result.error as any)?.detail || t('toastSaveFailedDesc'), variant: "destructive" });
    } catch (error) {
      toast({ title: t('toastErrorGeneric'), description: t('toastErrorGeneric'), variant: "destructive" });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    toast({ title: t('toastVideoPlaybackTitle'), description: t('toastVideoPlaybackDesc', { videoUrl }) });
  };

  const handleAddManualWorkout = async () => {
    if (!newWorkoutDescription.trim()) { toast({ title: t('toastEmptyLogTitle'), description: t('toastEmptyLogDesc'), variant: "destructive" }); return; }
    setIsSavingManualLog(true);
    try {
      const result = await addWorkout(newWorkoutDescription); 
      if (result.success && result.newWorkout) {
        setWorkoutHistory(prev => [result.newWorkout!, ...prev]);
        setNewWorkoutDescription('');
        toast({ title: t('toastWorkoutLoggedTitle'), description: t('toastWorkoutLoggedDesc') });
      } else toast({ title: t('toastLogFailedTitle'), description: t('toastLogFailedDesc'), variant: "destructive" });
    } catch (error) { toast({ title: t('toastErrorGeneric'), description: t('toastErrorGeneric'), variant: "destructive" });
    } finally { setIsSavingManualLog(false); }
  };

  const handleDeleteManualWorkout = async (id: string) => {
    setDeletingManualLogId(id);
    try {
      const result = await deleteWorkout(id);
      if(result.success) {
        setWorkoutHistory(prev => prev.filter(w => w.id !== id));
        toast({ title: t('toastWorkoutDeletedTitle'), description: t('toastWorkoutDeletedDesc') });
      } else toast({ title: t('toastDeletionFailedTitle'), description: t('toastDeletionFailedDesc'), variant: "destructive" });
    } catch (error) { toast({ title: t('toastErrorGeneric'), description: t('toastErrorGeneric'), variant: "destructive" });
    } finally { setDeletingManualLogId(null); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
        </div>
      </div>
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" /> 
            {dailyRoutine?.routineName ? t('todaysRoutineTitle', {routineName: dailyRoutine.routineName}) : t('todaysRoutineNoNameTitle')} ({t('dateFormat', {date: new Date()})})
          </CardTitle>
          {dailyRoutine?.trainerNotes && ( <CardDescription className="pt-1 text-sm">{dailyRoutine.trainerNotes}</CardDescription> )}
        </CardHeader>
        <CardContent>
          {isLoadingRoutine ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>)}
              <div className="h-4 w-1/2 bg-muted rounded animate-pulse mt-4"></div>
              <div className="h-10 w-1/3 bg-muted rounded animate-pulse mt-2"></div></div>
          ) : dailyRoutine && dailyRoutine.exercises.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm mb-1 font-medium">
                    <span>{t('progressLabel', { completed: completedExercises.size, total: dailyRoutine.exercises.length })}</span>
                    <span>{Math.round(routineProgress)}%</span></div>
                <Progress value={routineProgress} className="w-full h-3 [&>div]:bg-green-500" /></div>
              <ul className="space-y-3">
                {dailyRoutine.exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center justify-between p-3.5 bg-card border rounded-lg hover:bg-secondary/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox id={`ex-${exercise.id}`} checked={completedExercises.has(exercise.id)}
                        onCheckedChange={(checked) => handleToggleExerciseComplete(exercise.id, checked)}
                        aria-label={t('markExerciseCompleteLabel', { exerciseName: exercise.name})}
                        disabled={isSavingProgress} className="h-5 w-5" />
                      <div className="flex-1">
                        <label htmlFor={`ex-${exercise.id}`} className="font-medium cursor-pointer block">{exercise.name}</label>
                        <p className="text-xs text-muted-foreground">{exercise.targetSets} sets &times; {exercise.targetReps} {exercise.unit}</p>
                        {exercise.notes && <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Note: {exercise.notes}</p>}</div></div>
                    <div className="flex items-center gap-2">
                        {exercise.videoUrl && (<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePlayVideo(exercise.videoUrl!)} aria-label={t('videoLinkLabel', {exerciseName: exercise.name})}>
                                <PlayCircle className="h-4 w-4" /></Button>)}
                        {completedExercises.has(exercise.id) && <CheckSquare className="h-5 w-5 text-green-500" />}</div></li>))}</ul></div>
          ) : ( <p className="text-muted-foreground text-center py-8 text-lg" dangerouslySetInnerHTML={{ __html: t.raw('noRoutineAssigned') }} /> )}
        </CardContent>
        {dailyRoutine && dailyRoutine.exercises.length > 0 && (
            <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSaveRoutineProgress} disabled={isSavingProgress || isLoadingRoutine} size="lg">
                {isSavingProgress ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> {t('savingProgressButton')}</> : t('saveProgressButton')}</Button></CardFooter>)}</Card>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> {t('logAdHocTitle')}</CardTitle>
          <CardDescription>{t('logAdHocDescription')}</CardDescription></CardHeader>
        <CardContent><Textarea placeholder={t('adHocPlaceholder')} rows={3} value={newWorkoutDescription}
            onChange={(e) => setNewWorkoutDescription(e.target.value)} disabled={isSavingManualLog} /></CardContent>
        <CardFooter><Button onClick={handleAddManualWorkout} disabled={isSavingManualLog || !newWorkoutDescription.trim()}>
            {isSavingManualLog ? t('loggingAdHocButton') : t('logAdHocButton')}</Button></CardFooter></Card>
      <Card className="shadow-sm">
        <CardHeader><CardTitle>{t('adHocHistoryTitle')}</CardTitle><CardDescription>{t('adHocHistoryDescription')}</CardDescription></CardHeader>
        <CardContent>{isLoadingManualLogs ? ( <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}</div>
          ) : workoutHistory.length === 0 ? ( <p className="text-muted-foreground text-center py-4">{t('noAdHocWorkouts')}</p>
          ) : ( <ul className="space-y-4">{workoutHistory.map((workout) => (
                <li key={workout.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200 shadow-sm">
                  <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium flex items-center gap-2"><Dumbbell className="h-4 w-4 text-muted-foreground" />{workout.description}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />
                        {formatDate(new Date(workout.date), 'PPP')}</p></div>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteManualWorkout(workout.id)}
                      disabled={deletingManualLogId === workout.id} aria-label={t('deleteWorkoutLabel')}
                      className="text-muted-foreground hover:text-destructive h-8 w-8">
                      {deletingManualLogId === workout.id ? ( <Trash2 className="h-4 w-4 animate-spin" />) : (<Trash2 className="h-4 w-4" />)}</Button></li>))}</ul>)}</CardContent>
        {workoutHistory.length > 0 && ( <CardFooter className="text-sm text-muted-foreground border-t pt-3 mt-3">{t('latestAdHocFooter')}</CardFooter> )}</Card></div>
  );
}

    