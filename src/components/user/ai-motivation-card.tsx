import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { getDailyMotivation, type DailyMotivationInput } from "@/ai/flows/daily-motivator";
import Link from "next/link"; // Import Link

type AiMotivationCardProps = DailyMotivationInput;

export default async function AiMotivationCard({ userId, goal, progress }: AiMotivationCardProps) {
  // The getDailyMotivation flow is already designed to return a specific message if the goal is empty.
  // Example: "Welcome! Set your fitness goal to get personalized motivation."
  const motivation = await getDailyMotivation({ userId, goal, progress });

  // Check if the message indicates that a goal needs to be set.
  // This relies on the specific wording from the daily-motivator flow.
  const isPromptToSetGoal = !goal || motivation.message.includes("Set your fitness goal");

  return (
    <Card className={`shadow-sm ${isPromptToSetGoal ? 'bg-secondary/70' : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20'}`}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
         <Sparkles className="h-6 w-6 text-primary" />
         <div>
            <CardTitle className="text-lg text-primary">
              {isPromptToSetGoal ? "Unlock Your Motivation" : "Your Daily Boost"}
            </CardTitle>
            <CardDescription className="text-sm">
              {isPromptToSetGoal ? "Personalized encouragement is just a step away." : "A little encouragement for your journey."}
            </CardDescription>
         </div>
      </CardHeader>
      <CardContent>
        <p className="text-foreground">{motivation.message}</p>
        {isPromptToSetGoal && (
          <Link href="/user/nutrition" className="text-sm text-primary hover:underline mt-3 inline-block font-medium">
            Set Your Goal on the Nutrition Page &rarr;
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
