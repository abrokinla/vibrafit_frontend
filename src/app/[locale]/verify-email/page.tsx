'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('invalid');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const response = await fetch('/api/v1/users/verify-email/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.detail || 'Email verified successfully!');

          // Redirect to appropriate dashboard after 3 seconds
          setTimeout(() => {
            setIsRedirecting(true);
            // Check user role from localStorage to redirect to correct dashboard
            const userRole = localStorage.getItem('userRole');
            let redirectPath = '/user/dashboard';

            if (userRole === 'admin') {
              redirectPath = '/admin/dashboard';
            } else if (userRole === 'trainer') {
              redirectPath = '/trainer/dashboard';
            } else if (userRole === 'gym') {
              redirectPath = '/gym/dashboard';
            }

            router.push(redirectPath);
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.detail || 'Email verification failed.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'error':
      case 'invalid':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'invalid':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCardTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying Your Email';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      case 'invalid':
        return 'Invalid Link';
      default:
        return 'Email Verification';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className={`text-2xl ${getStatusColor()}`}>
            {getCardTitle()}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your email has been successfully verified.'}
            {(status === 'error' || status === 'invalid') && 'There was a problem verifying your email.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {message}
          </p>

          {status === 'success' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {isRedirecting ? 'Redirecting you to your dashboard...' : 'You will be redirected to your dashboard in a few seconds.'}
              </p>
              {!isRedirecting && (
                <Button asChild className="w-full">
                  <Link href="/user/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              )}
            </div>
          )}

          {(status === 'error' || status === 'invalid') && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {status === 'invalid'
                  ? 'This verification link may be invalid or expired.'
                  : 'Please try again or contact support if the problem persists.'
                }
              </p>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signin">
                    Back to Sign In
                  </Link>
                </Button>
                <Button asChild variant="default" className="w-full">
                  <Link href="/user/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                This may take a few seconds...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
