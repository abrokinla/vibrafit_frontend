import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { getDailyMotivation, type DailyMotivationInput } from "@/ai/flows/daily-motivator";

type AiMotivationCardProps = DailyMotivationInput;

export default async function AiMotivationCard({ userId, goal, progress }: AiMotivationCardProps) {
  const motivation = await getDailyMotivation({ userId, goal, progress });

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
         <Sparkles className="h-6 w-6 text-primary" />
         <div >
            <CardTitle className="text-lg text-primary">Your Daily Boost</CardTitle>
            <CardDescription className="text-sm">A little encouragement for your journey.</CardDescription>
         </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">{motivation.message}</p>
      </CardContent>
    </Card>
  );
}
