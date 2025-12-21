'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Mail, X, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  email: string;
  email_verified?: boolean;
  role?: string;
}

interface EmailVerificationBannerProps {
  user?: User | null;
  onVerificationComplete?: () => void;
}

export default function EmailVerificationBanner({
  user,
  onVerificationComplete
}: EmailVerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  // Don't show if user is verified or no user
  if (!user || user.email_verified) {
    return null;
  }

  // Don't show for admin users (they might not need email verification)
  if (user.role === 'admin') {
    return null;
  }

  const handleResendVerification = async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to resend verification email.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/v1/users/send-verification-email/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: data.detail || "Check your email for the verification link.",
        });
      } else {
        toast({
          title: "Error",
          description: data.detail || "Failed to send verification email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <span className="font-medium">Verify your email address</span>
          <span className="ml-2 text-sm">
            Please check your email and click the verification link to activate your account.
          </span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={isLoading}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <Mail className="h-3 w-3 mr-1" />
            {isLoading ? 'Sending...' : 'Resend Email'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
