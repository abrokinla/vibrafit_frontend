
'use client'; 

import { Dumbbell, Apple } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslations } from 'next-intl'; // Import useTranslations
// Optionally, import locale-specific date-fns functions if needed for more complex date formatting
// import { es } from 'date-fns/locale'; // Example for Spanish

interface Activity {
  id: number;
  type: 'workout' | 'meal';
  description: string;
  date: Date;
}

interface RecentActivityFeedProps {
  activities: Activity[];
}

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const t = useTranslations('RecentActivityFeed'); // Initialize translations

  if (!activities || activities.length === 0) {
    return <p className="text-muted-foreground">{t('noActivity')}</p>;
  }

  return (
    <ul className="space-y-4">
      {activities.slice(0, 5).map((activity) => ( 
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
                ? formatDistanceToNow(activity.date, { addSuffix: true /*, locale: es (example) */ })
                : 'Invalid date'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

    