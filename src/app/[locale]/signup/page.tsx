// src/app/[locale]/signup/page.tsx
"use client";
export const runtime = 'edge';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useRouter } from '@/navigation'; 
import { useTranslations } from 'next-intl';

export default function SignUpPage() {
  const t = useTranslations('SignUpPage');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'trainer'>('client');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }

    if (!email || !password || !role) {
      setError(t('errorMissingFields'));
      return;
    }

    try {
      const regRes = await fetch('https://vibrafit.onrender.com/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!regRes.ok) {
        const text = await regRes.text();
        throw new Error(t('errorRegisterFailed', { details: text }));
      }
      const user = await regRes.json();
      localStorage.setItem('userId', user.id);

      
      const loginRes = await fetch('https://vibrafit.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(t('errorLoginFailed', { details: err.detail }));
      }
      const { access, refresh } = await loginRes.json();
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('userRole', role); // Save role
  
      if (role === 'trainer') {
        router.push('/trainer/dashboard');
      } else {
        router.push('/user/dashboard');
      }
  
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('errorSignup'));
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
             <div className="space-y-2">
               <Label>{t('roleLabel')}</Label>
                <RadioGroup
                    defaultValue="client" // Corrected default value to match type
                    value={role}
                    onValueChange={(value: 'client' | 'trainer') => setRole(value)}
                    className="flex space-x-4 pt-2"
                 >
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="role-client" />
                    <Label htmlFor="role-client">{t('roleUser')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trainer" id="role-trainer" />
                    <Label htmlFor="role-trainer">{t('roleTrainer')}</Label>
                    </div>
                </RadioGroup>
             </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder={t('passwordPlaceholder')}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirmPasswordLabel')}</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                placeholder={t('passwordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
             {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full">{t('signUpButton')}</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            {t('hasAccountPrompt')}{' '}
            <Link href="/signin" className="text-primary hover:underline">
              {t('signInLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
