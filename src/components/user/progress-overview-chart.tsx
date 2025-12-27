'use client';

import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslations } from "next-intl";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getAuthHeaders, apiUrl } from "@/lib/api";

// Type for metric fetched from backend
type WeightMetric = {
  value: number;
  recorded_at: string;
};

export default function ProgressOverviewChart() {
  const t = useTranslations('ProgressOverviewChart');

  const [chartData, setChartData] = useState<{ week: string; weight: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const chartConfig = {
    weight: {
      label: t('weightLabel'),
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  useEffect(() => {

    async function fetchWeightData() {
      try {
        // Use the proper token management instead of direct localStorage access
        const headers = await getAuthHeaders();
        const res = await fetch(apiUrl('/users/metrics/?type=weight'), {
          headers,
        });

        if (!res.ok) {
          // If unauthorized, don't throw error - just show empty chart
          if (res.status === 401) {
            setChartData([]);
            return;
          }
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const data: WeightMetric[] = await res.json();

        const formatted = data.map((item) => ({
          week: new Date(item.recorded_at).toLocaleDateString('en-GB'),
          weight: item.value,
        }));

        setChartData(formatted);
      } catch (err) {
        console.error("Failed to fetch weight data:", err);
        // On error, show empty chart instead of failing
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWeightData();
  }, []);

  if (isLoading) {
    return <div className="h-[250px] bg-muted rounded animate-pulse" />;
  }

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
