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
import { useToast } from '@/hooks/use-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void; // Function to call when onboarding is completed
  userId: string;
}

async function completeOnboardingProcess(
  userId: string,
  name: string,
  country: string,
  state: string
): Promise<{ success: boolean }> {
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

  if (!res.ok) {
    let errMsg: string;
    try {
      const errData = await res.json();
      errMsg = errData.detail || JSON.stringify(errData);
    } catch {
      errMsg = await res.text();
    }
    throw new Error(`Onboard failed: ${errMsg}`);
  }

  return { success: true };
}

export default function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await completeOnboardingProcess(userId, name, country, state);
      if (result.success) {
        toast({
          title: 'Welcome Aboard!',
          description: "You're all set to start your Vibrafit journey.",
        });
        onClose(); // Close the modal and update dashboard
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
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
          <DialogTitle>Welcome to Vibrafit!</DialogTitle>
          <DialogDescription>
            We're excited to have you. Let’s set up your profile to begin your fitness journey.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Your Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? 'Setting Up...' : 'Continue to Dashboard'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
