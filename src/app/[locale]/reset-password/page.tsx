'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from '@/navigation';
import { Loader2, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { validatePasswordResetToken, confirmPasswordReset } from '@/lib/api';

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('No reset token provided');
      return;
    }

    const validateToken = async () => {
      try {
        const result = await validatePasswordResetToken(token);
        setIsTokenValid(result.valid);
        if (result.email) {
          setEmail(result.email);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setError('Invalid or expired reset token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsResetting(true);

    try {
      const result = await confirmPasswordReset(token, password);
      if (result.success) {
        setIsSuccess(true);
        toast({
          title: t('toastSuccessTitle'),
          description: t('toastSuccessDescription'),
        });

        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/signin');
        }, 3000);
      } else {
        setError(result.message);
        toast({
          title: t('toastErrorTitle'),
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
      toast({
        title: t('toastErrorTitle'),
        description: err.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
            <p>Validating reset token...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 text-red-500 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <CardTitle className="text-xl text-red-600">{t('invalidTokenTitle')}</CardTitle>
            <CardDescription>
              {error || t('invalidTokenDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              {t('requestNewLink')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <CardTitle className="text-xl text-green-600">{t('successTitle')}</CardTitle>
            <CardDescription>
              {t('successDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('redirectMessage')}
            </p>
            <Link href="/signin">
              <Button>{t('goToSignIn')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Lock className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('passwordPlaceholder')}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isResetting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isResetting}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('resettingButton')}
                </>
              ) : (
                t('resetButton')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/signin" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              {t('backToSignInLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
