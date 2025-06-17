
'use client';

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTranslations } from "next-intl";

// Sample data - replace with actual fetched data
const chartData = [
  { week: "Week 1", weight: 76.0 }, // These week labels could be dynamic/translated if needed
  { week: "Week 2", weight: 75.5 },
  { week: "Week 3", weight: 75.2 },
  { week: "Week 4", weight: 74.8 },
  { week: "Week 5", weight: 74.5 },
  { week: "Week 6", weight: 74.0 },
];

export default function ProgressOverviewChart() {
  const t = useTranslations('ProgressOverviewChart');

  const chartConfig = {
    weight: {
      label: t('weightLabel'),
      color: "hsl(var(--primary))", 
    },
  } satisfies ChartConfig;
  
  return (
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 6)} 
          />
           <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={['dataMin - 1', 'dataMax + 1']} 
            tickFormatter={(value) => `${value} kg`}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <Line
            dataKey="weight"
            type="monotone"
            stroke="var(--color-weight)"
            strokeWidth={2}
            dot={true}
             activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
  );
}

    