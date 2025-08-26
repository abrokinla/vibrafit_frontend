// src/app/[locale]/forgot-password/page.tsx
'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from '@/navigation';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/use-toast';
import { requestPasswordReset } from '@/lib/api';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage');
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSending(true);

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setIsSent(true);
        toast({
          title: t('toastSuccessTitle'),
          description: t('toastSuccessDescription', { email }),
        });
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || t('toastErrorDescription'));
      toast({
        title: t('toastErrorTitle'),
        description: err.message || t('toastErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">{isSent ? t('titleSent') : t('title')}</CardTitle>
          <CardDescription>
            {isSent ? t('descriptionSent', { email }) : t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
             <div className="text-center">
              <p className="text-muted-foreground">{t('didNotReceiveEmail')}</p>
              <Button variant="link" onClick={() => setIsSent(false)} className="px-1">
                {t('tryAgainButton')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSending}
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('sendingButton')}
                  </>
                ) : (
                  t('sendButton')
                )}
              </Button>
            </form>
          )}

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
