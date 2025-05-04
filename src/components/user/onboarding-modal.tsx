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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void; // Function to call when onboarding is completed/closed
  userId: string; // To associate the goal with the user
}

// Simulate saving data (replace with actual API call)
async function saveUserGoal(userId: string, goal: string): Promise<{ success: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 700));
  console.log(`Saving goal for user ${userId}:`, goal);
  // In a real app, send data to your backend/database
  // Mark user as onboarded in the database here
  return { success: true };
}

export default function OnboardingModal({ isOpen, onClose, userId }: OnboardingModalProps) {
  const [goal, setGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast({
        title: 'Goal Required',
        description: 'Please enter your fitness goal.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveUserGoal(userId, goal);
      if (result.success) {
        toast({
          title: 'Goal Set!',
          description: 'Your fitness goal has been saved.',
        });
        onClose(); // Close the modal on success
      } else {
        toast({
          title: 'Save Failed',
          description: 'Could not save your goal. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save goal:', error);
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
       {/* Use DialogContent without overlay interaction handlers */}
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={handleInteractOutside} // Prevent closing on outside click
        onEscapeKeyDown={handleEscapeKeyDown} // Prevent closing with Esc key
        hideCloseButton={true} // Hide the default 'X' close button
      >
        <DialogHeader>
          <DialogTitle>Welcome to Vibrafit!</DialogTitle>
          <DialogDescription>
            Let's start by setting your primary fitness goal. What do you want to achieve?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right col-span-1">
                Goal
              </Label>
              <Textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Lose 5kg, run a 10k, build muscle..."
                className="col-span-3"
                rows={3}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
              {/* Removed DialogClose wrapper, button type submit handles closing via form onSubmit->onClose */}
              <Button type="submit" disabled={isSaving || !goal.trim()}>
                 {isSaving ? 'Saving...' : 'Set Goal & Continue'}
              </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Note: The declaration merging for DialogContentProps with hideCloseButton
// should ideally be done in the `src/components/ui/dialog.tsx` file itself
// to make the prop available globally for that component.
// For now, it's assumed the change was made there as per the previous undo request.
// If not, it should be added there:
/*
// In src/components/ui/dialog.tsx

// ... other imports
import { X } from "lucide-react" // Make sure X is imported

// Extend props to include optional hideCloseButton
interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  hideCloseButton?: boolean;
}


const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps // Use the extended props interface
>(({ className, children, hideCloseButton, ...props }, ref) => ( // Destructure hideCloseButton
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // ... existing styles
      )}
      {...props}
    >
      {children}
      {/* Conditionally render the close button * /
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
// ... rest of the file
*/