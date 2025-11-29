// src/app/[locale]/gym/settings/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, ArrowLeft, Plus, Loader2, Building } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchMyGyms, createGym, updateGym, GymData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function GymSettingsPage() {
  const t = useTranslations('GymSettingsPage');
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    max_members: 50,
  });

  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymData = await fetchMyGyms();
        setGyms(gymData);
      } catch (error) {
        console.error('Failed to load gyms:', error);
        toast({
          title: t('errorLoadingGyms'),
          description: t('errorLoadingGymsDesc'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadGyms();
  }, [toast, t]);

  const handleCreateGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const newGym = await createGym(formData);
      setGyms(prev => [...prev, newGym]);
      setFormData({
        name: '',
        description: '',
        website: '',
        phone: '',
        address: '',
        max_members: 50,
      });
      setShowCreateForm(false);
      toast({
        title: t('gymCreated'),
        description: t('gymCreatedDesc'),
      });
    } catch (error) {
      console.error('Failed to create gym:', error);
      toast({
        title: t('errorCreatingGym'),
        description: t('errorCreatingGymDesc'),
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/gym/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        <Button onClick={() => setShowCreateForm(!showCreateForm)} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          {t('createGym')}
        </Button>
      </div>

      {/* Create Gym Form */}
      {showCreateForm && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t('createNewGym')}</CardTitle>
            <CardDescription>{t('createNewGymDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGym} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('gymName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('gymNamePlaceholder')}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">{t('website')}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder={t('websitePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_members">{t('maxMembers')}</Label>
                  <Input
                    id="max_members"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_members}
                    onChange={(e) => handleInputChange('max_members', parseInt(e.target.value) || 50)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t('addressPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {t('createGym')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  {t('cancel')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Existing Gyms */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {t('yourGyms')} ({gyms.length})
          </CardTitle>
          <CardDescription>{t('yourGymsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : gyms.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noGyms')}</h3>
              <p className="text-muted-foreground mb-4">{t('noGymsDesc')}</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('createYourFirstGym')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {gyms.map((gym) => (
                <div key={gym.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{gym.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{gym.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">{t('members')}:</span> {gym.member_count}/{gym.max_members}
                        </div>
                        <div>
                          <span className="font-medium">{t('status')}:</span> {gym.subscription_status}
                        </div>
                        {gym.website && (
                          <div>
                            <span className="font-medium">{t('website')}:</span>{' '}
                            <a href={gym.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {t('visit')}
                            </a>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">{t('created')}:</span> {new Date(gym.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
