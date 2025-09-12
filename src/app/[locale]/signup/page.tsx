
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
import { Building, User, Dumbbell, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vibrafit.onrender.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}
export default function SignUpPage() {
  const t = useTranslations('SignUpPage');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'trainer' | 'gym'>('client');
  const [gymName, setGymName] = useState('');
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

    if (role === 'gym' && !gymName.trim()) {
      setError(t('errorGymNameRequired'));
      return;
    }

    try {
      const registrationPayload: any = { email, password, role };
      if (role === 'gym') {
        registrationPayload.gym_name = gymName;
      }

      const regRes = await fetch(apiUrl('/users/register/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload),
      });

      if (!regRes.ok) {
        const errorData = await regRes.json();
        const errorMessage = errorData.email?.[0] || errorData.detail || t('errorRegisterFailed', { details: JSON.stringify(errorData) });
        throw new Error(errorMessage);
      }
      const user = await regRes.json();
      localStorage.setItem('userId', user.id);

      const loginRes = await fetch(apiUrl('/auth/login/'), {
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
      localStorage.setItem('userRole', role);
  
      if (role === 'trainer') {
        router.push('/trainer/dashboard');
      } else if (role === 'gym') {
        router.push('/gym/dashboard');
      } else {
        router.push('/user/dashboard');
      }
  
    } catch (err: any) {
      console.error(err);
      setError(err.message || t('errorSignup'));
    }
  };
  
  const RoleCard = ({ value, label, icon, currentRole }: { value: 'client' | 'trainer' | 'gym', label: string, icon: React.ReactNode, currentRole: string }) => {
    const isSelected = value === currentRole;
    return (
      <Label
        htmlFor={`role-${value}`}
        className={cn(
          "flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200",
          isSelected ? "bg-primary/10 border-primary shadow-md" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        {icon}
        <span className="font-semibold mt-2 text-sm">{label}</span>
        <RadioGroupItem value={value} id={`role-${value}`} className="sr-only" />
        {isSelected && <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-primary" />}
      </Label>
    );
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-6">
             <div className="space-y-3">
               <Label>{t('roleLabel')}</Label>
                <RadioGroup
                    value={role}
                    onValueChange={(value: 'client' | 'trainer' | 'gym') => setRole(value)}
                    className="grid grid-cols-3 gap-4"
                 >
                   <RoleCard value="client" label={t('roleUser')} icon={<User className="h-8 w-8 text-primary"/>} currentRole={role} />
                   <RoleCard value="trainer" label={t('roleTrainer')} icon={<Dumbbell className="h-8 w-8 text-primary"/>} currentRole={role} />
                   <RoleCard value="gym" label={t('roleGym')} icon={<Building className="h-8 w-8 text-primary"/>} currentRole={role} />
                </RadioGroup>
             </div>
            
            {role === 'gym' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <Label htmlFor="gymName">{t('gymNameLabel')}</Label>
                <Input
                  id="gymName"
                  type="text"
                  placeholder={t('gymNamePlaceholder')}
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
            )}

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
        <CardFooter className="text-center text-sm flex justify-center">
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
