// src/app/[locale]/user/workouts/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, CheckSquare, RefreshCw, PlayCircle, Loader2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format as formatDate, parseISO } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useRouter } from '@/navigation'; 
import { useTranslations } from 'next-intl';

interface WorkoutLogEntry { // For manually logged workouts
  id: string; // or number, matching backend
  date: Date;
  notes: string; // Changed from description to notes
  // Add other fields if your manual log has more, e.g., type of workout
}

interface Exercise {
  id: string; // Client-side ID for React key
  exercise_id?: number; // Backend ID if available
  name: string;
  sets: number; // Changed from string to number
  reps: number; // Changed from string to number
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
  videoUrl?: string; 
}

interface DailyUserRoutine {
  planId: number;
  date: string; 
  routineName?: string; 
  exercises: Exercise[];
  trainerNotes?: string;
}

// Type for data fetched from /api/daily-logs/ (individual log)
interface DailyLog {
    id: number;
    plan: number; // Plan ID
    date: string; // YYYY-MM-DD
    actual_exercise: string; // JSON string of completed exercise IDs/details
    actual_nutrition: string; // Potentially JSON string or text
    completion_percentage: number;
    notes: string;
    user: number; // User ID
}


async function fetchTodayAssignedRoutine(token: string): Promise<DailyUserRoutine | null> {
  const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
  try {
    const plansRes = await fetch('https://vibrafit.onrender.com/api/plans/today/', { // Assuming an endpoint for today's plan
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!plansRes.ok) {
        if (plansRes.status === 404) return null; // No plan for today
        throw new Error(`Failed to fetch today's plan: ${plansRes.statusText}`);
    }
    const planData = await plansRes.json();
    if (!planData || planData.length === 0) return null; // No plan assigned for today

    const assignedPlan = planData[0]; // Assuming the first one is the relevant plan for today

    return {
      planId: assignedPlan.planId,
      date: todayStr, // Or assignedPlan.startDate if it's a one-off for that date
      routineName: assignedPlan.routineName,
      exercises: assignedPlan.exercises.map((ex: any, index: number) => ({
        id: `ex-${assignedPlan.planId}-${index}`, // More unique client-side ID
        exercise_id: ex.id, // Assuming backend exercise has an id
        name: ex.name,
        sets: parseInt(ex.sets, 10) || 0,
        reps: parseInt(ex.reps, 10) || 0,
        unit: ex.unit as 'reps' | 'seconds' | 'minutes',
        notes: ex.notes,
        videoUrl: ex.video_url, // Ensure your API provides this if needed
      })),
      trainerNotes: assignedPlan.notes || '', // Assuming plan might have notes
    };
  } catch (err) {
    console.error("Error fetching today's assigned routine:", err);
    return null;
  }
}

async function fetchTodayWorkoutLog(token: string, planId: number | undefined): Promise<Set<string>> {
  if (!planId) return new Set(); // No plan, no completed exercises for it
  const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
  try {
    const logsRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${todayStr}&plan_id=${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!logsRes.ok) {
      if (logsRes.status === 404) return new Set(); // No log found for this plan today
      throw new Error('Failed to fetch today\'s workout log');
    }
    const logs = await logsRes.json();
    const todayLog = logs.find((log: DailyLog) => log.plan === planId); // Ensure we match the plan_id

    if (todayLog && todayLog.actual_exercise) {
      try {
        return new Set<string>(JSON.parse(todayLog.actual_exercise));
      } catch (e) {
        console.error("Error parsing actual_exercise JSON:", e);
        return new Set<string>();
      }
    }
    return new Set<string>();
  } catch (err) {
    console.error("Error fetching today's workout log:", err);
    return new Set<string>();
  }
}


async function saveWorkoutProgress(token: string, planId: number, completedExerciseIds: string[], notes: string) {
  const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
  
  // Fetch existing log for today and this plan ID to get its ID for PATCH, or POST if none.
  let existingLogId: number | null = null;
  try {
    const logsRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${todayStr}&plan_id=${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (logsRes.ok) {
        const logs = await logsRes.json();
        const todayLog = logs.find((log: DailyLog) => log.plan === planId);
        if (todayLog) existingLogId = todayLog.id;
    }
  } catch (e) {
      console.warn("Could not check for existing daily log:", e);
  }

  const method = existingLogId ? 'PATCH' : 'POST';
  const url = existingLogId 
    ? `https://vibrafit.onrender.com/api/daily-logs/${existingLogId}/` 
    : 'https://vibrafit.onrender.com/api/daily-logs/';

  const payload = {
    plan: planId,
    date: todayStr,
    actual_exercise: JSON.stringify(completedExerciseIds), // Array of exercise IDs (client-side string IDs)
    // actual_nutrition: "", // Handled elsewhere or not part of this save
    // completion_percentage: calculate based on total exercises in routine if needed by backend
    notes: notes,
  };
  
  const response = await fetch(url, {
    method: method, 
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },    
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to save workout progress:", errorData);
    throw new Error(errorData.detail || `Failed to save progress (${response.status})`);
  }
  return { success: true, data: await response.json() };
}

// Ad-hoc workout log functions (simulated, replace with API calls)
async function fetchAdHocWorkouts(token: string): Promise<WorkoutLogEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    {id: 'adhoc1', date: new Date(Date.now() - 86400000 * 2), notes: 'Evening 5km run'},
    {id: 'adhoc2', date: new Date(Date.now() - 86400000 * 5), notes: '30 min Yoga session'},
  ];
}

async function addAdHocWorkout(token: string, notes: string): Promise<{ success: boolean; newWorkout?: WorkoutLogEntry }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  const newWorkout: WorkoutLogEntry = { id: `adhoc${Date.now()}`, date: new Date(), notes: notes };
  return { success: true, newWorkout };
}

async function deleteAdHocWorkout(token: string, id: string): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 500));
     return { success: true };
}

export default function WorkoutsPage() {
  const t = useTranslations('WorkoutsPage');
  const { toast } = useToast();
  const [adHocNotes, setAdHocNotes] = useState('');
  const [adHocHistory, setAdHocHistory] = useState<WorkoutLogEntry[]>([]);
  const [isLoadingAdHoc, setIsLoadingAdHoc] = useState(true);
  const [isSavingAdHoc, setIsSavingAdHoc] = useState(false);
  const [deletingAdHocId, setDeletingAdHocId] = useState<string | null>(null);

  const [dailyRoutine, setDailyRoutine] = useState<DailyUserRoutine | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set()); // Store client-side exercise IDs
  const [userNotes, setUserNotes] = useState('');
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  
  const router = useRouter();
  
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push('/signin');
      return;
    }

    setIsLoadingRoutine(true);
    setIsLoadingAdHoc(true);

    const loadRoutineData = async () => {
      try {
        const routine = await fetchTodayAssignedRoutine(token);
        setDailyRoutine(routine);
        if (routine && routine.planId) {
          const completed = await fetchTodayWorkoutLog(token, routine.planId);
          setCompletedExercises(completed);
          // Fetch notes for today's log if routine exists
          const todayLogRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${formatDate(new Date(), 'yyyy-MM-dd')}&plan_id=${routine.planId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (todayLogRes.ok) {
            const logs = await todayLogRes.json();
            const currentLog = logs.find((l: DailyLog) => l.plan === routine.planId);
            if (currentLog) setUserNotes(currentLog.notes || '');
          }
        }
      } catch (err: any) {
        console.error("Error loading routine data:", err);
        toast({title: t('toastErrorGeneric'), description: err.message || t('toastErrorLoadRoutine'), variant: "destructive"})
      } finally {
        setIsLoadingRoutine(false);
      }
    };

    const loadAdHocData = async () => {
      try {
        const history = await fetchAdHocWorkouts(token);
        setAdHocHistory(history);
      } catch (err: any) {
        console.error("Error loading ad-hoc history:", err);
        toast({title: t('toastErrorGeneric'), description: err.message || t('toastErrorLoadHistory'), variant: "destructive"})
      } finally {
        setIsLoadingAdHoc(false);
      }
    };
    
    loadRoutineData();
    loadAdHocData();

  }, [token, router, toast, t]);

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
    if (!dailyRoutine || dailyRoutine.exercises.length === 0) return 0;
    return (completedExercises.size / dailyRoutine.exercises.length) * 100;
  }, [dailyRoutine, completedExercises]);

  const handleSaveRoutineProgress = async () => {
    if (!dailyRoutine || !dailyRoutine.planId) {
        toast({ title: t('toastErrorGeneric'), description: t('toastErrorNoRoutineToSave'), variant: "destructive" }); return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) { toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" }); return; }
    
    setIsSavingProgress(true);
    try {
      const result = await saveWorkoutProgress(token, dailyRoutine.planId, Array.from(completedExercises), userNotes);
      if (result.success) toast({ title: t('toastProgressSaved'), description: t('toastProgressSavedDesc') });
      else toast({ title: t('toastSaveFailed'), description: (result as any).error?.detail || t('toastSaveFailedDesc'), variant: "destructive" });
    } catch (error: any) {
      toast({ title: t('toastErrorGeneric'), description: error.message || t('toastErrorGenericDesc'), variant: "destructive" });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank'); // Open video in new tab
  };

  const handleAddAdHocWorkout = async () => {
    if (!adHocNotes.trim()) { toast({ title: t('toastEmptyLogTitle'), description: t('toastEmptyLogDesc'), variant: "destructive" }); return; }
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) { toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" }); return; }

    setIsSavingAdHoc(true);
    try {
      const result = await addAdHocWorkout(token, adHocNotes); 
      if (result.success && result.newWorkout) {
        setAdHocHistory(prev => [result.newWorkout!, ...prev]);
        setAdHocNotes('');
        toast({ title: t('toastWorkoutLoggedTitle'), description: t('toastWorkoutLoggedDesc') });
      } else toast({ title: t('toastLogFailedTitle'), description: t('toastLogFailedDesc'), variant: "destructive" });
    } catch (error: any) { toast({ title: t('toastErrorGeneric'), description: error.message || t('toastErrorGenericDesc'), variant: "destructive" });
    } finally { setIsSavingAdHoc(false); }
  };

  const handleDeleteAdHocWorkout = async (id: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) { toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" }); return; }
    
    setDeletingAdHocId(id);
    try {
      const result = await deleteAdHocWorkout(token, id);
      if(result.success) {
        setAdHocHistory(prev => prev.filter(w => w.id !== id));
        toast({ title: t('toastWorkoutDeletedTitle'), description: t('toastWorkoutDeletedDesc') });
      } else toast({ title: t('toastDeletionFailedTitle'), description: t('toastDeletionFailedDesc'), variant: "destructive" });
    } catch (error: any) { toast({ title: t('toastErrorGeneric'), description: error.message || t('toastErrorGenericDesc'), variant: "destructive" });
    } finally { setDeletingAdHocId(null); }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Dumbbell className="h-6 w-6" /> 
            {dailyRoutine?.routineName ? t('todaysRoutineTitle', {routineName: dailyRoutine.routineName}) : t('todaysRoutineNoNameTitle')} ({dailyRoutine ? formatDate(parseISO(dailyRoutine.date), 'PPP') : t('dateFormat', {date: new Date()})})
          </CardTitle>
          {dailyRoutine?.trainerNotes && ( <CardDescription className="pt-1 text-sm italic text-blue-600 dark:text-blue-400">{t('trainerNotesLabel')}: {dailyRoutine.trainerNotes}</CardDescription> )}
        </CardHeader>
        <CardContent>
          {isLoadingRoutine ? (
            <div className="space-y-3 p-4">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}</div>
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
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox id={exercise.id} checked={completedExercises.has(exercise.id)}
                        onCheckedChange={() => handleToggleExerciseComplete(exercise.id)}
                        aria-label={t('markExerciseCompleteLabel', { exerciseName: exercise.name})}
                        disabled={isSavingProgress} className="h-5 w-5 mt-1" />
                      <div className="flex-1">
                        <label htmlFor={exercise.id} className="font-medium cursor-pointer block">{exercise.name}</label>
                        <p className="text-xs text-muted-foreground">{exercise.sets} sets &times; {exercise.reps} {exercise.unit}</p>
                        {exercise.notes && <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">{t('exerciseNotesLabel')}: {exercise.notes}</p>}</div></div>
                    <div className="flex items-center gap-2">
                        {exercise.videoUrl && (<Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePlayVideo(exercise.videoUrl!)} aria-label={t('videoLinkLabel', {exerciseName: exercise.name})}>
                                <PlayCircle className="h-4 w-4" /></Button>)}
                        {completedExercises.has(exercise.id) && <CheckSquare className="h-5 w-5 text-green-500" />}</div></li>))}</ul>
              <div className="mt-6 space-y-2">
                <Label htmlFor="user-notes" className="font-medium">{t('myWorkoutNotesLabel')}</Label>
                <Textarea id="user-notes" placeholder={t('myWorkoutNotesPlaceholder')} value={userNotes} onChange={(e) => setUserNotes(e.target.value)} rows={3} disabled={isSavingProgress}/>
              </div>
            </div>
          ) : ( <p className="text-muted-foreground text-center py-8 text-lg" dangerouslySetInnerHTML={{ __html: t.raw('noRoutineAssigned') }} /> )}
        </CardContent>
        {dailyRoutine && dailyRoutine.exercises.length > 0 && (
            <CardFooter className="flex justify-end border-t pt-4">
                <Button onClick={handleSaveRoutineProgress} disabled={isSavingProgress || isLoadingRoutine} size="lg">
                {isSavingProgress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {isSavingProgress ? t('savingProgressButton') : t('saveProgressButton')}</Button></CardFooter>)}
      </Card>

      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> {t('logAdHocTitle')}</CardTitle>
          <CardDescription>{t('logAdHocDescription')}</CardDescription></CardHeader>
        <CardContent><Textarea placeholder={t('adHocPlaceholder')} rows={3} value={adHocNotes}
            onChange={(e) => setAdHocNotes(e.target.value)} disabled={isSavingAdHoc} /></CardContent>
        <CardFooter><Button onClick={handleAddAdHocWorkout} disabled={isSavingAdHoc || !adHocNotes.trim()}>
            {isSavingAdHoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSavingAdHoc ? t('loggingAdHocButton') : t('logAdHocButton')}</Button></CardFooter></Card>
      
      <Card className="shadow-sm">
        <CardHeader><CardTitle>{t('adHocHistoryTitle')}</CardTitle><CardDescription>{t('adHocHistoryDescription')}</CardDescription></CardHeader>
        <CardContent>{isLoadingAdHoc ? ( <div className="space-y-4 p-4">{[...Array(2)].map(i => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}</div>
          ) : adHocHistory.length === 0 ? ( <p className="text-muted-foreground text-center py-4">{t('noAdHocWorkouts')}</p>
          ) : ( <ul className="space-y-4">{adHocHistory.map((workout) => (
                <li key={workout.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200 shadow-sm">
                  <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium flex items-center gap-2"><Dumbbell className="h-4 w-4 text-muted-foreground" />{workout.notes}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />
                        {formatDate(new Date(workout.date), 'PPP p')}</p></div>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteAdHocWorkout(workout.id)}
                      disabled={deletingAdHocId === workout.id} aria-label={t('deleteWorkoutLabel')}
                      className="text-muted-foreground hover:text-destructive h-8 w-8">
                      {deletingAdHocId === workout.id ? ( <Loader2 className="h-4 w-4 animate-spin" />) : (<Trash2 className="h-4 w-4" />)}</Button></li>))}</ul>)}</CardContent>
        {adHocHistory.length > 0 && !isLoadingAdHoc && ( <CardFooter className="text-sm text-muted-foreground border-t pt-3 mt-3">{t('latestAdHocFooter')}</CardFooter> )}</Card>
    </div>
  );
}
