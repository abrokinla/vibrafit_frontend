
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
import { useTranslations } from 'next-intl'; // For shared keys

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

async function completeOnboardingProcess(
  userId: string,
  name: string,
  country: string,
  state: string
): Promise<{ success: boolean, data?: any }> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Missing access token – please sign in again.');
  }

  const res = await fetch(
    `https://vibrafit.onrender.com/api/users/${userId}/onboard/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, country, state }),
    }
  );

  let responseData;
  try {
    responseData = await res.json();
  } catch (e) {
    const text = await res.text();
    responseData = { message: text };
  }

  if (!res.ok) {
    throw new Error(`Onboard failed: ${responseData.detail || JSON.stringify(responseData)}`);
  }

  return { success: true, data: responseData };
}

export default function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const t = useTranslations('OnboardingModal'); // Use shared translation namespace
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [stateValue, setStateValue] = useState(''); // Renamed state to avoid conflict with React's state
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await completeOnboardingProcess(userId, name, country, stateValue);
      
      if (result.success) {
        toast({
          title: t('toastWelcomeTitle'),
          description: t('toastWelcomeDescription'),
        });
        
        setTimeout(() => {
          onClose(); 
        }, 500);
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: t('toastErrorTitle'),
        description: error.message || t('toastErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInteractOutside = (e: Event) => e.preventDefault();
  const handleEscapeKeyDown = (e: KeyboardEvent) => e.preventDefault();

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="onboarding-trainer-name">{t('namePlaceholder')}</Label>
            <Input
              id="onboarding-trainer-name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboarding-trainer-country">{t('countryPlaceholder')}</Label>
            <Input
              id="onboarding-trainer-country"
              type="text"
              placeholder={t('countryPlaceholder')}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="onboarding-trainer-state">{t('statePlaceholder')}</Label>
            <Input
              id="onboarding-trainer-state"
              type="text"
              placeholder={t('statePlaceholder')}
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? t('settingUpButton') : t('continueButton')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    