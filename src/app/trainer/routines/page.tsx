
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, PlusCircle, CalendarDays, Trash2, Save, ClipboardEdit, Dumbbell } from "lucide-react"; // Added Dumbbell
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type RoutinePlan = {
  id: number;
  user: number;
  trainer: number;
  startDate: string;
  frequency: string;
  nutrition_plan: string;
  exercise_plan: {
    name: string;
    sets: string;
    reps: string;
    unit: string;
    notes?: string;
  }[];
};

interface ExerciseInput {
  id: string;
  name: string;
  sets: string;
  reps: string;
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
}

interface RoutineAssignment {
    clientId: string;
    routineName: string;
    startDate: string; // YYYY-MM-DD
    frequency: 'daily' | 'weekly' | 'custom'; 
    exercises: ExerciseInput[];    
}

export default function TrainerRoutinesPage() {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('');
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
    setSelectedClient(routine.client);
    setRoutineName(routine.name);
    setStartDate(routine.startDate);
    setFrequency(routine.frequency);
    setExercises(routine.exercises.map((ex, index) => ({
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
                  <h3 className="font-semibold text-lg">{routine.nutrition_plan || "Routine Plan"}</h3>
                  <p className="text-sm text-muted-foreground">Start Date: {routine.startDate}</p>
                  <p className="text-sm">Frequency: {routine.frequency}</p>

                  <ul className="list-disc pl-5 mt-2">
                    {routine.exercises?.map((ex, i) => (
                      <li key={i}>
                        {ex.name} — {ex.sets} sets × {ex.reps} {ex.unit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => handleEditRoutine(routine)}>Edit</Button>
                    <Button variant="destructive" onClick={() => handleDeleteRoutine(routine.id)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

      </Card>

       {/* Placeholder for Nutrition Plan Setting */}
      <Card className="shadow-sm opacity-50">
        <CardHeader>
            <CardTitle>Nutrition Plans (Coming Soon)</CardTitle>
            <CardDescription>Assign optional nutrition guidance to your clients.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">
                Nutrition plan creation tools will be available here in a future update.
            </p>
        </CardContent>
      </Card>

    </div>
  );
}

    