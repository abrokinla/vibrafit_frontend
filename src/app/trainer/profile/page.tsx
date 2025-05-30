
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Award, Info, Briefcase } from "lucide-react";
import { CombinedProfileData, fetchCombinedProfile, saveTrainerProfile } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

export default function TrainerProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<CombinedProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [trainer, setTrainer] = useState(null);
  const [hasTrainer, setHasTrainer] = useState(false);
  const [trainerName, setTrainerName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCombinedProfile();
        setProfile(data);
      } catch (err: any) {
        console.error('Error loading profile:', err);
        toast({
          title: 'Error',
          description: err.message || 'Could not load profile data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (!profile) return;
      const { name, value } = e.target;

      setProfile(prev => {
        if (!prev) return prev;
        if (name === 'experience_years') {
          const num = value === '' ? null : Number(value);
          return { ...prev, experience_years: num };
        }

                return { ...prev, [name]: value };
      });
    };

    useEffect(() => {
      const fetchTrainerDetails = async () => {
        if (!user?.trainerId) {
          setHasTrainer(false);
          return;
        }

        setIsLoading(true);
        try {
          const trainerData = await fetchTrainerById(user.trainerId);
          if (!trainerData) throw new Error("Trainer not found");

          setTrainer(trainerData);
          setTrainerName(`${trainerData.name || trainerData.full_name || 'Trainer'}`);
          setHasTrainer(true);
        } catch (err) {
          console.error(err);
          setHasTrainer(false);
          toast({
            title: "Error",
            description: "Could not load trainer details.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchTrainerDetails();
    }, [user?.trainerId]);

    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile) return;

      const yrs = profile.experience_years;
      if (yrs !== null && (isNaN(yrs) || yrs < 0)) {
        toast({
          title: 'Invalid Input',
          description: 'Experience years must be a valid positive number.',
          variant: 'destructive',
        });
        return;
      }

      setIsSaving(true);
      try {
        const toSave = {
          bio:           profile.bio,
          certifications: profile.certifications,
          specializations:    profile.specializations,
          // rating:         profile.rating,
          experience_years: profile.experience_years,
        };

        const result = await saveTrainerProfile(toSave);
        if (result.success) {
          toast({
            title: 'Profile Updated',
            description: 'Your profile information has been saved.',
          });
        } else {
          toast({
            title: 'Update Failed',
            description: 'Could not save your profile.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to save profile', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-muted rounded animate-pulse mb-4"></div>
        <Card className="shadow-md">
          <CardHeader><div className="h-6 w-1/4 bg-muted rounded animate-pulse"></div></CardHeader>
          <CardContent className="space-y-4 pt-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>)}
            <div className="h-20 bg-muted rounded animate-pulse"></div>
            <div className="h-16 bg-muted rounded animate-pulse"></div>
          </CardContent>
          <CardFooter><div className="h-10 w-24 bg-muted rounded animate-pulse"></div></CardFooter>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <p className="text-destructive">Could not load profile data. Please try refreshing the page.</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Trainer Profile</h1>
      <p className="text-muted-foreground">Showcase your expertise and experience to clients.</p>

      <Card className="shadow-lg max-w-3xl border">
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Update your details to keep clients informed.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={isSaving} placeholder="Your full name"/>
                </div>
                <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={profile.email} disabled 
                 className="disabled:opacity-75 disabled:cursor-not-allowed"
                />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="flex items-center gap-2"><Info className="h-4 w-4 text-primary"/>Brief Summary</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio || ""}
                onChange={handleInputChange}
                disabled={isSaving}
                rows={4}
                placeholder="Tell clients about yourself, your training philosophy, etc."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="experienceYears" className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-primary"/>Years of Experience</Label>
                    <Input
                        id="experienceYears"
                        name="experience_years"
                        type="number"
                        value={profile.experience_years ?? ''}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        placeholder="e.g., 5"
                        min="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="certifications" className="flex items-center gap-2"><Award className="h-4 w-4 text-primary"/>Certifications</Label>
                    <Input
                        id="certifications"
                        name="certifications"
                        value={profile.certifications}
                        onChange={handleInputChange}
                        disabled={isSaving}
                        placeholder="e.g., ACE CPT, NASM CES (comma-separated)"
                    />
                </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="specializations">Specializations</Label>
              <Textarea
                id="specializations"
                name="specializations"
                value={profile.specializations}
                onChange={handleInputChange}
                disabled={isSaving}
                rows={3}
                placeholder="e.g., Strength Training, Weight Loss, HIIT (comma-separated or list)"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
