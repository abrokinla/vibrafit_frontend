// src/components/trainer/client-details-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Scale, Target, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { fetchClientDetailsForTrainer, ClientDetailsForTrainer } from '@/lib/api';

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: number;
}

export default function ClientDetailsModal({ isOpen, onClose, clientId }: ClientDetailsModalProps) {
  const t = useTranslations('ClientDetailsModal');
  const [details, setDetails] = useState<ClientDetailsForTrainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && clientId) {
      setIsLoading(true);
      fetchClientDetailsForTrainer(clientId)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, clientId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !details ? (
          <p className="text-destructive text-center py-8">{t('errorLoading')}</p>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={details.profilePictureUrl || ''} alt={details.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{details.name}</h3>
                  <p className="text-sm text-muted-foreground">{details.email}</p>
                </div>
              </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>{t('goalTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {details.goal ? (
                        <div className="space-y-1">
                            <p className="text-lg font-semibold">"{details.goal.description}"</p>
                            <p className="text-sm text-muted-foreground"><span className="font-medium">{t('targetValueLabel')}:</span> {details.goal.target_value}</p>
                            <p className="text-sm text-muted-foreground"><span className="font-medium">{t('targetDateLabel')}:</span> {new Date(details.goal.target_date).toLocaleDateString()}</p>
                        </div>
                    ) : <p className="text-muted-foreground">{t('noGoalSet')}</p>}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5 text-primary"/>{t('metricsTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <p><span className="font-medium">{t('weightLabel')}:</span> {details.metrics?.weight ?? t('notAvailable')} kg</p>
                    <p><span className="font-medium">{t('heightLabel')}:</span> {details.metrics?.height ?? t('notAvailable')} cm</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader><CardTitle>{t('beforePhotoTitle')}</CardTitle></CardHeader>
                    <CardContent>
                         <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative">
                            <Image
                                src={details.beforePhotoUrl || "https://placehold.co/400x400.png"}
                                alt={t('beforePhotoAlt')}
                                fill
                                style={{objectFit:"cover"}}
                                data-ai-hint="fitness before"
                                unoptimized
                            />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>{t('currentPhotoTitle')}</CardTitle></CardHeader>
                    <CardContent>
                        <div className="aspect-square w-full bg-muted rounded-md overflow-hidden relative">
                             <Image
                                src={details.currentPhotoUrl || "https://placehold.co/400x400.png"}
                                alt={t('currentPhotoAlt')}
                                fill
                                style={{objectFit:"cover"}}
                                data-ai-hint="fitness after"
                                unoptimized
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
