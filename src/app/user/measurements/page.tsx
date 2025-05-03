'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Ruler, TrendingUp } from "lucide-react";
import ProgressOverviewChart from '@/components/user/progress-overview-chart'; // Reuse the chart
import { useToast } from "@/hooks/use-toast";

// Simulate fetching data (replace with actual API calls)
async function fetchMeasurements() {
  await new Promise(resolve => setTimeout(resolve, 500));
  // In a real app, fetch from your backend/database
  return { weight: 74.0, height: 175, bodyFat: 18.5 };
}

async function saveMeasurements(measurements: { weight?: number; height?: number; bodyFat?: number }) {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log("Saving measurements:", measurements);
  // In a real app, send data to your backend/database
  return { success: true };
}


export default function MeasurementsPage() {
  const { toast } = useToast();
  const [weight, setWeight] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [bodyFat, setBodyFat] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // Track last update time

  useEffect(() => {
    setIsLoading(true);
    fetchMeasurements().then(data => {
      setWeight(data.weight);
      setHeight(data.height);
      setBodyFat(data.bodyFat);
      // Simulate last updated time (replace with actual data)
      setLastUpdated(new Date(Date.now() - 86400000 * 2)); // 2 days ago
      setIsLoading(false);
    });
  }, []);

   const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const currentMeasurements = {
        weight: typeof weight === 'number' ? weight : undefined,
        height: typeof height === 'number' ? height : undefined,
        bodyFat: typeof bodyFat === 'number' ? bodyFat : undefined,
      };
      const result = await saveMeasurements(currentMeasurements);
      if (result.success) {
         setLastUpdated(new Date()); // Update last updated time on successful save
         toast({
            title: "Measurements Updated",
            description: "Your latest measurements have been saved.",
          });
      } else {
         toast({
            title: "Update Failed",
            description: "Could not save your measurements. Please try again.",
            variant: "destructive",
          });
      }
    } catch (error) {
      console.error("Failed to save measurements:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
        setIsSaving(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string | number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     // Allow empty string or valid numbers (including decimals)
     if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setter(value === '' ? '' : value); // Keep as string until save if needed, or parse here
     }
  };

   // Format date nicely or show 'Never'
  const lastUpdatedText = lastUpdated
    ? `Last updated: ${lastUpdated.toLocaleDateString()} ${lastUpdated.toLocaleTimeString()}`
    : 'No updates recorded yet.';


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Your Measurements</h1>
      <p className="text-muted-foreground">Keep track of your body metrics to see your progress.</p>


      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Update Your Metrics</CardTitle>
          <CardDescription>{lastUpdatedText}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           {isLoading ? (
             <div className="space-y-4">
               <div className="h-10 bg-muted rounded animate-pulse"></div>
               <div className="h-10 bg-muted rounded animate-pulse"></div>
               <div className="h-10 bg-muted rounded animate-pulse"></div>
             </div>
           ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4" /> Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 75.5"
                    value={weight}
                    onChange={handleInputChange(setWeight)}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                     <Ruler className="h-4 w-4" /> Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    step="1"
                    placeholder="e.g., 175"
                    value={height}
                    onChange={handleInputChange(setHeight)}
                     disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Body Fat (%)
                  </Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 18.5"
                    value={bodyFat}
                     onChange={handleInputChange(setBodyFat)}
                    disabled={isSaving}
                  />
                </div>
              </div>
               <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
           )}
        </CardContent>
      </Card>

      {/* Progress Chart (Example: Weight) */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weight Progress Chart</CardTitle>
          <CardDescription>Visualizing your weight changes over time.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="h-[250px] bg-muted rounded animate-pulse"></div>
          ) : (
            <ProgressOverviewChart />
          )}
        </CardContent>
         <CardFooter className="text-sm text-muted-foreground">
          Chart data is based on your saved measurements.
        </CardFooter>
      </Card>

    </div>
  );
}
