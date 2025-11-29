// src/components/gym/onboarding-modal.tsx
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
import { Loader2, ArrowRight, ArrowLeft, Building, MapPin, Globe, Phone, Palette } from 'lucide-react';
import { completeGymOnboarding, GymOnboardingData } from '@/lib/api';

interface GymOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  gymId: string;
}

export default function GymOnboardingModal({ isOpen, onClose, userId, gymId }: GymOnboardingModalProps) {
  const t = useTranslations('GymOnboardingModal');
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [gymDetails, setGymDetails] = useState({
    description: '',
    website: '',
    phone: '',
    address: '',
    max_members: 50,
    primary_color: '#FF6B35',
    secondary_color: '#F7931E',
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  // Load existing gym data if available
  useEffect(() => {
    if (isOpen && gymId) {
      // We could fetch gym details here if needed, but for now we'll rely on the gym being newly created with just a name
      // The gym name is already set during signup, so we can focus on additional details
    }
  }, [isOpen, gymId]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Prepare onboarding data
      const onboardingData: GymOnboardingData = {
        name: name.trim(),
        country: country.trim(),
        state: state.trim(),
        gymDetails: {
          ...gymDetails,
          description: gymDetails.description.trim(),
          website: gymDetails.website.trim(),
          phone: gymDetails.phone.trim(),
          address: gymDetails.address.trim(),
        }
      };

      // Validation
      const requiredFields = ['name', 'country', 'state'];
      const missingFields = requiredFields.filter(field => !onboardingData[field as keyof typeof onboardingData] ||
        (typeof onboardingData[field as keyof typeof onboardingData] === 'string' &&
         !(onboardingData[field as keyof typeof onboardingData] as string).trim())
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const result = await completeGymOnboarding(userId, gymId, onboardingData);

      if (result.success) {
        toast({ title: t('toastWelcomeTitle'), description: t('toastWelcomeDescription') });
        onClose();
      } else {
        throw new Error(result.message || t('toastErrorDescription'));
      }
    } catch (error: any) {
      console.error('GYM ONBOARDING FAILURE:', error);
      toast({ title: t('toastErrorTitle'), description: error.message || t('toastErrorDescription'), variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isStep1Valid = name.trim() && country.trim() && state.trim();
  const isStep2Valid = gymDetails.address.trim() && gymDetails.phone.trim();
  const isFinalStep = step === totalSteps;

  const renderStepContent = () => {
    switch (step) {
      case 1: // Basic Info
        return (
          <div className="space-y-4">
            <DialogDescription>{t('gymStep1Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="onboarding-name">{t('gymNameLabel')}</Label>
              <Input
                id="onboarding-name"
                placeholder={t('gymNamePlaceholder')}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-country">{t('countryLabel')}</Label>
              <Input
                id="onboarding-country"
                placeholder={t('countryPlaceholder')}
                value={country}
                onChange={e => setCountry(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-state">{t('stateLabel')}</Label>
              <Input
                id="onboarding-state"
                placeholder={t('statePlaceholder')}
                value={state}
                onChange={e => setState(e.target.value)}
                required
              />
            </div>
          </div>
        );
      case 2: // Contact & Location
        return (
          <div className="space-y-4">
            <DialogDescription>{t('gymStep2Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="address">{t('addressLabel')}</Label>
              <Textarea
                id="address"
                placeholder={t('addressPlaceholder')}
                value={gymDetails.address}
                onChange={e => setGymDetails(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phoneLabel')}</Label>
              <Input
                id="phone"
                placeholder={t('phonePlaceholder')}
                value={gymDetails.phone}
                onChange={e => setGymDetails(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">{t('websiteLabel')}</Label>
              <Input
                id="website"
                type="url"
                placeholder={t('websitePlaceholder')}
                value={gymDetails.website}
                onChange={e => setGymDetails(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_members">{t('maxMembersLabel')}</Label>
              <Input
                id="max_members"
                type="number"
                min="1"
                max="1000"
                value={gymDetails.max_members}
                onChange={e => setGymDetails(prev => ({ ...prev, max_members: parseInt(e.target.value) || 50 }))}
              />
            </div>
          </div>
        );
      case 3: // Description & Branding
        return (
          <div className="space-y-4">
            <DialogDescription>{t('gymStep3Desc')}</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="description">{t('descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                value={gymDetails.description}
                onChange={e => setGymDetails(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">{t('primaryColorLabel')}</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={gymDetails.primary_color}
                  onChange={e => setGymDetails(prev => ({ ...prev, primary_color: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary_color">{t('secondaryColorLabel')}</Label>
                <Input
                  id="secondary_color"
                  type="color"
                  value={gymDetails.secondary_color}
                  onChange={e => setGymDetails(prev => ({ ...prev, secondary_color: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const getButtonState = () => {
    if (isFinalStep) return false; // Final step is optional
    if (step === 1) return !isStep1Valid; // Basic info validation
    if (step === 2) return !isStep2Valid; // Contact info validation
    if (step === 3) return false; // Branding is optional
    return false;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            {isFinalStep ? (
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : t('finishButton')}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={getButtonState()}>
                <ArrowRight className="mr-2 h-4 w-4"/> {t('nextButton')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
