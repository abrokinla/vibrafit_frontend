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
  onClose: () => void; // Function to call when onboarding is completed/closed
  userId: string; // To associate with the user
}

// Simulate marking user as onboarded (replace with actual API call)
async function completeOnboardingProcess(userId: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log(`Marking user ${userId} as onboarded.`);
  // In a real app, update the user's 'isOnboarded' status in the database.
  return { success: true };
}

export default function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await completeOnboardingProcess(userId);
      if (result.success) {
        toast({
          title: 'Welcome Aboard!',
          description: "You're all set to start your Vibrafit journey.",
        });
        onClose(); // Close the modal on success
      } else {
        toast({
          title: 'Setup Failed',
          description: 'Could not complete onboarding. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Prevent closing the dialog by clicking outside or pressing Esc
  const handleInteractOutside = (event: Event) => {
    event.preventDefault();
  };

  const handleEscapeKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
        hideCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>Welcome to Vibrafit!</DialogTitle>
          <DialogDescription>
            We're excited to have you. Let's get you started on your fitness journey.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Goal input removed */}
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
