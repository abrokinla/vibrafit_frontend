import { Dumbbell, Apple } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  type: 'workout' | 'meal';
  description: string;
  date: Date;
}

interface RecentActivityFeedProps {
  workoutsPromise: Promise<Activity[]>;
  mealsPromise: Promise<Activity[]>;
}

export default async function RecentActivityFeed({ workoutsPromise, mealsPromise }: RecentActivityFeedProps) {
  const [workouts, meals] = await Promise.all([workoutsPromise, mealsPromise]);

  const combinedActivities = [...workouts, ...meals].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (combinedActivities.length === 0) {
    return <p className="text-muted-foreground">No recent activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {combinedActivities.slice(0, 5).map((activity) => ( // Limit to latest 5 activities
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
              {formatDistanceToNow(activity.date, { addSuffix: true })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
