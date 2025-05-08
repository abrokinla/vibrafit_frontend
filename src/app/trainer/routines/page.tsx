'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, PlusCircle, CalendarPlus, Trash2, Save, ClipboardEdit } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with actual data fetching
const mockClients = [
  { id: 'client1', name: 'Alice Wonderland' },
  { id: 'client2', name: 'Bob The Builder' },
  { id: 'client3', name: 'Charlie Brown' },
];

interface ExerciseInput {
  id: string; // temp client-side id
  name: string;
  sets: string; // string to allow empty input initially
  reps: string; // string to allow empty input initially
  unit: 'reps' | 'seconds' | 'minutes';
  notes?: string;
}

interface RoutineAssignment {
    clientId: string;
    routineName: string;
    startDate: string; // YYYY-MM-DD
    frequency: 'daily' | 'weekly' | 'custom'; // 'custom' could mean specific days
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

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps' }]);
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
            description: "Please select a client, name the routine, set a start date, and fill all exercise details (name, sets, reps).",
            variant: "destructive",
        });
        return;
    }

    setIsSaving(true);
    const routineData: RoutineAssignment = {
        clientId: selectedClient,
        routineName,
        startDate,
        frequency,
        exercises: exercises.map(ex => ({
            ...ex,
            sets: ex.sets, // Keep as string for now, parse on backend
            reps: ex.reps, // Keep as string for now, parse on backend
        })),
    };

    console.log("Saving routine:", routineData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
        title: "Routine Saved",
        description: `Workout routine "${routineName}" for ${mockClients.find(c=>c.id === selectedClient)?.name} has been saved.`,
    });
    // Reset form (optional)
    // setSelectedClient(''); setRoutineName(''); setStartDate(''); setExercises([{ id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps' }]);
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
            Select a client, define exercises, and set the schedule.
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
                        {mockClients.map(client => (
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
                <Label htmlFor="start-date">Start Date</Label>
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
                        <SelectItem value="weekly">Weekly (Repeats on same day)</SelectItem>
                        <SelectItem value="custom">Custom (Specify days - advanced)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Exercises</h3>
                <Button variant="outline" size="sm" onClick={handleAddExercise} disabled={isSaving}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Exercise
                </Button>
            </div>
            {exercises.map((exercise, index) => (
              <Card key={exercise.id} className="p-4 bg-secondary/30 relative">
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
                      placeholder="e.g., Bench Press"
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
                      placeholder="e.g., 3"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(exercise.id, 'sets', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-reps-${index}`}>{exercise.unit === 'reps' ? 'Reps' : exercise.unit.charAt(0).toUpperCase() + exercise.unit.slice(1)}</Label>
                    <Input
                      id={`ex-reps-${index}`}
                      type="number"
                      placeholder={exercise.unit === 'reps' ? "e.g., 10" : "e.g., 60"}
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(exercise.id, 'reps', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
                </div>
                 <div className="mt-3 space-y-1">
                    <Label htmlFor={`ex-notes-${index}`}>Notes (Optional)</Label>
                    <Textarea
                      id={`ex-notes-${index}`}
                      placeholder="e.g., Maintain proper form, use spotter if heavy."
                      rows={2}
                      value={exercise.notes || ''}
                      onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value)}
                      disabled={isSaving}
                    />
                  </div>
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

      <Card className="shadow-sm">
        <CardHeader>
            <CardTitle>Assigned Routines</CardTitle>
            <CardDescription>View and manage existing routines for your clients.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-center py-8">
                Assigned routines will be listed here. (Functionality to view/edit/delete existing routines will be implemented here).
            </p>
        </CardContent>
      </Card>

    </div>
  );
}
