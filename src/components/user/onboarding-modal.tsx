// src/components/user/onboarding-modal.tsx
'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { uploadProfilePicture } from '@/lib/utils';
import Image from 'next/image';
import { completeUserOnboarding, GoalPayload, UserData } from '@/lib/api';

const interestsList = [
    "Weight Loss", "Muscle Gain", "Strength Training", "Cardio", "HIIT", "Yoga",
    "Pilates", "Running", "Cycling", "Swimming", "Bodybuilding", "CrossFit",
    "Calisthenics", "Functional Training", "Nutrition", "Meal Prep", "Mindfulness", "Meditation"
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const t = useTranslations('OnboardingModal');
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [goal, setGoal] = useState<Partial<GoalPayload>>({ description: '', target_value: '', target_date: '' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ weight: string; height: string }>({ weight: '', height: '' });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSkip = () => handleNext();

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      let uploadedImageUrl: string | undefined = undefined;
      if (profilePic) {
        const uploadResult = await uploadProfilePicture(profilePic);
        if (uploadResult.success) {
          uploadedImageUrl = uploadResult.newUrl;
        } else {
          toast({ title: t('toastUploadFailedTitle'), description: t('toastUploadFailedDesc'), variant: 'destructive' });
        }
      }

      const onboardingData: Partial<UserData> & { interests: string[], goal?: Partial<GoalPayload> } = {
        name,
        country,
        state: stateValue,
        interests: selectedInterests,
        profilePictureUrl: uploadedImageUrl,
        goal: goal.description ? { ...goal, status: 'pending', user: parseInt(userId) } : undefined,
        metrics: {
          weight: metrics.weight ? parseFloat(metrics.weight) : undefined,
          height: metrics.height ? parseFloat(metrics.height) : undefined,
        }
      };

      const result = await completeUserOnboarding(userId, onboardingData);

      if (result.success) {
        toast({ title: t('toastWelcomeTitle'), description: t('toastWelcomeDescription') });
        setTimeout(onClose, 500);
      } else {
        throw new Error(result.message || t('toastErrorDescription'));
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      toast({ title: t('toastErrorTitle'), description: error.message || t('toastErrorDescription'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = name.trim() && country.trim() && stateValue.trim();
  const isStep3Valid = selectedInterests.length >= 5;
  const isFinalStep = step === totalSteps;

  const renderStepContent = () => {
    switch (step) {
      case 1: // Bio
        return (
          <div className="space-y-4">
             <DialogDescription>{t('clientStep1Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="onboarding-name">{t('nameLabel')}</Label>
              <Input id="onboarding-name" placeholder={t('namePlaceholder')} value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-country">{t('countryLabel')}</Label>
              <Input id="onboarding-country" placeholder={t('countryPlaceholder')} value={country} onChange={e => setCountry(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-state">{t('stateLabel')}</Label>
              <Input id="onboarding-state" placeholder={t('statePlaceholder')} value={stateValue} onChange={e => setStateValue(e.target.value)} required />
            </div>
          </div>
        );
      case 2: // Goals
        return (
          <div className="space-y-4">
             <DialogDescription>{t('clientStep2Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="goal-desc">{t('goalDescriptionLabel')}</Label>
              <Textarea id="goal-desc" placeholder={t('goalDescriptionPlaceholder')} value={goal.description} onChange={e => setGoal(g => ({ ...g, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target">{t('goalTargetLabel')}</Label>
              <Input id="goal-target" placeholder={t('goalTargetPlaceholder')} value={goal.target_value} onChange={e => setGoal(g => ({ ...g, target_value: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-date">{t('goalDateLabel')}</Label>
              <Input id="goal-date" type="date" value={goal.target_date} onChange={e => setGoal(g => ({ ...g, target_date: e.target.value }))} />
            </div>
          </div>
        );
      case 3: // Interests
        return (
          <div className='space-y-4'>
            <DialogDescription>{t('clientStep3Desc')}</DialogDescription>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {interestsList.map(interest => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? 'default' : 'secondary'}
                  onClick={() => toggleInterest(interest)}
                  className="cursor-pointer text-sm"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        );
      case 4: // Metrics
        return (
          <div className="space-y-4">
            <DialogDescription>{t('clientStep4Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="metric-weight">{t('weightLabel')}</Label>
              <Input id="metric-weight" type="number" placeholder={t('weightPlaceholder')} value={metrics.weight} onChange={e => setMetrics(m => ({ ...m, weight: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-height">{t('heightLabel')}</Label>
              <Input id="metric-height" type="number" placeholder={t('heightPlaceholder')} value={metrics.height} onChange={e => setMetrics(m => ({ ...m, height: e.target.value }))} />
            </div>
          </div>
        );
      case 5: // Profile Picture
        return (
          <div className="space-y-4 text-center">
            <DialogDescription>{t('clientStep5Desc')}</DialogDescription>
            <div className="flex justify-center">
                <label htmlFor="profile-pic-upload" className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed overflow-hidden">
                        {profilePicPreview ? (
                            <Image src={profilePicPreview} alt="Profile preview" width={128} height={128} className="object-cover w-full h-full" />
                        ) : (
                            <Camera className="h-12 w-12 text-muted-foreground" />
                        )}
                    </div>
                </label>
            </div>
            <Input id="profile-pic-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => document.getElementById('profile-pic-upload')?.click()}>
                {t('selectImageButton')}
            </Button>
          </div>
        );
      default: return null;
    }
  };

  const getButtonState = () => {
      if (isFinalStep) return true;
      if (step === 1) return isStep1Valid;
      if (step === 3) return isStep3Valid;
      return true; // For skippable steps
  }

  const showSkipButton = [2, 4, 5].includes(step);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()} hideCloseButton>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')} - {t('step')} {step}/{totalSteps}</DialogTitle>
          <Progress value={(step / totalSteps) * 100} className="mt-2" />
        </DialogHeader>

        <div className="py-6 min-h-[300px]">
            {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between w-full">
            <div>
              {step > 1 && <Button variant="outline" onClick={handleBack} disabled={isSaving}><ArrowLeft className="mr-2 h-4 w-4"/> {t('backButton')}</Button>}
            </div>
            <div className="flex gap-2">
              {showSkipButton && <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>{t('skipButton')}</Button>}
              {isFinalStep ? (
                <Button onClick={handleSubmit} disabled={isSaving || !getButtonState()}>
                  {isSaving ? <Loader2 className="animate-spin" /> : t('finishButton')}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={!getButtonState()}><ArrowRight className="mr-2 h-4 w-4"/> {t('nextButton')}</Button>
              )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
