"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      // Login
      const response = await fetch('https://vibrafit.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed.');
        return;
      }
  
      const { access, refresh } = await response.json();
  
      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
  
      // Fetch user info with token to get ID and other fields
      const userProfileRes = await fetch('https://vibrafit.onrender.com/api/users/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access}`,
        },
      });
  
      if (!userProfileRes.ok) {
        const errorText = await userProfileRes.text();
        throw new Error(`Failed to fetch user profile: ${errorText}`);
      }
  
      const allUsers = await userProfileRes.json();
      const loggedInUser = allUsers.find((u: any) => u.email === email);
  
      if (!loggedInUser) {
        throw new Error('User not found after login.');
      }
  
      const { id, role, is_onboarded } = loggedInUser;
  
      // Store user details in localStorage
      localStorage.setItem('userId', id);
      localStorage.setItem('userRole', role);
      localStorage.setItem('isOnboarded', JSON.stringify(is_onboarded));
  
      // Redirect based on role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'trainer') {
        router.push('/trainer/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signin error:', err.message || err);
    }
  };
  

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In to Vibrafit</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
