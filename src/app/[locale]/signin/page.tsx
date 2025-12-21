
// src/app/[locale]/signin/page.tsx
"use client";
export const runtime = 'edge';



import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from '@/navigation';
import { Loader2, Dumbbell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from "next/image";
import { Separator } from '@/components/ui/separator';
import { tokenManager } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION;
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}
// Placeholder icons for social logins
const GoogleIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.57L19.05,4.5C17.15,2.73 14.83,1.7 12.19,1.7C6.42,1.7 2.03,6.8 2.03,12C2.03,17.05 6.16,22.27 12.19,22.27C17.6,22.27 21.95,18.53 21.95,12.33C21.95,11.9 21.35,11.1 21.35,11.1V11.1Z" /></svg>;
const XIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
const LinkedInIcon = () => <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4s1.4.63 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69.75 1.68 1.68 0 0 0 0 1.88c.47.44 1.05.75 1.69.75m-1.39 1.39h2.79v8.37H5.49v-8.37Z"/></svg>;


export default function SignInPage() {
  const t = useTranslations('SignInPage');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isClient) return;

    setError('');
    setIsSigningIn(true);

    try {
  const response = await fetch(apiUrl('/users/auth/login/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || t('errorLoginFailed'));
        setIsSigningIn(false);
        return;
      }
  
      const { access } = await response.json();

      // Store access token in memory (refresh token is now in httpOnly cookie)
      tokenManager.setTokens(access);

      const userProfileRes = await fetch(apiUrl('/users/profile/'), {
        headers: { Authorization: `Bearer ${access}` },
      });

      if (!userProfileRes.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const loggedInUser = await userProfileRes.json();
  
      const { id, role, is_onboarded } = loggedInUser;
      
      localStorage.setItem('userId', id);
      localStorage.setItem('userRole', role);
      localStorage.setItem('isOnboarded', is_onboarded.toString());
  
      let targetPath: string;
      if (role === 'admin') {
        targetPath = '/admin/dashboard';
      } else if (role === 'trainer') {
        targetPath = '/trainer/dashboard';
      } else if (role === 'gym') {
        targetPath = '/gym/dashboard';
      } else {
        targetPath = '/user/dashboard';
      }
      
      router.push(targetPath as any);

    } catch (err: any) {
      setError(t('errorUnexpected'));
      console.error('Signin error:', err.message || err);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
        <Card className="w-full max-w-4xl shadow-2xl">
          <div className="p-8 md:p-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="w-full max-w-4xl shadow-2xl overflow-hidden grid md:grid-cols-2">
        <div className="relative hidden md:block">
          <Image
            src="https://placehold.co/800x1200.png"
            alt={t('imageAlt')}
            width={800}
            height={1200}
            className="object-cover w-full h-full"
            data-ai-hint="fitness gym workout"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-8 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-white mb-2">{t('welcomeTitle')}</h2>
            <p className="text-white/90">{t('welcomeSubtitle')}</p>
          </div>
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8 md:hidden">
            <Dumbbell className="h-8 w-8 mx-auto text-primary mb-2" />
            <h1 className="text-2xl font-bold">Vibrafit</h1>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{t('title')}</h2>
          <p className="text-muted-foreground text-center mb-6">{t('description')}</p>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <div className="space-y-2">
               <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  {t('forgotPasswordLink')}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('signingInButton')}
                </>
              ) : (
                t('signInButton')
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline"><GoogleIcon /> <span className="sr-only">Google</span></Button>
            <Button variant="outline"><XIcon /> <span className="sr-only">X</span></Button>
            <Button variant="outline"><LinkedInIcon /> <span className="sr-only">LinkedIn</span></Button>
          </div>


          <p className="text-center text-sm mt-6">
            {t('noAccountPrompt')}{' '}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              {t('signUpLink')}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
