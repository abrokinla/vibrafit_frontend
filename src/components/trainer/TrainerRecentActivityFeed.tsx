'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Apple } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { fetchTrainerClientDailyLogs } from '@/lib/api';

interface Activity {
  id: number;
  type: 'workout' | 'meal';
  description: string;
  date: Date;
  clientName?: string;
}

interface TrainerRecentActivityFeedProps {
  limit?: number;
}

export default function TrainerRecentActivityFeed({ limit = 5 }: TrainerRecentActivityFeedProps) {
  const t = useTranslations('RecentActivityFeed');
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true);
      try {
        const logs = await fetchTrainerClientDailyLogs(limit);

        const transformedActivities: Activity[] = logs
          .filter(log => {
            const hasExercise = Array.isArray(log.actual_exercise) && log.actual_exercise.length > 0;
            const hasNutrition = log.actual_nutrition && log.actual_nutrition.trim() !== '';
            return hasExercise || hasNutrition;
          })
          .map(log => {
            const activitiesFromLog: Activity[] = [];
            if (Array.isArray(log.actual_exercise) && log.actual_exercise.length > 0) {
              activitiesFromLog.push({
                id: log.id,
                type: 'workout',
                description: `${log.user.name} completed: ${log.actual_exercise.map(e => e.name).join(', ')}`,
                date: new Date(log.date),
                clientName: log.user.name,
              });
            }
            if (log.actual_nutrition && log.actual_nutrition.trim() !== '') {
              activitiesFromLog.push({
                id: log.id + 10000,
                type: 'meal',
                description: `${log.user.name} logged meal: ${log.actual_nutrition}`,
                date: new Date(log.date),
                clientName: log.user.name,
              });
            }
            return activitiesFromLog;
          })
          .flat()
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, limit);

        setActivities(transformedActivities);
      } catch (error: any) {
        toast({
          title: t('errorLoadActivity'),
          description: error.message || t('errorLoadActivityDescription'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [t, toast, limit]);

  if (isLoading) {
    return <p className="text-muted-foreground">{t('loadingActivity')}</p>;
  }

  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground">{t('noActivity')}</p>;
  }

  return (
    <ul className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-3">
          <div className="mt-1">
            {activity.type === 'workout' ? (
              <Dumbbell className="h-5 w-5 text-primary" />
            ) : (
              <Apple className="h-5 w-5 text-accent" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-xs text-muted-foreground">
              {activity.date instanceof Date
                ? formatDistanceToNow(activity.date, { addSuffix: true })
                : t('invalidDate')}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}