// src/components/user/workout-session-modal.tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DailyUserRoutine, Exercise } from '@/lib/api';
import { Save, Loader2, Video, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WorkoutSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: DailyUserRoutine | null;
  completedExercises: Set<string>;
  onToggleComplete: (planId: number, exerciseName: string) => void;
  onSaveProgress: (planId: number) => void;
  isSaving: boolean;
}

export default function WorkoutSessionModal({
  isOpen,
  onClose,
  routine,
  completedExercises,
  onToggleComplete,
  onSaveProgress,
  isSaving,
}: WorkoutSessionModalProps) {
  const t = useTranslations('WorkoutsPage');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  if (!routine) return null;

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleSave = () => {
    onSaveProgress(routine.planId);
  };

  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  const videoId = selectedExercise?.videoUrl ? getYouTubeId(selectedExercise.videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl">{routine.routineName || t('todaysRoutineNoNameTitle')}</DialogTitle>
          <DialogDescription>{routine.trainerNotes || t('modalDescription')}</DialogDescription>
           <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden p-6">
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-3">{t('exerciseListTitle')}</h3>
            <ScrollArea className="flex-1 pr-4">
              <ul className="space-y-2">
                {routine.exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`modal-${routine!.planId}-${exercise.id}`}
                      checked={completedExercises.has(exercise.name)}
                      onCheckedChange={() => onToggleComplete(routine!.planId, exercise.name)}
                      aria-label={t('markExerciseCompleteLabel', { exerciseName: exercise.name })}
                      disabled={isSaving}
                      className="h-5 w-5"
                    />
                    <Button
                      variant={selectedExercise?.id === exercise.id ? "secondary" : "outline"}
                      className="flex-1 justify-start text-left h-auto py-2"
                      onClick={() => handleExerciseClick(exercise)}
                    >
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">{exercise.sets} sets × {exercise.reps} {exercise.unit}</p>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          <div className="flex flex-col h-full bg-muted rounded-lg overflow-hidden">
            {videoId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="min-h-[300px]"
              ></iframe>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold">{t('videoPlayerTitle')}</h4>
                <p className="text-sm text-muted-foreground">{t('videoPlayerDescription')}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t mt-auto">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? t('savingProgressButton') : t('saveProgressButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
