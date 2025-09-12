// src/app/[locale]/trainer/routines/page.tsx
'use client';
export const runtime = 'edge';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, PlusCircle, CalendarDays, Trash2, Save, ClipboardEdit, Dumbbell, Salad, Library, UploadCloud } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { RoutinePlan, ExerciseInput, RoutineAssignment, Meal, NutritionPlan, PresetRoutine, fetchPresetRoutines } from "@/lib/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vibrafit.onrender.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}
import { useTranslations } from 'next-intl';
import { uploadTimelineMedia } from '@/lib/utils';


export default function TrainerRoutinesPage() {
  const t = useTranslations('TrainerRoutinesPage');
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [routineName, setRoutineName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [routines, setRoutines] = useState<RoutinePlan[]>([]);
  const [editingRoutineId, setEditingRoutineId] = useState<number | null>(null);
  const [nutritionItems, setNutritionItems] = useState<Meal[]>([
    { id: undefined, nutrition_plan: undefined, meal_type: "breakfast", time: "", description: "", calories: "" },
  ]);
  const today = new Date().toISOString().split("T")[0];
  const [nutritionStartDate, setnutritionStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [presetLibrary, setPresetLibrary] = useState<PresetRoutine[]>([]);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const videoFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPresets() {
      try {
  const presets = await fetchPresetRoutines();
  setPresetLibrary(presets);
        } catch (error) {
            console.error('❌ Error loading presets:', error);
            toast({ title: t('toastErrorTitle'), description: "Failed to load preset library.", variant: "destructive" });
        }
      }
    loadPresets();
  }, [toast, t]);

  useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
  const res = await fetch(apiUrl('/trainer-profile/clients/'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch clients");
        const data = await res.json();
        setClients(data);
      } catch (err) {
        console.error(err);
        toast({ title: t('toastErrorLoadClients'), variant: "destructive" });
      }
    };
    fetchClients();
  }, [toast, t]);
  
  useEffect(() => {
    const fetchRoutines = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
  const res = await fetch(apiUrl('/plans/'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch routines");
        const rawData = await res.json();
        if (!Array.isArray(rawData)) { 
            console.error("API did not return an array for routines:", rawData); 
            setRoutines([]);
            return; 
        }
        const mappedRoutines: RoutinePlan[] = rawData.map((routine: any) => ({
          planId: routine.planId, routineName: routine.routineName, startDate: routine.startDate,
          frequency: routine.frequency, 
          exercises: Array.isArray(routine.exercises) ? routine.exercises : [],
          client: routine.client,
          trainer: routine.trainer, 
          nutrition: routine.nutrition,
        }));
        setRoutines(mappedRoutines);
      } catch (error) { 
        console.error("Error fetching routines:", error); 
        setRoutines([]);
        toast({ title: t('toastErrorLoadRoutines'), variant: "destructive" });
      }
    };
    fetchRoutines();
  }, [toast, t]);

  const handleDeleteRoutine = async (id: number) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
  await fetch(apiUrl(`/plans/${id}/`), {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      setRoutines(prev => prev.filter(r => r.planId !== id));
      toast({ title: t('toastRoutineDeleted'), description: t('toastRoutineDeletedDesc')});
    } catch (error) { 
        console.error("Error deleting routine:", error); 
        toast({ title: t('toastErrorDeleteRoutine'), variant: "destructive" });
    }
  };

  const handleEditRoutine = (routine: RoutinePlan) => {
    setRoutineName(routine.routineName);
    setSelectedClient(routine.client);
    setStartDate(routine.startDate);
    setFrequency(routine.frequency as 'daily' | 'weekly' | 'custom');
    const allowedUnits = ['reps', 'seconds', 'minutes'] as const;
    setExercises(routine.exercises?.map((ex, index) => ({
      id: (ex as any).id?.toString() || Date.now().toString() + index, // Ensure ID is string
      ...ex,
      unit: allowedUnits.includes(ex.unit as any) ? (ex.unit as 'reps' | 'seconds' | 'minutes') : 'reps',
    })));
    setEditingRoutineId(routine.planId);
  };

  const handleAddExercise = () => {
    setExercises([...exercises, { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '' }]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises?.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof ExerciseInput, value: string) => {
    setExercises(exercises?.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSaveRoutine = async () => {
    if (!selectedClient || !routineName || !startDate || exercises?.some(ex => !ex.name || !ex.sets || !ex.reps)) {
        toast({ title: t('toastMissingInfo'), description: t('toastMissingInfoDesc'), variant: "destructive" });
        return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('accessToken');
    if (!token) {
        toast({ title: t('toastAuthError'), description: t('toastAuthErrorDesc'), variant: "destructive" });
        setIsSaving(false);
        return;
    }

  const routinePayload = {
    clientId: selectedClient,
    routineName, 
    startDate, 
    frequency,
    exercises: exercises?.map(({ id, video_url, ...ex }) => ({
      name: ex.name, 
      sets: ex.sets, 
      reps: ex.reps, 
      unit: ex.unit, 
      notes: ex.notes || "",
      video_url: video_url || ""
    })),
  };

  const url = editingRoutineId 
    ? apiUrl(`/plans/${editingRoutineId}/`) 
    : apiUrl('/plans/create-routine/');
    const method = editingRoutineId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method, 
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(routinePayload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Failed to ${editingRoutineId ? 'update' : 'create'} routine`);
        }
        const savedRoutine = await response.json();
        
        // Refresh routines list
  const updatedRoutinesRes = await fetch(apiUrl('/plans/'), { headers: { Authorization: `Bearer ${token}` } });
        const updatedRoutinesData = await updatedRoutinesRes.json();
        if (Array.isArray(updatedRoutinesData)) {
             setRoutines(updatedRoutinesData.map((routine: any) => ({
                ...routine,
                exercises: Array.isArray(routine.exercises) ? routine.exercises : [],
            })));
        }


        toast({ title: editingRoutineId ? t('toastRoutineUpdated') : t('toastRoutineSaved'), description: t('toastRoutineSavedDesc', { routineName, clientName: clients.find(c => c.id === selectedClient!.toString())?.name || 'Client' }) });
        setEditingRoutineId(null); // Reset editing state
        // Optionally reset form fields
        setSelectedClient(null);
        setRoutineName('');
        setStartDate('');
        setExercises([{ id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '' }]);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        toast({ title: t('toastErrorSavingRoutine'), description: errorMessage, variant: "destructive" });
    } finally { 
        setIsSaving(false); 
    }
  };

  const handleAddMeal = () => {
    setNutritionItems((prev) => [ ...prev, { id: undefined, nutrition_plan: undefined, meal_type: "breakfast", time: "", description: "", calories: "" }]);
  };

  const handleRemoveMeal = (index: number) => {
    setNutritionItems((prev) => { if (prev.length <= 1) return prev; return prev.filter((_, i) => i !== index); });
  };

  function  handleChangeMeal(
    index: number,
    field: keyof Meal,
    value: string | number
  ) {
    setNutritionItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: 
          field === 'calories'
            ? Number(value) 
            : value.toString(),
      };
      return updated;
    });
  }

  const fetchClientPlanIdForNutrition = async (clientId: number): Promise<number | null> => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
  const res = await fetch(apiUrl('/plans/'), { headers: { Authorization: `Bearer ${token}` }});
      if (!res.ok) throw new Error("Failed to fetch plans for nutrition linking");
      const plans: RoutinePlan[] = await res.json();
      const clientRoutinePlan = plans.find(p => p.client === clientId);
      return clientRoutinePlan ? clientRoutinePlan.planId : null;
    } catch (error) { 
      console.error("Error fetching client plan ID for nutrition:", error); 
      return null; 
    }
  };

  const handleVideoUpload = async (exerciseId: string, file: File) => {
  // 10MB size limit
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    toast({
      title: t('toastFileSizeErrorTitle') || 'File Too Large',
      description: t('toastFileSizeErrorDesc') || 'Please select a file smaller than 10MB.',
      variant: 'destructive'
    });
    return;
  }

  setUploadingVideoId(exerciseId);
  try {
    const uploadResult = await uploadTimelineMedia(file);
    if (uploadResult.success && uploadResult.url) {
      handleExerciseChange(exerciseId, 'video_url', uploadResult.url);
      toast({
        title: "Video uploaded successfully",
        description: "The video has been added to the exercise."
      });
    } else {
      throw new Error(uploadResult.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Video upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload video. Please try again.';
    toast({
      title: "Upload failed",
      description: errorMessage,
      variant: "destructive"
    });
  } finally {
    setUploadingVideoId(null);
    // Reset the file input
    if (videoFileRefs.current[exerciseId]) {
      videoFileRefs.current[exerciseId]!.value = '';
    }
  }
  };

  const handleSaveNutritionPlan = async () => {
    if (!selectedClient) {
      toast({ title: t('toastMissingInfo'), description: t('toastSelectClientForNutrition'), variant: "destructive" });
      return;
    }

    if (nutritionItems.some(item => !item.time || !item.description)) {
      toast({ title: t('toastMissingInfo'), description: t('toastFillAllMealDetails'), variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast({ title: t('toastAuthError'), description: t('toastAuthErrorDesc'), variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const planIdForNutrition = await fetchClientPlanIdForNutrition(Number(selectedClient));

    if (!planIdForNutrition) {
      toast({ title: t('toastNoRoutineFound'), description: t('toastNoRoutineFoundDesc'), variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const payload: Omit<NutritionPlan, 'id'> = {
      plan: planIdForNutrition,
      notes: "",
      start_date: nutritionStartDate,
      end_date: endDate,
      meals: nutritionItems.map(({ id, nutrition_plan, ...meal }) => meal),
    };

    try {
  const res = await fetch(apiUrl('/nutrition-plan/'), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.detail || JSON.stringify(err) || "Failed to save nutrition plan");
      }
      const savedPlan: NutritionPlan = await res.json();
      toast({ title: t('toastNutritionSaved'), description: t('toastNutritionSavedDesc') });
      setNutritionItems(savedPlan.meals.map(m => ({ ...m, id: m.id || Date.now() })));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('toastNetworkErrorDesc');
      toast({ title: t('toastErrorSavingNutrition'), description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
    const handleLoadFromPreset = (preset: PresetRoutine) => {
      setRoutineName(preset.name);

      // Check if exercises exist and have data
      if (!preset.exercises || !Array.isArray(preset.exercises)) {
        toast({ 
          title: "No exercises found", 
          description: "This preset doesn't contain any exercises.",
          variant: "destructive"
        });
        setIsPresetModalOpen(false);
        return;
      }
      if (preset.exercises.length === 0) {
        toast({ 
          title: "Empty preset", 
          description: "This preset doesn't contain any exercises.",
          variant: "destructive"
        });
        setIsPresetModalOpen(false);
        return;
      }

      // Map preset exercises to match ExerciseInput structure
      const mappedExercises: ExerciseInput[] = preset.exercises.map((ex, index) => ({
        id: Date.now().toString() + index, // Create unique client-side ID
        name: ex.name || '',
        sets: ex.sets?.toString() || '1',
        reps: ex.reps?.toString() || '1',
        unit: (ex.unit as 'reps' | 'seconds' | 'minutes') || 'reps',
        notes: ex.notes || '',
        video_url: ex.video_url || ''
      }));

      setExercises(mappedExercises);
      setIsPresetModalOpen(false);

      toast({ 
        title: `Preset '${preset.name}' loaded`, 
        description: `Loaded ${mappedExercises.length} exercises. Select a client and start date to assign it.` 
      });
    };

    const renderPresetList = (level: 'beginner' | 'intermediate' | 'advanced') => {
        const filteredPresets = presetLibrary.filter(p => p.level === level);
        if (filteredPresets.length === 0) return <p className="text-sm text-muted-foreground px-4 py-2">{t('noPresets')}</p>;
        
        return filteredPresets.map(preset => (
          <div key={preset.id} className="mb-2 border rounded-lg p-3">
             <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{preset.name}</p>
                  <p className="text-xs text-muted-foreground">{preset.exercises?.length} exercises</p>
                </div>
                <Button size="sm" onClick={() => handleLoadFromPreset(preset)}>Select</Button>
            </div>
          </div>
        ));
    };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-primary"><ClipboardEdit className="h-6 w-6" /> {editingRoutineId ? t('editRoutineTitle') : t('newRoutineTitle')}</CardTitle>
            <Dialog open={isPresetModalOpen} onOpenChange={setIsPresetModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><Library className="mr-2 h-4 w-4"/> {t('loadFromPreset')}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('loadPresetTitle')}</DialogTitle>
                        <DialogDescription>{t('loadPresetDescription')}</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-1">
                        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                          <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-semibold">{t('levelBeginner')}</AccordionTrigger>
                            <AccordionContent>{renderPresetList('beginner')}</AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-semibold">{t('levelIntermediate')}</AccordionTrigger>
                            <AccordionContent>{renderPresetList('intermediate')}</AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="item-3">
                            <AccordionTrigger className="text-lg font-semibold">{t('levelAdvanced')}</AccordionTrigger>
                            <AccordionContent>{renderPresetList('advanced')}</AccordionContent>
                          </AccordionItem>
                        </Accordion>
                    </div>
                </DialogContent>
            </Dialog>
          </div>
          <CardDescription>{t('newRoutineDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="client-select">{t('selectClientLabel')}</Label>
                <Select value={selectedClient !== null ? String(selectedClient) : undefined} onValueChange={(val) => setSelectedClient(Number(val))} disabled={isSaving}>
                  <SelectTrigger id="client-select"><SelectValue placeholder={t('selectClientPlaceholder')} /></SelectTrigger>
                  <SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={String(client.id)}><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{client.name}</div></SelectItem>))}</SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routine-name">{t('routineNameLabel')}</Label>
              <Input id="routine-name" placeholder={t('routineNamePlaceholder')} value={routineName} onChange={(e) => setRoutineName(e.target.value)} disabled={isSaving}/>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label htmlFor="start-date" className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/>{t('startDateLabel')}</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isSaving}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="frequency-select">{t('frequencyLabel')}</Label>
                 <Select value={frequency} onValueChange={(val: 'daily' | 'weekly' | 'custom') => setFrequency(val)} disabled={isSaving}>
                    <SelectTrigger id="frequency-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">{t('frequencyDaily')}</SelectItem>
                        <SelectItem value="weekly">{t('frequencyWeekly')}</SelectItem>
                        <SelectItem value="custom" disabled>{t('frequencyCustom')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Dumbbell className="h-5 w-5"/>{t('exercisesTitle')}</h3>
                <Button variant="outline" size="sm" onClick={handleAddExercise} disabled={isSaving}><PlusCircle className="mr-2 h-4 w-4" /> {t('addExerciseButton')}</Button>
            </div>
            {exercises?.map((exercise, index) => (
              <Card key={exercise.id} className="p-4 bg-secondary/30 relative shadow-sm border">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" 
                  onClick={() => handleRemoveExercise(exercise.id)} 
                  disabled={isSaving || exercises?.length === 1} 
                  aria-label={t('removeExerciseLabel')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1 md:col-span-2">
                    <Label htmlFor={`ex-name-${index}`}>{t('exerciseNameLabel')}</Label>
                    <Input 
                      id={`ex-name-${index}`} 
                      placeholder={t('exerciseNamePlaceholder')} 
                      value={exercise.name} 
                      onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)} 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-unit-${index}`}>{t('unitLabel')}</Label>
                    <Select 
                      value={exercise.unit} 
                      onValueChange={(val: 'reps' | 'seconds' | 'minutes') => handleExerciseChange(exercise.id, 'unit', val)} 
                      disabled={isSaving}
                    >
                      <SelectTrigger id={`ex-unit-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reps">{t('unitReps')}</SelectItem>
                        <SelectItem value="seconds">{t('unitSeconds')}</SelectItem>
                        <SelectItem value="minutes">{t('unitMinutes')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <Label htmlFor={`ex-sets-${index}`}>{t('setsLabel')}</Label>
                    <Input 
                      id={`ex-sets-${index}`} 
                      type="number" 
                      min="1" 
                      placeholder={t('setsPlaceholder')} 
                      value={exercise.sets} 
                      onChange={(e) => handleExerciseChange(exercise.id, 'sets', e.target.value)} 
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-reps-${index}`}>
                      {exercise.unit === 'reps' ? t('repsLabel') : t('durationPerSetLabel', { unit: exercise.unit.charAt(0).toUpperCase() + exercise.unit.slice(1) })}
                    </Label>
                    <Input 
                      id={`ex-reps-${index}`} 
                      type="number" 
                      min="1" 
                      placeholder={exercise.unit === 'reps' ? t('repsPlaceholder') : t('durationPlaceholder')} 
                      value={exercise.reps} 
                      onChange={(e) => handleExerciseChange(exercise.id, 'reps', e.target.value)} 
                      disabled={isSaving}
                    />
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`ex-notes-${index}`}>{t('notesLabel')}</Label>
                  <Textarea 
                    id={`ex-notes-${index}`} 
                    placeholder={t('notesPlaceholder')} 
                    rows={2} 
                    value={exercise.notes || ''} 
                    onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value)} 
                    disabled={isSaving}
                  />
                </div>
                
                {/* Video URL section - NOW INSIDE the mapping loop */}
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`ex-video-${index}`}>{t('videoUrlLabel')}</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id={`ex-video-url-${index}`}
                      placeholder={t('videoUrlPlaceholder')}
                      value={exercise.video_url || ''}
                      onChange={(e) => handleExerciseChange(exercise.id, 'video_url', e.target.value)}
                      disabled={isSaving || uploadingVideoId === exercise.id}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => videoFileRefs.current[exercise.id]?.click()}
                      disabled={isSaving || uploadingVideoId === exercise.id}
                      aria-label="Upload video"
                      title="Upload from computer"
                    >
                      <UploadCloud className="h-4 w-4" />
                    </Button>

                    <input
                      type="file"
                      className="hidden"
                      ref={(el) => {
                        videoFileRefs.current[exercise.id] = el;
                      }}
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleVideoUpload(exercise.id, e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  {uploadingVideoId === exercise.id && (
                    <p className="text-xs text-muted-foreground">{t('uploading') || 'Uploading…'}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter><Button onClick={handleSaveRoutine} disabled={isSaving} className="w-full md:w-auto"><Save className="mr-2 h-4 w-4" />{isSaving ? t('savingRoutineButton') : (editingRoutineId ? t('updateRoutineButton') : t('saveRoutineButton'))}</Button></CardFooter></Card>
      
      <Card className="shadow-sm">
        <CardHeader><CardTitle>{t('assignedRoutinesTitle')}</CardTitle><CardDescription>{t('assignedRoutinesDescription')}</CardDescription></CardHeader>
        <CardContent>
          {routines.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t('noAssignedRoutines')}
            </p>
          ) : (
            <div className="space-y-4">
              {routines.map((routine) => (
                <Card key={routine.planId} className="border p-4">
                  <CardTitle className="text-lg mb-1">
                    {routine.routineName}
                  </CardTitle>

                  {/* Show client name since trainers see multi-client */}
                  <p className="text-sm text-muted-foreground">
                    Client: {
                      clients.find(c => String(c.id) === String(routine.client))?.name || 'N/A'
                    }
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Start Date: {routine.startDate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Frequency: {routine.frequency}
                  </p>

                  <ul className="list-disc pl-5 mt-2 text-sm">
                    {routine.exercises?.map((ex, i) => (
                      <li key={`${ex.name}-${i}`}>
                        {ex.name} — {ex.sets} sets × {ex.reps} {ex.unit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditRoutine(routine)}>
                      {t('editButton')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteRoutine(routine.planId)}>
                      {t('deleteButton')}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>

      </Card>

      <Card className="shadow-lg">
        <CardHeader><CardTitle className="flex items-center gap-2 text-green-600"><Salad className="h-6 w-6" />{t('newNutritionPlanTitle')}</CardTitle><CardDescription>{t('newNutritionPlanDescription')}</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="client-select-nutrition">{t('selectClientLabel')}</Label>
                <Select value={selectedClient !== null ? String(selectedClient) : undefined} onValueChange={(val) => setSelectedClient(Number(val))} disabled={isSaving}>
                  <SelectTrigger id="client-select-nutrition"><SelectValue placeholder={t('selectClientPlaceholder')} /></SelectTrigger>
                  <SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={String(client.id)}><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{client.name}</div></SelectItem>))}</SelectContent>
                </Select>
            </div>
             {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="nutrition-start-date">{t('startDateLabel') || "Start Date"}</Label>
              <Input
                id="nutrition-start-date"
                type="date"
                value={nutritionStartDate}
                onChange={(e) => setnutritionStartDate(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="nutrition-end-date">{t('endDateLabel') || "End Date"}</Label>
              <Input
                id="nutrition-end-date"
                type="date"
                min={nutritionStartDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSaving}
                required
              />
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Salad className="h-5 w-5" />
                {t('mealsTitle')}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMeal}
                disabled={isSaving}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addMealButton')}
              </Button>
            </div>

            {nutritionItems.map((item, index) => (
              <Card key={index} className="p-4 bg-secondary/30 relative shadow-sm border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveMeal(index)}
                  disabled={isSaving || nutritionItems.length === 1}
                  aria-label={t('removeMealLabel')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <div className="grid md:grid-cols-2 gap-4 items-end">
                  {/* Meal Type */}
                  <div className="space-y-1">
                    <Label htmlFor={`meal-type-${index}`}>{t('mealTypeLabel')}</Label>
                    <Select
                      value={item.meal_type}
                      onValueChange={(val: Meal["meal_type"]) => handleChangeMeal(index, 'meal_type', val)}
                      disabled={isSaving}
                    >
                      <SelectTrigger id={`meal-type-${index}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">{t('mealTypeBreakfast')}</SelectItem>
                        <SelectItem value="mid_morning">{t('mealTypeMidMorning')}</SelectItem>
                        <SelectItem value="lunch">{t('mealTypeLunch')}</SelectItem>
                        <SelectItem value="mid_afternoon">{t('mealTypeMidAfternoon')}</SelectItem>
                        <SelectItem value="dinner">{t('mealTypeDinner')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Meal Time */}
                  <div className="space-y-1">
                    <Label htmlFor={`meal-time-${index}`}>{t('mealTimeLabel')}</Label>
                    <Input
                      id={`meal-time-${index}`}
                      type="time"
                      value={item.time}
                      onChange={(e) => handleChangeMeal(index, 'time', e.target.value)}
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>

                {/* Meal Description */}
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`meal-desc-${index}`}>{t('mealDetailsLabel')}</Label>
                  <Textarea
                    id={`meal-desc-${index}`}
                    placeholder={t('mealDetailsPlaceholder')}
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleChangeMeal(index, 'description', e.target.value)}
                    disabled={isSaving}
                    required
                  />
                </div>

                {/* Estimated Calories */}
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`meal-calories-${index}`}>{t('mealCaloriesLabel')}</Label>
                  <Input
                    id={`meal-calories-${index}`}
                    type="number"
                    placeholder={t('mealCaloriesPlaceholder')}
                    value={item.calories || ''}
                    onChange={(e) =>
                      handleChangeMeal(index, 'calories', parseInt(e.target.value) || 0)
                    }
                    disabled={isSaving}
                  />
                </div>
              </Card>
            ))}
          </div>

        </CardContent>
        <CardFooter><Button onClick={handleSaveNutritionPlan} disabled={isSaving} className="w-full md:w-auto"><Save className="mr-2 h-4 w-4" />{isSaving ? t('savingNutritionPlanButton') : t('saveNutritionPlanButton')}</Button></CardFooter>
      </Card>
    </div>
  );
}
