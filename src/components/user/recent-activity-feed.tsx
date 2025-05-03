'use client'; // Make this a client component

import { Dumbbell, Apple } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: number;
  type: 'workout' | 'meal';
  description: string;
  date: Date;
}

interface RecentActivityFeedProps {
  activities: Activity[]; // Accept activities as a prop
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {

  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground">No recent activity recorded yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {activities.slice(0, 5).map((activity) => ( // Limit to latest 5 activities
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
              {/* Ensure date is a Date object before formatting */}
              {activity.date instanceof Date
                ? formatDistanceToNow(activity.date, { addSuffix: true })
                : 'Invalid date'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
```