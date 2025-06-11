
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, PlusCircle, CalendarDays, Trash2, Save, ClipboardEdit, Dumbbell, Salad } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
// import { v4 as uuidv4 } from 'uuid';
import {
  RoutinePlan,
  ExerciseInput,
  RoutineAssignment,
  Meal,
  NutritionPlan,
} from "@/lib/api";


export default function TrainerRoutinesPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<snumber | null>(null);
  const [routineName, setRoutineName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [routines, setRoutines] = useState<RoutinePlan[]>([]);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [nutritionItems, setNutritionItems] = useState<Meal[]>([
  {
    id: undefined, 
    nutrition_plan: undefined,
    meal_type: "breakfast",
    time: "",
    description: "",
  },
]);

  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch('https://vibrafit.onrender.com/api/trainer-profile/clients/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch clients");

        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Could not load subscribed clients.",
          variant: "destructive",
        });
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const fetchRoutines = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const res = await fetch('https://vibrafit.onrender.com/api/plans/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch routines');

        const data = await res.json();
        setRoutines(data);
      } catch (error) {
        console.error("Error fetching routines:", error);
      }
    };

    fetchRoutines();
  }, []);

  const handleDeleteRoutine = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`https://vibrafit.onrender.com/api/plans/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRoutines(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting routine:", error);
    }
  };

  const handleEditRoutine = (routine: RoutinePlan) => {
    setSelectedClient(routine.user);
    setRoutineName(routine.name);
    setStartDate(routine.startDate);
    setFrequency(routine.frequency);
    setExercises(routine.exercise_plan.map((ex, index) => ({
      id: index.toString(),
      ...ex
    })));
    setEditingRoutineId(routine.id);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '' }]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof ExerciseInput, value: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSaveRoutine = async () => {
    if (!selectedClient || !routineName || !startDate || exercises.some(ex => !ex.name || !ex.sets || !ex.reps)) {
        toast({
            title: "Missing Information",
            description: "Please select a client, name the routine, set a start date, and fill all exercise details (name, sets, reps/duration).",
            variant: "destructive",
        });
        return;
    }

    setIsSaving(true);
    const routineData = {
        clientId: selectedClient,
        routineName,
        startDate,
        frequency,
        exercises: exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            unit: ex.unit,
            notes: ex.notes || "",
        })),
    };

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch("https://vibrafit.onrender.com/api/plans/create-routine/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(routineData),
        });

        if (!response.ok) {
            throw new Error("Failed to create routine");
        }

        toast({
            title: "Routine Saved",
            description: `Workout routine "${routineName}" for ${clients.find(c => c.id === selectedClient)?.name} has been saved.`,
        });
    } catch (err) {
        toast({
            title: "Error Saving Routine",
            description: err.message,
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
    }
};

  const handleAddMeal = () => {
    setNutritionItems((prev) => [
      ...prev,
      {
        id: undefined,
        nutrition_plan: undefined,
        meal_type: "breakfast",
        time: "",
        description: "",
      },
    ]);
  };

  const handleRemoveMeal = (index: number) => {
    setNutritionItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleChange = (index: number, key: keyof Meal, value: string) => {
    setNutritionItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  const fetchClientPlan = async (clientId: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const res = await fetch('https://vibrafit.onrender.com/api/plans/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch plans");

      const plans = await res.json();
      const clientPlans = plans.filter((p: any) => p.client === clientId);
      return clientPlans.length > 0 ? clientPlans[0] : null;
    } catch (error) {
      console.error("Error fetching client plans:", error);
      return null;
    }
  };

  const handleSavePlan = async () => {
    setIsSaving(true);
    const clientPlan = await fetchClientPlan(selectedClient);
    if (!clientPlan) {
      toast({
        title: "No Routine Found",
        description: "Please create a workout routine for this client before assigning a nutrition plan.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    const payload: NutritionPlan = {
      plan: clientPlan.planId,
      notes: "",
      meals: nutritionItems.map((meal) => ({
        meal_type: meal.meal_type,
        time: meal.time,
        description: meal.description,
      })),
    };

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("https://vibrafit.onrender.com/api/nutrition-plan/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend error:", err);
        toast({
          title: "Error Saving Nutrition Plan",
          description: err?.detail || JSON.stringify(err),
          variant: "destructive",
        });
      } else {
        const savedPlan: NutritionPlan = await res.json();
        toast({
          title: "Nutrition Plan Saved",
          description: "Your meals have been successfully assigned.",
        });
        setNutritionItems(
          savedPlan.meals.map((m) => ({
            id: m.id,
            nutrition_plan: savedPlan.id,
            meal_type: m.meal_type,
            time: m.time,
            description: m.description,
          }))
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      toast({
        title: "Network Error",
        description: "Could not save nutrition plan. Try again.",
        variant: "destructive",
      });
    }

    setIsSaving(false);
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Manage Client Routines</h1>
      <p className="text-muted-foreground">
        Design and assign detailed workout routines for your clients.
      </p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <ClipboardEdit className="h-6 w-6" /> Create New Routine
          </CardTitle>
          <CardDescription>
            Select a client, define exercises, set the schedule, and optionally add notes or videos (video upload TBD).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client and Routine Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="client-select">Select Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isSaving}>
                    <SelectTrigger id="client-select">
                        <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {client.name}
                            </div>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routine-name">Routine Name</Label>
              <Input
                id="routine-name"
                placeholder="e.g., Phase 1: Strength Building"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="start-date" className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/>Start Date</Label>
                <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isSaving}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="frequency-select">Frequency</Label>
                 <Select value={frequency} onValueChange={(val: 'daily' | 'weekly' | 'custom') => setFrequency(val)} disabled={isSaving}>
                    <SelectTrigger id="frequency-select">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly (Repeats on same day of week)</SelectItem>
                        {/* <SelectItem value="monthly">Monthly</SelectItem> */}
                        <SelectItem value="custom">Custom (Advanced - TBD)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          {/* Exercises Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Dumbbell className="h-5 w-5"/>Exercises</h3>
                <Button variant="outline" size="sm" onClick={handleAddExercise} disabled={isSaving}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
            </div>
            {exercises.map((exercise, index) => (
              <Card key={exercise.id} className="p-4 bg-secondary/30 relative shadow-sm border">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveExercise(exercise.id)}
                    disabled={isSaving || exercises.length === 1}
                    aria-label="Remove exercise"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor={`ex-name-${index}`}>Exercise Name</Label>
                    <Input
                      id={`ex-name-${index}`}
                      placeholder="e.g., Barbell Bench Press"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor={`ex-unit-${index}`}>Unit</Label>
                    <Select
                      value={exercise.unit}
                      onValueChange={(val: 'reps' | 'seconds' | 'minutes') => handleExerciseChange(exercise.id, 'unit', val)}
                      disabled={isSaving}
                    >
                        <SelectTrigger id={`ex-unit-${index}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="reps">Reps</SelectItem>
                            <SelectItem value="seconds">Seconds</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            {/* Future: <SelectItem value="kg">kg (Weight)</SelectItem> */}
                        </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                   <div className="space-y-1">
                    <Label htmlFor={`ex-sets-${index}`}>Sets</Label>
                    <Input
                      id={`ex-sets-${index}`}
                      type="number"
                      min="1"
                      placeholder="e.g., 3"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(exercise.id, 'sets', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-reps-${index}`}>
                        {exercise.unit === 'reps' ? 'Reps' : exercise.unit.charAt(0).toUpperCase() + exercise.unit.slice(1) + ' per set'}
                    </Label>
                    <Input
                      id={`ex-reps-${index}`}
                      type="number"
                      min="1"
                      placeholder={exercise.unit === 'reps' ? "e.g., 10" : "e.g., 30 (seconds)"}
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(exercise.id, 'reps', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                 <div className="mt-3 space-y-1">
                    <Label htmlFor={`ex-notes-${index}`}>Notes / Instructions (Optional)</Label>
                    <Textarea
                      id={`ex-notes-${index}`}
                      placeholder="e.g., Maintain proper form, use spotter if heavy, 60s rest between sets."
                      rows={2}
                      value={exercise.notes || ''}
                      onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  {/* Placeholder for video upload per exercise - TBD */}
                  {/* <div className="mt-3 space-y-1">
                    <Label htmlFor={`ex-video-${index}`}>Exercise Video (Optional)</Label>
                    <Input id={`ex-video-${index}`} type="file" accept="video/*" disabled={isSaving} />
                  </div> */}
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveRoutine} disabled={isSaving} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving Routine...' : 'Save Routine'}
          </Button>
        </CardFooter>
      </Card>

      {/* Display Assigned Routines (Placeholder) */}
      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Assigned Routines</CardTitle>
            <CardDescription>View and manage existing routines for your clients.</CardDescription>
        </CardHeader>
        <CardContent>
          {routines.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Assigned routines.
            </p>
          ) : (
            <div className="space-y-4">
              {routines.map((routine) => (
                <Card key={routine.id} className="border p-4">                  
                  <p className="text-sm text-muted-foreground">Start Date: {routine.startDate}</p>
                  <p className="text-sm">Frequency: {routine.frequency}</p>

                   <ul className="list-disc pl-5 mt-2">
                    {routine.exercise_plan?.map((ex, index) => (
                      <li key={`${ex.name}-${index}`}>
                        {ex.name} — {ex.sets} sets × {ex.reps} {ex.unit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => handleEditRoutine(routine)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteRoutine(routine.planId)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

      </Card>

       {/* Placeholder for Nutrition Plan Setting */}     
      <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <Salad className="h-6 w-6" />
          Create Nutrition Plan
        </CardTitle>
        <CardDescription>
          Select a client and add optional meal guidance per day.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="client-select">Select Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isSaving}>
              <SelectTrigger id="client-select">
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {client.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSaving}
            />
          </div>
        </div>

        {/* --- Nutrition Entries (Meals) --- */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Salad className="h-5 w-5" />
              Meals
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddMeal}
              disabled={isSaving}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </div>

          {nutritionItems.map((item, index) => (
            <Card
              key={index}  // using `index` as key since id is `undefined` until saved
              className="p-4 bg-secondary/30 relative shadow-sm border"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveMeal(index)}
                disabled={isSaving || nutritionItems.length === 1}
                aria-label="Remove meal"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid md:grid-cols-3 gap-4 items-end">
                {/* --- Meal Type Dropdown --- */}
                <div className="space-y-1">
                  <Label htmlFor={`meal-type-${index}`}>Meal</Label>
                  <select
                    id={`meal-type-${index}`}
                    value={item.meal_type} 
                    onChange={(e) =>
                      handleChange(
                        index, 
                        "meal_type", 
                        e.target.value as "breakfast" | "lunch" | "dinner"
                      )
                    }
                    className="w-full border rounded px-2 py-1"
                    disabled={isSaving}
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>

                {/* --- Time Input --- */}
                <div className="space-y-1">
                  <Label htmlFor={`meal-time-${index}`}>Time</Label>
                  <Input
                    id={`meal-time-${index}`}
                    type="time"
                    value={item.time}
                    onChange={(e) =>
                      handleChange(index, "time", e.target.value)
                    }
                    disabled={isSaving}
                    required
                  />
                </div>

                {/* --- Description Textarea --- */}
                <div className="space-y-1 md:col-span-1">
                  <Label htmlFor={`meal-desc-${index}`}>Meal Details</Label>
                  <Textarea
                    id={`meal-desc-${index}`}
                    placeholder="e.g., Oatmeal with fruits and almond milk"
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    disabled={isSaving}
                    required
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>


      </CardContent>

      <CardFooter>
        <Button onClick={handleSavePlan} disabled={isSaving} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving Plan...' : 'Save Nutrition Plan'}
        </Button>
      </CardFooter>
    </Card>

    </div>
  );
}

    