// Improved onboarding modal with debugging and improved error handling
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
): Promise<{ success: boolean, data?: any }> {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Missing access token – please sign in again.');
  }

  console.log("Sending onboarding data:", { userId, name, country, state }); // Debug log

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

  // Log the full response for debugging
  console.log("Onboarding API response status:", res.status);
  
  // Parse the response data
  let responseData;
  try {
    responseData = await res.json();
    console.log("Onboarding API response data:", responseData);
  } catch (e) {
    console.error("Failed to parse response as JSON", e);
    // If it's not JSON, try to get text
    const text = await res.text();
    console.log("Response as text:", text);
    responseData = { message: text };
  }

  if (!res.ok) {
    throw new Error(`Onboard failed: ${responseData.detail || JSON.stringify(responseData)}`);
  }

  return { success: true, data: responseData };
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
      console.log("Starting onboarding process..."); // Debug logging
      const result = await completeOnboardingProcess(userId, name, country, state);
      console.log("Onboarding process result:", result); // Debug logging
      
      if (result.success) {
        toast({
          title: 'Welcome Aboard!',
          description: "You're all set to start your Vibrafit journey.",
        });
        
        // Add a small delay before closing to ensure API processing completes
        setTimeout(() => {
          console.log("Calling onClose callback..."); // Debug logging
          onClose(); // Call the onClose handler to notify the parent component
        }, 500);
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
            We're excited to have you. Let's set up your profile to begin your fitness journey.
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