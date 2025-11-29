// src/components/trainer/onboarding-modal.tsx
'use client';
import { useState, useEffect } from 'react';
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
import { completeTrainerOnboarding, TrainerProfileData, getInterests, createInterest } from '@/lib/api';

interface TrainerOnboardingData extends Partial<TrainerProfileData> {
  name: string;
  country: string;
  state: string;
  profilePictureUrl?: string;
  specializations: string[];
  bio: string;
  certifications: string;
  experience_years: number | null;
  interests?: number[];
}

const specializationsList = [
    "Weight Loss", "Muscle Gain", "Strength Training", "Powerlifting", "Bodybuilding", "Athletic Performance",
    "HIIT", "Cardio Endurance", "Yoga", "Pilates", "Rehabilitation", "Senior Fitness", "Youth Training",
    "CrossFit", "Calisthenics", "Functional Training", "Nutrition Coaching", "Online Coaching"
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
  const [interestsList, setInterestsList] = useState<{ id: number; name: string }[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [otherInterest, setOtherInterest] = useState('');
  const [newInterests, setNewInterests] = useState<string[]>([]);
  const [professionalInfo, setProfessionalInfo] = useState<Partial<TrainerProfileData>>({ bio: '', certifications: '', experience_years: undefined });
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));
  const handleSkip = () => handleNext();

  const toggleInterest = (interestId: number) => {
    setSelectedInterests(prev =>
      prev.includes(interestId) ? prev.filter(id => id !== interestId) : [...prev, interestId]
    );
  };

  const addCustomInterest = () => {
    if (otherInterest.trim() && !interestsList.some(i => i.name.toLowerCase() === otherInterest.trim().toLowerCase())) {
      setNewInterests(prev => [...prev, otherInterest.trim()]);
      setOtherInterest('');
    }
  };

  const removeCustomInterest = (index: number) => {
    setNewInterests(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs(prev =>
      prev.includes(spec) ? prev.filter(i => i !== spec) : [...prev, spec]
    );
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  // Fetch interests/specializations on component mount
  useEffect(() => {
    async function fetchInterests() {
      const result = await getInterests();
      if (result.success) {
        setInterestsList(result.data);
      }
    }
    if (isOpen) fetchInterests();
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Create any new interests first
      let allSelectedInterestIds = [...selectedInterests];
      for (const interestName of newInterests) {
        const createResult = await createInterest({ name: interestName });
        if (createResult.success) {
          allSelectedInterestIds.push(createResult.data.id);
        } else {
          console.warn(`Failed to create interest "${interestName}":`, createResult.message);
          // Continue without adding the failed interest
        }
      }

      let uploadedImageUrl: string | undefined = undefined;
      if (profilePic) {
        const uploadResult = await uploadProfilePicture(profilePic);
        if (uploadResult.success) {
          uploadedImageUrl = uploadResult.newUrl;
        } else {
          toast({ title: t('toastUploadFailedTitle'), description: t('toastUploadFailedDesc'), variant: 'destructive' });
        }
      }

      // Prepare onboarding data
      const professionalInfoPayload = {
        ...professionalInfo,
        specializations: selectedSpecs.length > 0 ? selectedSpecs : []
      };

      const onboardingData = {
        name,
        country,
        state: stateValue,
        profilePictureUrl: uploadedImageUrl,
        interests: allSelectedInterestIds.length > 0 ? allSelectedInterestIds : undefined,
        professionalInfo: professionalInfoPayload
      };

      // VALIDATION DEBUG: Check required fields before sending
      const requiredUserFields = ['name', 'country', 'state'];
      const missingUserFields = requiredUserFields.filter(field => !onboardingData[field as keyof typeof onboardingData] || String(onboardingData[field as keyof typeof onboardingData]).trim() === '');
      const requiredTrainerFields = ['bio', 'certifications', 'experience_years', 'specializations'];
      const missingTrainerFields = requiredTrainerFields.filter(field => {
        const value = professionalInfoPayload[field as keyof typeof professionalInfoPayload];
        if (field === 'experience_years') {
          return value === null || value === undefined || value === '';
        }
        if (field === 'specializations') {
          return !Array.isArray(value) || value.length === 0;
        }
        return !value || String(value).trim() === '';
      });

      console.log('VALIDATION DEBUG: Checking required fields...');
      console.log('Required User fields:', requiredUserFields);
      console.log('Onboarding data values:', {
        name: onboardingData.name || 'EMPTY',
        country: onboardingData.country || 'EMPTY',
        state: onboardingData.state || 'EMPTY'
      });
      console.log('Required Trainer fields:', requiredTrainerFields);
      console.log('Professional info values:', {
        bio: professionalInfoPayload.bio || 'EMPTY',
        certifications: professionalInfoPayload.certifications || 'EMPTY',
        experience_years: professionalInfoPayload.experience_years ?? 'EMPTY/NULL',
        specializations: professionalInfoPayload.specializations.length > 0 ? professionalInfoPayload.specializations : 'EMPTY_ARRAY'
      });

      if (missingUserFields.length > 0 || missingTrainerFields.length > 0) {
        console.error('VALIDATION ERROR: Missing required fields detected:');
        if (missingUserFields.length > 0) {
          console.error('Missing User fields:', missingUserFields);
        }
        if (missingTrainerFields.length > 0) {
          console.error('Missing Trainer fields:', missingTrainerFields);
        }
        throw new Error(`Missing required fields: ${[...missingUserFields, ...missingTrainerFields].join(', ')}`);
      }

      // DEBUG: Log the complete onboarding data being sent
      console.log('FRONTEND DEBUG: Onboarding data payload:', {
        userId,
        onboardingData,
        selectedSpecs,
        professionalInfo: professionalInfoPayload
      });

      const result = await completeTrainerOnboarding(userId, onboardingData);

      if (result.success) {
        toast({ title: t('toastWelcomeTitle'), description: t('toastWelcomeDescription') });
        setTimeout(onClose, 500);
      } else {
        console.error('BACKEND ERROR: Onboarding failed with message:', result.message);
        throw new Error(result.message || t('toastErrorDescription'));
      }
    } catch (error: any) {
      console.error('ONBOARDING FAILURE: Complete error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      toast({ title: t('toastErrorTitle'), description: error.message || t('toastErrorDescription'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = name.trim() && country.trim() && stateValue.trim();
  const isStep2Valid = professionalInfo.bio && professionalInfo.certifications && professionalInfo.experience_years !== undefined;
  const isFinalStep = step === totalSteps;

  const renderStepContent = () => {
    switch (step) {
      case 1: // Bio
        return (
          <div className="space-y-4">
             <DialogDescription>{t('trainerStep1Desc')}</DialogDescription>
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
      case 2: // Professional Info
        return (
          <div className="space-y-4">
            <DialogDescription>{t('trainerStep2Desc')}</DialogDescription>
            <div className="space-y-2">
                <Label htmlFor="bio">{t('bioLabel')}</Label>
                <Textarea id="bio" placeholder={t('bioPlaceholder')} value={professionalInfo.bio} onChange={e => setProfessionalInfo(p => ({...p, bio: e.target.value}))} rows={4}/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="experience">{t('experienceLabel')}</Label>
                <Input id="experience" type="number" placeholder={t('experiencePlaceholder')} value={professionalInfo.experience_years || ''} onChange={e => setProfessionalInfo(p => ({...p, experience_years: e.target.value ? parseInt(e.target.value) : undefined}))} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="certifications">{t('certificationsLabel')}</Label>
                <Input id="certifications" placeholder={t('certificationsPlaceholder')} value={professionalInfo.certifications} onChange={e => setProfessionalInfo(p => ({...p, certifications: e.target.value}))} />
            </div>
          </div>
        );
      case 3: // Specializations
        return (
          <div className='space-y-4'>
            <DialogDescription>Select your specializations or training areas.</DialogDescription>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {specializationsList.map(spec => (
                  <Badge
                    key={spec}
                    variant={selectedSpecs.includes(spec) ? 'default' : 'secondary'}
                    onClick={() => toggleSpecialization(spec)}
                    className="cursor-pointer text-sm"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );
      case 4: // Interests
        return (
          <div className='space-y-4'>
            <DialogDescription>Select your areas of interest or add new ones.</DialogDescription>
            <div className="space-y-2">
              <Label>Interests (select existing or add new)</Label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {interestsList.map(interest => (
                  <Badge
                    key={interest.id}
                    variant={selectedInterests.includes(interest.id) ? 'default' : 'secondary'}
                    onClick={() => toggleInterest(interest.id)}
                    className="cursor-pointer text-sm"
                  >
                    {interest.name}
                  </Badge>
                ))}
                {newInterests.map((interest, index) => (
                  <Badge key={`custom-${index}`} variant="default" className="text-sm">
                    {interest}
                    <button onClick={() => removeCustomInterest(index)} className="ml-1">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom interest..."
                  value={otherInterest}
                  onChange={(e) => setOtherInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomInterest();
                    }
                  }}
                />
                <Button type="button" onClick={addCustomInterest} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>
          </div>
        );
      case 5: // Profile Picture (Headshot)
        return (
          <div className="space-y-4 text-center">
            <DialogDescription>Upload a professional headshot to showcase your trainer profile.</DialogDescription>
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
      if (isFinalStep) return false; // Final step (profile picture) is optional
      if (step === 1) return !isStep1Valid; // Basic info validation - returns true when disabled
      if (step === 2) return !(professionalInfo.bio && professionalInfo.certifications && professionalInfo.experience_years !== undefined); // Professional info validation - returns true when disabled
      if (step === 3) return selectedSpecs.length === 0; // Specializations require at least one selection
      if (step === 4) return false; // Interests step is optional - always enabled
      return false; // Allow progression for other steps
  }

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
              {isFinalStep && <Button variant="ghost" onClick={handleSkip} disabled={isSaving}>{t('skipButton')}</Button>}
              {isFinalStep ? (
                <Button onClick={handleSubmit} disabled={isSaving || getButtonState()}>
                  {isSaving ? <Loader2 className="animate-spin" /> : t('finishButton')}
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={getButtonState()}><ArrowRight className="mr-2 h-4 w-4"/> {t('nextButton')}</Button>
              )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
