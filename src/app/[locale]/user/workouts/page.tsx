// src/app/[locale]/user/workouts/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, CheckSquare, RefreshCw, PlayCircle, Loader2 } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format as formatDate, parseISO } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useRouter } from '@/navigation'; 
import { useTranslations } from 'next-intl';
import { DailyLog, Exercise, DailyUserRoutine, WorkoutLogEntry, AdHocWorkout } from '@/lib/api';
import { es } from 'date-fns/locale';

interface CompletedExercise {
  name: string;
  sets: string;
  reps: string;
  unit: string;
  notes?: string;
}

export async function fetchTodayAssignedRoutines(token: string): Promise<DailyUserRoutine[]> {
  const today = new Date();
  const todayStr = formatDate(today, 'yyyy-MM-dd');

  const logsRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${todayStr}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const plansRes = await fetch('https://vibrafit.onrender.com/api/plans/', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!logsRes.ok || !plansRes.ok) {
    throw new Error("Failed to fetch today's logs or plans");
  }

  const logs = await logsRes.json();
  const plans = await plansRes.json();

  const result: DailyUserRoutine[] = [];

  for (const plan of plans) {
    const startDate = new Date(plan.startDate);
    const isTodayPlan =
      (plan.frequency === 'daily' && startDate <= today) ||
      (plan.frequency === 'weekly' && startDate.getDay() === today.getDay() && startDate <= today) ||
      (plan.startDate === todayStr);

    if (!isTodayPlan) continue;

    const todayLog = logs.find((log: any) => log.plan === plan.planId && log.date === todayStr);

    result.push({
      planId: plan.planId,
      date: today,
      routineName: plan.routineName,
      exercises: plan.exercises.map((ex: any, index: number) => ({
        id: `ex-${plan.planId}-${index}`,
        exercise_id: index,
        name: ex.name,
        sets: parseInt(ex.sets, 10) || 0,
        reps: parseInt(ex.reps, 10) || 0,
        unit: ex.unit || 'reps',
        notes: ex.notes || '',
        videoUrl: ex.video_url || '',
      })),
      trainerNotes: todayLog?.notes || '',
    });
  }

  return result;
}

export async function fetchTodayWorkoutLog(token: string, planId: number | undefined): Promise<Set<string>> {
  if (!planId) return new Set();
  const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
  try {
    const logsRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${todayStr}&plan_id=${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!logsRes.ok) {
      if (logsRes.status === 404) return new Set();
      throw new Error('Failed to fetch today\'s workout log');
    }
    const logs = await logsRes.json();
    const todayLog = logs.find((log: any) => log.plan === planId);

    if (todayLog && todayLog.actual_exercise) {
      if (Array.isArray(todayLog.actual_exercise)) {
        // Already parsed JSON list
        return new Set(todayLog.actual_exercise.map((ex: any) => ex.name));
      } else if (typeof todayLog.actual_exercise === 'string') {
        try {
          const parsed = JSON.parse(todayLog.actual_exercise);
          return new Set(parsed.map((ex: any) => ex.name));
        } catch (e) {
          console.error("Error parsing actual_exercise JSON:", e);
          return new Set();
        }
      }
    }
    return new Set();
  } catch (err) {
    console.error("Error fetching today's workout log:", err);
    return new Set();
  }
}

export async function saveWorkoutProgress(
    token: string,
    planId: number,
    completedExerciseNames: string[],
    allExercises: Exercise[],
    notes: string
  ): Promise<{ success: boolean; data?: any }> {
    const todayStr = formatDate(new Date(), 'yyyy-MM-dd');

    let existingLogId: number | null = null;
    try {
      const logsRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${todayStr}&plan_id=${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (logsRes.ok) {
        const logs = await logsRes.json();
        const todayLog = logs.find((log: any) => log.plan === planId);
        if (todayLog) existingLogId = todayLog.id;
      }
    } catch (e) {
      console.warn("Could not check for existing daily log:", e);
    }

    const completedExercises = allExercises.filter(ex =>
      completedExerciseNames.includes(ex.name)
    ).map(ex => ({
      name: ex.name,
      sets: String(ex.sets),
      reps: String(ex.reps),
      unit: ex.unit,
      notes: ex.notes || '',
    }));

    const method = existingLogId ? 'PATCH' : 'POST';
    const url = existingLogId
      ? `https://vibrafit.onrender.com/api/daily-logs/${existingLogId}/`
      : 'https://vibrafit.onrender.com/api/daily-logs/';

    const payload = {
      plan: planId,
      date: todayStr,
      actual_exercise: completedExercises,
      completion_percentage: Math.round((completedExercises.length / allExercises.length) * 100),
      notes: notes,
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to save workout progress:", errorData);
      throw new Error(errorData.detail || `Failed to save progress (${response.status})`);
    }

    return { success: true, data: await response.json() };
  }

export async function addAdHocWorkout(token: string, description: string, date: string) {
  const response = await fetch('https://vibrafit.onrender.com/api/ad-hoc-workouts/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ description, date }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Failed to add ad-hoc workout:", errorData);
    throw new Error(errorData.detail || `Failed to add ad-hoc workout (${response.status})`);
  }

  return { success: true, data: await response.json() };
}

export async function fetchAdHocWorkouts(token: string): Promise<AdHocWorkout[]> {
  const res = await fetch('https://vibrafit.onrender.com/api/ad-hoc-workouts/', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];

  return await res.json();
}

async function deleteAdHocWorkout(token: string, id: number): Promise<{ success: boolean }> {
     await new Promise(resolve => setTimeout(resolve, 500));
     return { success: true };
}

export default function WorkoutsPage() {
  const t = useTranslations('WorkoutsPage');
  const { toast } = useToast();
  const [adHocNotes, setAdHocNotes] = useState('');
  const [adHocHistory, setAdHocHistory] = useState<AdHocWorkout[]>([]);
  const [isLoadingAdHoc, setIsLoadingAdHoc] = useState(true);
  const [isSavingAdHoc, setIsSavingAdHoc] = useState(false);
  const [deletingAdHocId, setDeletingAdHocId] = useState<number | null>(null);

  const [dailyRoutine, setDailyRoutine] = useState<DailyUserRoutine | null>(null);
  const [completedExercisesMap, setCompletedExercisesMap] = useState<Record<number, Set<string>>>({});
  const [userNotesMap, setUserNotesMap] = useState<Record<number, string>>({});
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [multipleRoutines, setMultipleRoutines] = useState<DailyUserRoutine[]>([]);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

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
        const routines = await fetchTodayAssignedRoutines(token);
        setMultipleRoutines(routines);

        if (routines.length > 0) {
          const defaultRoutine = routines[0];
          setDailyRoutine(defaultRoutine);

          const completed = await fetchTodayWorkoutLog(token, defaultRoutine.planId);
          setCompletedExercisesMap(prev => ({ ...prev, [defaultRoutine.planId]: completed }));

          const todayLogRes = await fetch(`https://vibrafit.onrender.com/api/daily-logs/?date=${formatDate(new Date(), 'yyyy-MM-dd')}&plan_id=${defaultRoutine.planId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (todayLogRes.ok) {
            const logs = await todayLogRes.json();
            const currentLog = logs.find((l: DailyLog) => l.plan === defaultRoutine.planId);
            if (currentLog) {
              setUserNotesMap(prev => ({ ...prev, [defaultRoutine.planId]: currentLog.notes || '' }));
            }
          }
        }
      } catch (err: any) {
        console.error("Error loading routine data:", err);
        toast({
          title: t('toastErrorGeneric'),
          description: err.message || t('toastErrorLoadRoutine'),
          variant: "destructive"
        });
      } finally {
        setIsLoadingRoutine(false);
      }
    };

    const loadAdHocData = async () => {
      try {
        const history = await fetchAdHocWorkouts(token);
        const mappedHistory: AdHocWorkout[] = history.map((ex) => ({
          id: ex.id,
          description: ex.description,
          date: new Date(ex.date),
        }));

        setAdHocHistory(mappedHistory);
      } catch (err: any) {
        console.error("Error loading ad-hoc history:", err);
        toast({
          title: t('toastErrorGeneric'),
          description: err.message || t('toastErrorLoadHistory'),
          variant: "destructive"
        });
      } finally {
        setIsLoadingAdHoc(false);
      }
    };

    loadRoutineData();
    loadAdHocData();
  }, [token, router, toast, t]);


  function handleToggleExerciseComplete(planId: number, name: string) {
    setCompletedExercisesMap(prev => {
      const set = new Set(prev[planId] || []);
      set.has(name) ? set.delete(name) : set.add(name);
      return { ...prev, [planId]: set };
    });
  }

  function handleNoteChange(planId: number, note: string) {
    setUserNotesMap(prev => ({ ...prev, [planId]: note }));
  }

  const routineProgress = useMemo(() => {
    if (!dailyRoutine || dailyRoutine.exercises.length === 0) return 0;
    const completed = completedExercisesMap[dailyRoutine.planId] || new Set();
    return (completed.size / dailyRoutine.exercises.length) * 100;
  }, [dailyRoutine, completedExercisesMap]);

  const handleSaveRoutineProgress = async (planId: number) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" });
      return;
    }

    const routine = multipleRoutines.find(r => r.planId === planId);
    if (!routine) {
      toast({ title: t('toastErrorGeneric'), description: t('toastErrorNoRoutineToSave'), variant: "destructive" });
      return;
    }

    const completed = completedExercisesMap[planId] || new Set();
    const notes = userNotesMap[planId] || '';

    setIsSavingProgress(true);
    try {
      const result = await saveWorkoutProgress(
        token,
        planId,
        Array.from(completed),
        routine.exercises,
        notes
      );
      if (result.success) {
        toast({ title: t('toastProgressSaved'), description: t('toastProgressSavedDesc') });
      } else {
        toast({ title: t('toastSaveFailed'), description: (result as any).error?.detail || t('toastSaveFailedDesc'), variant: "destructive" });
      }
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
    if (!adHocNotes.trim()) {
      toast({
        title: t('toastEmptyLogTitle'),
        description: t('toastEmptyLogDesc'),
        variant: "destructive"
      });
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      toast({
        title: t('toastNotLoggedIn'),
        description: t('toastNotLoggedInDesc'),
        variant: "destructive"
      });
      return;
    }

    setIsSavingAdHoc(true);
    try {
      const todayStr = formatDate(new Date(), 'yyyy-MM-dd');
      const result = await addAdHocWorkout(token, adHocNotes, todayStr);

      if (result.success && result.data) {
        const newAdHoc: AdHocWorkout = {
          id: result.data.id,
          description: result.data.description,
          date: new Date(result.data.date)
        };

        setAdHocHistory(prev => [newAdHoc, ...prev]);
        setAdHocNotes('');
        toast({
          title: t('toastWorkoutLoggedTitle'),
          description: t('toastWorkoutLoggedDesc')
        });
      } else {
        toast({
          title: t('toastLogFailedTitle'),
          description: t('toastLogFailedDesc'),
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: t('toastErrorGeneric'),
        description: error.message || t('toastErrorGenericDesc'),
        variant: "destructive"
      });
    } finally {
      setIsSavingAdHoc(false);
    }
  };

  const handleDeleteAdHocWorkout = async (id: number) => {
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
      
      {isLoadingRoutine ? (
        <div className="space-y-3 p-4">{[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
        ))}</div>
      ) : multipleRoutines.length > 0 ? (
        multipleRoutines.map((routine) => {
          const completed = completedExercisesMap[routine.planId] || new Set();
          const progress = Math.round((completed.size / routine.exercises.length) * 100);
          const userNotes = userNotesMap[routine.planId] || '';

          return (
            <Card key={routine.planId} className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Dumbbell className="h-6 w-6" />
                  {t('todaysRoutineTitle', {
                    routineName: routine.routineName ?? '',
                    date: formatDate(routine.date, 'PPP', { locale: es }),
                  })}
                </CardTitle>
                {routine.trainerNotes && (
                  <CardDescription className="pt-1 text-sm italic text-blue-600 dark:text-blue-400">
                    {t('trainerNotesLabel')}: {routine.trainerNotes}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm mb-1 font-medium">
                      <span>{t('progressLabel', { completed: completed.size, total: routine.exercises.length })}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full h-3 [&>div]:bg-green-500" />
                  </div>

                  <ul className="space-y-3">
                    {routine.exercises.map((exercise) => (
                      <li key={exercise.id} className="flex items-center justify-between p-3.5 bg-card border rounded-lg hover:bg-secondary/30 transition-colors shadow-sm">
                        <div className="flex items-start gap-3 flex-1">
                          <Checkbox
                            id={`${routine.planId}-${exercise.id}`}
                            checked={completed.has(exercise.name)}
                            onCheckedChange={() => handleToggleExerciseComplete(routine.planId, exercise.name)}
                            aria-label={t('markExerciseCompleteLabel', { exerciseName: exercise.name })}
                            disabled={isSavingProgress}
                            className="h-5 w-5 mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor={`${routine.planId}-${exercise.id}`} className="font-medium cursor-pointer block">
                              {exercise.name}
                            </label>
                            <p className="text-xs text-muted-foreground">{exercise.sets} sets × {exercise.reps} {exercise.unit}</p>
                            {exercise.notes && (
                              <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                                {t('exerciseNotesLabel')}: {exercise.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exercise.videoUrl && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handlePlayVideo(exercise.videoUrl!)}
                              aria-label={t('videoLinkLabel', { exerciseName: exercise.name })}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {completed.has(exercise.name) && <CheckSquare className="h-5 w-5 text-green-500" />}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 space-y-2">
                    <Label htmlFor={`user-notes-${routine.planId}`} className="font-medium">
                      {t('myWorkoutNotesLabel')}
                    </Label>
                    <Textarea
                      id={`user-notes-${routine.planId}`}
                      placeholder={t('myWorkoutNotesPlaceholder')}
                      value={userNotes}
                      onChange={(e) => handleNoteChange(routine.planId, e.target.value)}
                      rows={3}
                      disabled={isSavingProgress}
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t pt-4">
                <Button
                  onClick={() => handleSaveRoutineProgress(routine.planId)}
                  disabled={isSavingProgress || isLoadingRoutine}
                  size="lg"
                >
                  {isSavingProgress ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isSavingProgress ? t('savingProgressButton') : t('saveProgressButton')}
                </Button>
              </CardFooter>
            </Card>
          );
        })
      ) : (
        <p className="text-muted-foreground text-center py-8 text-lg" dangerouslySetInnerHTML={{ __html: t.raw('noRoutineAssigned') }} />
      )}


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
        <CardContent>{isLoadingAdHoc ? ( <div className="space-y-4 p-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
          ))}
          </div>
          ) : adHocHistory.length === 0 ? ( <p className="text-muted-foreground text-center py-4">{t('noAdHocWorkouts')}</p>
          ) : ( <ul className="space-y-4">{adHocHistory.map((workout) => (
                <li key={workout.id} className="border p-4 rounded-lg flex justify-between items-start gap-4 bg-card hover:bg-secondary/50 transition-colors duration-200 shadow-sm">
                  <div className="flex-1 space-y-1">
                     <p className="text-sm font-medium flex items-center gap-2"><Dumbbell className="h-4 w-4 text-muted-foreground" />{workout.description}</p>
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" />
                        {formatDate(new Date(workout.date), 'MMMM d, yyyy')}</p></div>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteAdHocWorkout(workout.id)}
                      disabled={deletingAdHocId === workout.id} aria-label={t('deleteWorkoutLabel')}
                      className="text-muted-foreground hover:text-destructive h-8 w-8">
                      {deletingAdHocId === workout.id ? ( <Loader2 className="h-4 w-4 animate-spin" />) : (<Trash2 className="h-4 w-4" />)}</Button></li>))}</ul>)}</CardContent>
        {adHocHistory.length > 0 && !isLoadingAdHoc && ( <CardFooter className="text-sm text-muted-foreground border-t pt-3 mt-3">{t('latestAdHocFooter')}</CardFooter> )}</Card>
    </div>
  );
}
