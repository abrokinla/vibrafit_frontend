// src/components/user/workout-session-modal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
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
import Hls from 'hls.js';

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
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-select first exercise
  useEffect(() => {
    if (!isOpen || !routine?.exercises?.length) return;
    if (selectedExercise) return;

    const withVideo = routine.exercises.find((e) => !!e.videoUrl);
    const fallback = routine.exercises[0] ?? null;
    const initial = withVideo ?? fallback ?? null;

    if (initial) {
      setSelectedExercise(initial);
    }
  }, [isOpen, routine, selectedExercise]);

  // When selectedExercise changes, (re)wire the player
  useEffect(() => {
    if (!selectedExercise?.videoUrl) {
      setIsVideoLoading(false);
      return;
    }

    const url = selectedExercise.videoUrl;
    const isHls = /\.m3u8($|\?)/i.test(url);
    const video = videoRef.current;

    // Cleanup any previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setIsVideoLoading(true);

    if (isHls && video) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        video.oncanplay = () => setIsVideoLoading(false);
        video.onwaiting = () => setIsVideoLoading(true);
        video.onerror = (e) => {
          console.error('Video error (HLS):', e);
          setIsVideoLoading(false);
        };
      } else {
        video.src = url;
        video.oncanplay = () => setIsVideoLoading(false);
        video.onwaiting = () => setIsVideoLoading(true);
        video.onerror = (e) => {
          console.error('Video error (native HLS):', e);
          setIsVideoLoading(false);
        };
        video.load();
      }
    } else if (video) {
      // MP4 or other direct file
      // Force the video element to reload when URL changes
      video.onloadeddata = () => setIsVideoLoading(false);
      video.onwaiting = () => setIsVideoLoading(true);
      video.onerror = (e) => {
        console.error('Video error (MP4):', e);
        setIsVideoLoading(false);
      };
      video.load();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedExercise?.videoUrl]);

  if (!routine) return null;

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleSave = () => {
    onSaveProgress(routine.planId);
  };

  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|[?&]v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId =
    selectedExercise?.videoUrl ? getYouTubeId(selectedExercise.videoUrl) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl">
            {routine.routineName || t('todaysRoutineNoNameTitle')}
          </DialogTitle>
          <DialogDescription>
            {routine.trainerNotes || t('modalDescription')}
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 flex-1 overflow-hidden p-6">
          {/* Left: exercise list */}
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-3">{t('exerciseListTitle')}</h3>
            <ScrollArea className="flex-1 pr-4">
              <ul className="space-y-2">
                {routine.exercises.map((exercise) => (
                  <li key={exercise.id} className="flex items-center gap-3">
                    <Checkbox
                      id={`modal-${routine!.planId}-${exercise.id}`}
                      checked={completedExercises.has(exercise.name)}
                      onCheckedChange={() =>
                        onToggleComplete(routine!.planId, exercise.name)
                      }
                      aria-label={t('markExerciseCompleteLabel', {
                        exerciseName: exercise.name,
                      })}
                      disabled={isSaving}
                      className="h-5 w-5"
                    />

                    <Button
                      type="button"
                      variant={
                        selectedExercise?.id === exercise.id ? 'secondary' : 'outline'
                      }
                      className="flex-1 justify-start text-left h-auto py-2"
                      onClick={() => handleExerciseClick(exercise)}
                    >
                      <div>
                        <p className="font-medium">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps} {exercise.unit}
                        </p>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {/* Right: player */}
          <div className="flex flex-col h-full bg-muted rounded-lg overflow-hidden">
            {selectedExercise?.videoUrl ? (
              youtubeId ? (
                // YouTube
                <iframe
                  key={youtubeId}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title="YouTube video player"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="min-h-[300px]"
                />
              ) : (
                // Cloudinary / MP4 / HLS
                <div className="relative w-full h-full">
                  {isVideoLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}

                  <video
                    key={selectedExercise.videoUrl} // force remount on URL change
                    id="exercise-video"
                    ref={videoRef}
                    controls
                    crossOrigin="anonymous"
                    width="100%"
                    height="100%"
                    className="min-h-[300px]"
                    // These fire for MP4 and native HLS
                    onLoadStart={() => setIsVideoLoading(true)}
                    onWaiting={() => setIsVideoLoading(true)}
                    onCanPlay={() => setIsVideoLoading(false)}
                    onError={(e) => {
                      console.error('Video element error:', e);
                      setIsVideoLoading(false);
                    }}
                  >
                    {/* For MP4 this is used; for HLS via hls.js, src is attached programmatically */}
                    <source
                      src={selectedExercise.videoUrl}
                      type={
                        /\.m3u8($|\?)/i.test(selectedExercise.videoUrl)
                          ? 'application/x-mpegURL'
                          : 'video/mp4'
                      }
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h4 className="text-lg font-semibold">{t('videoPlayerTitle')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('videoPlayerDescription')}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t mt-auto">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? t('savingProgressButton') : t('saveProgressButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
