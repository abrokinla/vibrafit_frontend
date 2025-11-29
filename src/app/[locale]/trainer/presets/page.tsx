// src/app/[locale]/trainer/presets/page.tsx
'use client';
export const runtime = 'edge';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Save, Dumbbell, Library, UploadCloud, Loader2, Edit, Copy } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { PresetRoutine, PresetExercise,
   createPresetRoutine, fetchPresetRoutines, 
   updatePresetRoutine, deletePresetRoutine, 
   duplicatePresetRoutine 

} from "@/lib/api";
import { useTranslations } from 'next-intl';
import { uploadTimelineMedia } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function TrainerPresetsPage() {
  const t = useTranslations('TrainerPresetsPage');
  const { toast } = useToast();

  // Form state
  const [presetName, setPresetName] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | undefined>(undefined);
  const [exercises, setExercises] = useState<PresetExercise[]>([
    { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '', order: 0 },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Library and editing state
  const [presetLibrary, setPresetLibrary] = useState<PresetRoutine[]>([]);
  const [editingPresetId, setEditingPresetId] = useState<number | null>(null);
  const videoFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    async function loadPresets() {
      setIsLoading(true);
      try {
        const presets = await fetchPresetRoutines();
        setPresetLibrary(presets);
      } catch (error) {
        toast({ title: t('toastErrorTitle'), description: "Failed to load preset library.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadPresets();
  }, [toast, t]);

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '', order: exercises.length }
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleExerciseChange = (id: string, field: keyof PresetExercise, value: string) => {
    setExercises(exercises?.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };
  
  const handleVideoUpload = async (exerciseId: string, file: File) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: "File too large", description: "Video files should be less than 10MB.", variant: "destructive" });
        return;
      }

      setIsUploadingVideo(true);
      toast({ title: "Uploading Video", description: "Please wait while your video is being uploaded..." });

      try {
        const result = await uploadTimelineMedia(file);
        if (result.success && result.url) {
            handleExerciseChange(exerciseId, 'video_url', result.url);
            toast({ title: "Video Uploaded", description: `Video for exercise has been linked.`});
        } else {
            throw new Error(result.error || "Upload failed");
        }
      } catch (error: any) {
        toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      } finally {
        setIsUploadingVideo(false);
      }
  }

  const handleDuplicatePreset = async (preset: PresetRoutine) => {
    try {
      const result = await duplicatePresetRoutine(preset.id);
      
      if (result.success) {
        setPresetLibrary(prev => [...prev, result.newPreset]);
        toast({ 
          title: t('toastPresetDuplicated'), 
          description: t('toastPresetDuplicatedDesc', { name: result.newPreset.name }) 
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ 
        title: t('toastErrorTitle'), 
        description: error.message, 
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setEditingPresetId(null);
    setPresetName('');
    setLevel(undefined);
    setExercises([{ id: Date.now().toString(), name: '', sets: '', reps: '', unit: 'reps', notes: '', video_url: '', order: 0 }]);
  };

  const validateForm = (): boolean => {
    if (!presetName.trim()) {
      toast({ 
        title: t('toastMissingInfo'), 
        description: t('presetNameRequired'), 
        variant: "destructive" 
      });
      return false;
    }
    
    if (!level) {
      toast({ 
        title: t('toastMissingInfo'), 
        description: t('levelRequired'), 
        variant: "destructive" 
      });
      return false;
    }
    
    const invalidExercises = exercises.filter(ex => 
      !ex.name.trim() || !ex.sets.trim() || !ex.reps.trim()
    );
    
    if (invalidExercises.length > 0) {
      toast({ 
        title: t('toastMissingInfo'), 
        description: t('exerciseFieldsRequired'), 
        variant: "destructive" 
      });
      return false;
    }
    
    return true;
  };

  const handleSavePreset = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    
    const routineData = {
      name: presetName,
      level: level!,
      exercises: exercises.map(({ id, video_url, name, sets, reps, unit, notes, order }) => ({
        id,
        name,
        sets,
        reps,
        unit,
        notes,
        video_url: video_url || "",
        order
      }))
    };

    try {
      if (editingPresetId) {
        // Handle update case
        const result = await updatePresetRoutine(editingPresetId, routineData);
        
        if (result.success) {
          setPresetLibrary(prev => prev.map(p => p.id === editingPresetId ? result.preset : p));
          toast({ 
            title: t('toastPresetUpdated'), 
            description: t('toastPresetUpdatedDesc', { name: presetName }) 
          });
          resetForm();
        } else {
          // result.success is false, so result.error exists
          throw new Error(result.error);
        }
      } else {
        // Handle create case
        const result = await createPresetRoutine(routineData);
        
        if (result.success) {
          setPresetLibrary(prev => [...prev, result.newPreset]);
          toast({ 
            title: t('toastPresetSaved'), 
            description: t('toastPresetSavedDesc', { name: presetName }) 
          });
          resetForm();
        } else {
          throw new Error(result.error);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('toastErrorSaving');
      toast({ 
        title: t('toastErrorSaving'), 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPreset = (preset: PresetRoutine) => {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setLevel(preset.level);
    setExercises(
      preset.exercises?.map((ex, idx) => ({
        ...ex,
        id: Date.now().toString() + Math.random(),
        sets: String(ex.sets || ''), // Convert to string for form inputs
        reps: String(ex.reps || ''), // Convert to string for form inputs
        order: typeof ex.order === 'number' ? ex.order : idx
      }))
    ); // create new client-side IDs and ensure order
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDeletePreset = async (id: number) => {
    try {
        const result = await deletePresetRoutine(id);
        if (result.success) {
            setPresetLibrary(prev => prev.filter(p => p.id !== id));
            toast({ title: t('toastPresetDeleted'), description: t('toastPresetDeletedDesc') });
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        toast({ title: t('toastErrorTitle'), description: error.message, variant: "destructive" });
    }
  };


  const renderPresetList = (level: 'beginner' | 'intermediate' | 'advanced') => {
    const filteredPresets = presetLibrary.filter(p => p.level === level);
    if (filteredPresets.length === 0) return <p className="text-sm text-muted-foreground px-4 py-2">{t('noPresets')}</p>;
    
    return filteredPresets.map(preset => (
      <Card key={preset.id} className="mb-2">
        <CardHeader className="p-4 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-md">{preset.name}</CardTitle>
            <CardDescription className="text-xs">{preset.exercises?.length} exercises</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => handleEditPreset(preset)} className="h-8 w-8">
              <Edit className="h-4 w-4" />
              <span className="sr-only">{t('editButton')}</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => handleDuplicatePreset(preset)} 
              className="h-8 w-8"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">{t('duplicateButton')}</span>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">{t('deleteButton')}</span>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                       {t('confirmDeleteDesc')}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeletePreset(preset.id)}>{t('deleteConfirmButton')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="list-disc pl-5 text-sm">
            {preset.exercises?.slice(0, 3).map(ex => <li key={ex.id}>{ex.name} ({ex.sets}x{ex.reps})</li>)}
            {preset.exercises?.length > 3 && <li className="text-muted-foreground">...and {preset.exercises?.length - 3} more.</li>}
          </ul>
        </CardContent>
      </Card>
    ));
  };


  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Library className="h-6 w-6" /> 
            {editingPresetId ? t('editPresetTitle') : t('newPresetTitle')}
          </CardTitle>
          <CardDescription>{editingPresetId ? t('editPresetDescription') : t('newPresetDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="preset-name">{t('presetNameLabel')}</Label>
              <Input id="preset-name" placeholder={t('presetNamePlaceholder')} value={presetName} onChange={(e) => setPresetName(e.target.value)} disabled={isSaving}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="level-select">{t('levelLabel')}</Label>
              <Select value={level} onValueChange={(val: any) => setLevel(val)} disabled={isSaving}>
                <SelectTrigger id="level-select"><SelectValue placeholder={t('levelLabel')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{t('levelBeginner')}</SelectItem>
                  <SelectItem value="intermediate">{t('levelIntermediate')}</SelectItem>
                  <SelectItem value="advanced">{t('levelAdvanced')}</SelectItem>
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
                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveExercise(exercise.id)} disabled={isSaving || exercises.length === 1} aria-label={t('removeExerciseLabel')}><Trash2 className="h-4 w-4" /></Button>
                <div className="grid md:grid-cols-3 gap-4 items-end">
                   <div className="space-y-1 md:col-span-2">
                    <Label htmlFor={`ex-name-${index}`}>{t('exerciseNameLabel')}</Label>
                    <Input id={`ex-name-${index}`} placeholder={t('exerciseNamePlaceholder')} value={exercise.name} onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)} disabled={isSaving}/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-unit-${index}`}>{t('unitLabel')}</Label>
                    <Select value={exercise.unit} onValueChange={(val: any) => handleExerciseChange(exercise.id, 'unit', val)} disabled={isSaving}>
                      <SelectTrigger id={`ex-unit-${index}`}><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="reps">{t('unitReps')}</SelectItem><SelectItem value="seconds">{t('unitSeconds')}</SelectItem><SelectItem value="minutes">{t('unitMinutes')}</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-1">
                    <Label htmlFor={`ex-sets-${index}`}>{t('setsLabel')}</Label>
                    <Input id={`ex-sets-${index}`} type="number" min="1" placeholder={t('setsPlaceholder')} value={exercise.sets} onChange={(e) => handleExerciseChange(exercise.id, 'sets', e.target.value)} disabled={isSaving}/>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`ex-reps-${index}`}>{exercise.unit === 'reps' ? t('repsLabel') : t('durationPerSetLabel', { unit: exercise.unit.charAt(0).toUpperCase() + exercise.unit.slice(1) })}</Label>
                    <Input id={`ex-reps-${index}`} type="number" min="1" placeholder={exercise.unit === 'reps' ? t('repsPlaceholder') : t('durationPlaceholder')} value={exercise.reps} onChange={(e) => handleExerciseChange(exercise.id, 'reps', e.target.value)} disabled={isSaving}/>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`ex-notes-${index}`}>{t('notesLabel')}</Label>
                  <Textarea id={`ex-notes-${index}`} placeholder={t('notesPlaceholder')} rows={2} value={exercise.notes || ''} onChange={(e) => handleExerciseChange(exercise.id, 'notes', e.target.value)} disabled={isSaving}/>
                </div>
                <div className="mt-3 space-y-1">
                  <Label htmlFor={`ex-video-${index}`}>{t('videoUrlLabel')}</Label>
                  <div className="flex gap-2 items-center">
                    <Input id={`ex-video-url-${index}`} placeholder={t('videoUrlPlaceholder')} value={exercise.video_url || ''} onChange={(e) => handleExerciseChange(exercise.id, 'video_url', e.target.value)} disabled={true}/>
                    <Button variant="outline" size="icon" onClick={() => videoFileRefs.current[exercise.id]?.click()} disabled={isSaving} aria-label="Upload video">
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
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSavePreset} disabled={isSaving || isUploadingVideo} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />{isSaving ? t('savingPresetButton') : (editingPresetId ? t('updatePresetButton') : t('savePresetButton'))}
          </Button>
           {editingPresetId && (
            <Button variant="ghost" onClick={resetForm} disabled={isSaving}>
              {t('cancelButton')}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Library className="h-6 w-6" /> {t('presetLibraryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="mx-auto animate-spin" /> : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
