
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { DailyMotivationInput } from "@/ai/flows/daily-motivator";
import { Link } from '@/navigation';
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type AiMotivationCardProps = DailyMotivationInput;

interface MotivationData {
  message: string;
}

export default function AiMotivationCard({ userId, goal, progress }: AiMotivationCardProps) {
  const t = useTranslations('AiMotivationCard');
  const [motivationData, setMotivationData] = useState<MotivationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMotivation() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/motivation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, goal, progress }),
        });

        if (!res.ok) throw new Error("Failed to fetch motivation");

        const data = await res.json();
        setMotivationData(data);
      } catch (error) {
        console.error("Failed to fetch motivation:", error);
        setMotivationData({ message: "Could not load motivation at this time." });
      }
      setIsLoading(false);
    }

    fetchMotivation();
  }, [userId, goal, progress]);


  if (isLoading || !motivationData) {
    return (
      <Card className="shadow-sm bg-secondary/70">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <div>
            <CardTitle className="text-lg text-primary">{t('dailyBoostTitle')}</CardTitle>
            <CardDescription className="text-sm">{t('encouragementForJourney')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground h-5 bg-muted rounded animate-pulse"></p>
        </CardContent>
      </Card>
    );
  }

  const isPromptToSetGoal = !goal || motivationData.message.includes("Set your fitness goal") || motivationData.message.includes("Establece tu meta de fitness");


  return (
    <Card className={`shadow-sm ${isPromptToSetGoal ? 'bg-secondary/70' : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20'}`}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
         <Sparkles className="h-6 w-6 text-primary" />
         <div>
            <CardTitle className="text-lg text-primary">
              {isPromptToSetGoal ? t('unlockMotivationTitle') : t('dailyBoostTitle')}
            </CardTitle>
            <CardDescription className="text-sm">
              {isPromptToSetGoal ? t('personalizedEncouragement') : t('encouragementForJourney')}
            </CardDescription>
         </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">{motivationData.message}</p>
        {isPromptToSetGoal && (
          <Link href="/user/nutrition" className="text-sm text-primary hover:underline mt-3 inline-block font-medium">
            {t('setGoalLink')}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

    