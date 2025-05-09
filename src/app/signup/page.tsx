// src/app/signup/page.tsx
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'client' | 'trainer'>('client');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Basic validation
    if (!email || !password || !role) {
      setError('Please fill in all fields and select a role.');
      return;
    }

    try {
      const response = await fetch('https://vibrafit.onrender.com/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.text(); 
        throw new Error(`HTTP ${response.status} - ${errorData}`);
      }

      const data = await response.json(); 
      console.log('Signup successful:', data);
    
      // Redirect based on role after successful sign up
      if (role === 'trainer') {
        router.push('/trainer/dashboard');
      } else if (role === 'client') {
        router.push('/user/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('An error occurred during signup.');
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Your Vibrafit Account</CardTitle>
          <CardDescription>Join us to start tracking your fitness journey!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Role Selection */}
             <div className="space-y-2">
               <Label>Sign up as a:</Label>
                <RadioGroup
                    defaultValue="client"
                    value={role}
                    onValueChange={(value: 'client' | 'trainer') => setRole(value)}
                    className="flex space-x-4 pt-2"
                 >
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="client" id="role-client" />
                    <Label htmlFor="role-user">User</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trainer" id="role-trainer" />
                    <Label htmlFor="role-trainer">Trainer</Label>
                    </div>
                </RadioGroup>
             </div>

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
                minLength={6} // Add basic password length requirement
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
             {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/signin" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
