
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, CalendarDays, PlusCircle, Trash2, Play, Loader2, TrendingUp, Scale, Apple } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { format as formatDate, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useRouter } from '@/navigation'; 
import { useTranslations } from 'next-intl';
import { DailyLog, Exercise, DailyUserRoutine, AdHocWorkout, UserData, getUserData, LoggedMeal, fetchDailyLogs, calculateLongestStreak } from '@/lib/api';
import { es } from 'date-fns/locale';
import WorkoutSessionModal from '@/components/user/workout-session-modal';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}
interface CompletedExercise {
  name: string;
  sets: string;
  reps: string;
  unit: string;
  notes?: string;
}

interface UserStats {
  longestStreak: number;
}

export async function fetchTodayAssignedRoutines(token: string): Promise<DailyUserRoutine[]> {
  const today = new Date();
  const todayStr = formatDate(today, 'yyyy-MM-dd')

  const logsRes = await fetch(apiUrl(`/users/daily-logs/?date=${todayStr}`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const plansRes = await fetch(apiUrl('/users/plans/'), {
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
    const logsRes = await fetch(apiUrl(`/users/daily-logs/?date=${todayStr}&plan_id=${planId}`), {
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

export async function fetchMealsFromApi(token: string): Promise<LoggedMeal[]> {
  const res = await fetch(apiUrl('/users/logged-meals/'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error(await res.text());
    throw new Error("Failed to fetch meals");
  }

  return res.json();
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
      const logsRes = await fetch(apiUrl(`/users/daily-logs/?date=${todayStr}&plan_id=${planId}`), {
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
      ? apiUrl(`/daily-logs/${existingLogId}/`)
      : apiUrl('/daily-logs/');

    const payload = {
      plan: planId,
      date: todayStr,
      actual_exercise: completedExercises,
      completion_percentage: allExercises.length > 0 ? Math.round((completedExercises.length / allExercises.length) * 100) : 0,
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
  const response = await fetch(apiUrl('/users/ad-hoc-workouts/'), {
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
  const res = await fetch(apiUrl(`/users/ad-hoc-workouts/`), {
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

  const [completedExercisesMap, setCompletedExercisesMap] = useState<Record<number, Set<string>>>({});
  const [userNotesMap, setUserNotesMap] = useState<Record<number, string>>({});
  const [isLoadingRoutine, setIsLoadingRoutine] = useState(true);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [multipleRoutines, setMultipleRoutines] = useState<DailyUserRoutine[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [mealHistory, setMealHistory] = useState<LoggedMeal[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ longestStreak: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<DailyUserRoutine | null>(null);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  useEffect(() => {
    if (!token) {
      router.push('/signin');
      return;
    }

    setIsLoadingRoutine(true);
    setIsLoadingAdHoc(true);
    setIsLoadingStats(true);

    const loadUserData = async () => {
      try {
        const data = await getUserData();
        setUser(data);
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({
          title: t('toastErrorGeneric'),
          description: err.message || t('toastErrorLoadProfile'),
          variant: 'destructive',
        });
      }
    };

    const loadStatsData = async () => {
      try {
        const [meals, logs, streak] = await Promise.all([
          fetchMealsFromApi(token),
          fetchDailyLogs(token),
          calculateLongestStreak(token),
        ]);
        setMealHistory(meals);
        setDailyLogs(logs);
        setUserStats({ longestStreak: streak });
      } catch (err: any) {
        toast({ title: t('toastErrorGeneric'), description: err.message || t('toastErrorLoadStats'), variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    };

    const loadRoutineData = async () => {
      try {
        const routines = await fetchTodayAssignedRoutines(token);
        setMultipleRoutines(routines);

        const logPromises = routines.map(r => fetchTodayWorkoutLog(token, r.planId));
        const completedSets = await Promise.all(logPromises);
        const newCompletedMap: Record<number, Set<string>> = {};
        routines.forEach((routine, index) => {
          newCompletedMap[routine.planId] = completedSets[index];
        });
        setCompletedExercisesMap(newCompletedMap);

        const notesPromises = routines.map(async (r) => {
          const logRes = await fetch(apiUrl(`/daily-logs/?date=${formatDate(new Date(), 'yyyy-MM-dd')}&plan_id=${r.planId}`), {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (logRes.ok) {
            const logs: DailyLog[] = await logRes.json();
            const currentLog = logs.find((l: DailyLog) => l.plan === r.planId);
            return { planId: r.planId, notes: currentLog?.notes || '' };
          }
          return { planId: r.planId, notes: '' };
        });
        const allNotes = await Promise.all(notesPromises);
        const newNotesMap: Record<number, string> = {};
        allNotes.forEach(item => newNotesMap[item.planId] = item.notes);
        setUserNotesMap(newNotesMap);

      } catch (err: any) {
        toast({ title: t('toastErrorGeneric'), description: err.message || t('toastErrorLoadRoutine'), variant: "destructive" });
      } finally {
        setIsLoadingRoutine(false);
      }
    };

    const loadAdHocData = async () => {
      try {
        const history = await fetchAdHocWorkouts(token);
        setAdHocHistory(history.map(h => ({ ...h, date: new Date(h.date) })));
      } catch (err: any) {
        toast({ title: t('toastErrorGeneric'), description: err.message || t('toastErrorLoadHistory'), variant: "destructive" });
      } finally {
        setIsLoadingAdHoc(false);
      }
    };

    loadUserData();
    loadStatsData();
    loadRoutineData();
    loadAdHocData();
  }, [token, router, toast, t]);

  const todayCalories = mealHistory
    .filter((meal: LoggedMeal) =>
      formatDate(new Date(meal.date), 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd')
    )
    .reduce((sum, meal) => sum + (meal.calories ?? 0), 0);

  const workoutsThisWeek = dailyLogs
    .filter((log: DailyLog) => {
      const logDate = new Date(log.date);
      return isWithinInterval(logDate, {
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: endOfWeek(new Date(), { weekStartsOn: 1 })
      }) && Array.isArray(log.actual_exercise) && log.actual_exercise.length > 0;
    })
    .length;

  function handleToggleExerciseComplete(planId: number, name: string) {
    setCompletedExercisesMap(prev => {
      const newMap = { ...prev };
      const set = new Set(newMap[planId] || []);
      if (set.has(name)) {
        set.delete(name);
      } else {
        set.add(name);
      }
      newMap[planId] = set;
      return newMap;
    });
  }

  const handleSaveRoutineProgress = async (planId: number) => {
    if (!token) {
      toast({ title: t('toastNotLoggedIn'), description: t('toastNotLoggedInDesc'), variant: "destructive" });
      return;
    }

    const routine = multipleRoutines.find(r => r.planId === planId);
    if (!routine) return;

    const completed = completedExercisesMap[planId] || new Set();
    const notes = userNotesMap[planId] || '';

    setIsSavingProgress(true);
    try {
      await saveWorkoutProgress(token, planId, Array.from(completed), routine.exercises, notes);
      toast({ title: t('toastProgressSaved'), description: t('toastProgressSavedDesc') });
      setIsModalOpen(false);
    } catch (error: any) {
      toast({ title: t('toastErrorGeneric'), description: error.message || t('toastErrorGenericDesc'), variant: "destructive" });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleStartWorkout = (routine: DailyUserRoutine) => {
    setSelectedRoutine(routine);
    setIsModalOpen(true);
  };
  
  const handleAddAdHocWorkout = async () => {
    if (!adHocNotes.trim() || !token) return;
    setIsSavingAdHoc(true);
    try {
      const result = await addAdHocWorkout(token, adHocNotes, formatDate(new Date(), 'yyyy-MM-dd'));
      setAdHocHistory(prev => [{ ...result.data, date: new Date(result.data.date) }, ...prev]);
      setAdHocNotes('');
      toast({ title: t('toastWorkoutLoggedTitle'), description: t('toastWorkoutLoggedDesc') });
    } catch (error: any) {
      toast({ title: t('toastLogFailedTitle'), description: error.message || t('toastLogFailedDesc'), variant: "destructive" });
    } finally {
      setIsSavingAdHoc(false);
    }
  };

  const handleDeleteAdHocWorkout = async (id: number) => {
    if (!token) return;
    setDeletingAdHocId(id);
    try {
      await deleteAdHocWorkout(token, id);
      setAdHocHistory(prev => prev.filter(w => w.id !== id));
      toast({ title: t('toastWorkoutDeletedTitle'), description: t('toastWorkoutDeletedDesc') });
    } catch (error: any) {
      toast({ title: t('toastDeletionFailedTitle'), description: error.message || t('toastDeletionFailedDesc'), variant: "destructive" });
    } finally {
      setDeletingAdHocId(null);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('longestStreak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{userStats.longestStreak} <span className="text-sm font-normal text-muted-foreground">{t('days')}</span></p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Dumbbell className="h-5 w-5 text-primary" />
              {t('workoutsThisWeek')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{workoutsThisWeek || '--'}</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-primary" />
              {t('currentWeight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">
                {user?.metrics?.weight ? `${user.metrics.weight} kg` : '-- kg'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Apple className="h-5 w-5 text-primary" />
              {t('todayCalories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold">{todayCalories || '----'} <span className="text-sm font-normal text-muted-foreground">{t('kcal')}</span></p>
            )}
          </CardContent>
        </Card>
      </div>

      {isLoadingRoutine ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 w-3/4 bg-muted rounded"></div></CardHeader>
              <CardContent><div className="h-4 w-1/2 bg-muted rounded"></div></CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <div className="h-10 w-full bg-muted rounded"></div>
                <div className="h-2 w-full bg-muted rounded-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : multipleRoutines.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {multipleRoutines.map((routine) => {
            const completed = completedExercisesMap[routine.planId] || new Set();
            const progress = routine.exercises.length > 0 ? Math.round((completed.size / routine.exercises.length) * 100) : 0;
            const progressColor = progress < 50 ? 'bg-red-500' : progress < 80 ? 'bg-yellow-400' : 'bg-green-500';

            return (
              <Card key={routine.planId} className="shadow-md flex flex-col justify-between">
                <div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-6 w-6 text-primary" />
                      {routine.routineName}
                    </CardTitle>
                    <CardDescription>{t('routineProgress')}: {progress}%</CardDescription>
                  </CardHeader>
                   <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {t('todaysRoutineDate', { date: formatDate(routine.date, 'PPP', { locale: es })})}
                    </p>
                  </CardContent>
                </div>
                <div>
                  <CardFooter className="flex-col items-start gap-4 pt-0">
                    <Button className="w-full" onClick={() => handleStartWorkout(routine)}>
                       <Play className="mr-2 h-4 w-4" /> {t('startWorkoutButton')}
                    </Button>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                       <div className={cn("h-full rounded-full transition-all", progressColor)} style={{ width: `${progress}%` }} />
                    </div>
                  </CardFooter>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8 text-lg" dangerouslySetInnerHTML={{ __html: t.raw('noRoutineAssigned') }} />
      )}

      {selectedRoutine && (
         <WorkoutSessionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            routine={selectedRoutine}
            completedExercises={completedExercisesMap[selectedRoutine.planId] || new Set()}
            onToggleComplete={handleToggleExerciseComplete}
            onSaveProgress={handleSaveRoutineProgress}
            isSaving={isSavingProgress}
         />
      )}
      
      <Card className="shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> {t('logAdHocTitle')}</CardTitle>
          <CardDescription>{t('logAdHocDescription')}</CardDescription></CardHeader>
        <CardContent><Textarea placeholder={t('adHocPlaceholder')} rows={3} value={adHocNotes}
            onChange={(e) => setAdHocNotes(e.target.value)} disabled={isSavingAdHoc} /></CardContent>
        <CardFooter><Button onClick={handleAddAdHocWorkout} disabled={isSavingAdHoc || !adHocNotes.trim()}>
            {isSavingAdHoc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSavingAdHoc ? t('loggingAdHocButton') : t('logAdHocButton')}</Button></CardFooter>
      </Card>
      
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