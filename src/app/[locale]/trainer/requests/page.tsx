// src/app/[locale]/trainer/requests/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Check, X, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from 'next-intl';
import {
  fetchPendingSubscriptions,
  respondToSubscriptionRequest,
  SubscriptionRequest
} from '@/lib/api';
import ClientDetailsModal from '@/components/trainer/client-details-modal';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

export default function PendingRequestsPage() {
  const t = useTranslations('PendingRequestsPage');
  const { toast } = useToast();
  const locale = useLocale();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Get the appropriate date-fns locale based on current locale
  const getDateLocale = () => {
    switch (locale) {
      case 'es':
        return es;
      case 'en':
      default:
        return enUS;
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPendingSubscriptions()
      .then(setRequests)
      .catch(() =>
        toast({
          title: t('toastErrorTitle'),
          description: t('toastErrorFetch'),
          variant: "destructive"
        })
      )
      .finally(() => setIsLoading(false));
  }, [toast, t]);

  const handleResponse = async (
    subscriptionId: number,
    clientId: number,
    status: 'active' | 'declined'
  ) => {
    setIsResponding(subscriptionId);
    
    try {
      const result = await respondToSubscriptionRequest(subscriptionId, status);
      
      if (result.success) {
        setRequests(prev => prev.filter(req => req.id !== subscriptionId));
        toast({
          title: t('toastSuccessTitle'),
          description: t('toastSuccessDescription', {
            clientName: requests.find(r => r.id === subscriptionId)?.client.name || 'Client',
            status
          }),
        });
      } else {
        // Show the actual error from the backend
        console.error('Backend error:', result.error);
        throw new Error(result.error?.error || result.error?.detail || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Full error:', error);
      toast({
        title: t('toastErrorTitle'),
        description: error.message || t('toastErrorUpdate'),
        variant: "destructive"
      });
    } finally {
      setIsResponding(null);
    }
  };

  const openClientDetails = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {selectedClientId && (
        <ClientDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          clientId={selectedClientId}
        />
      )}

      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </div>
              </CardHeader>
              <CardFooter className="gap-2">
                <div className="h-10 w-full bg-muted rounded"></div>
                <div className="h-10 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card shadow-sm">
          <h2 className="text-xl font-semibold">{t('noPendingTitle')}</h2>
          <p className="text-muted-foreground mt-2">{t('noPendingDescription')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <Card key={req.id} className="shadow-md flex flex-col justify-between">
              <CardHeader className="flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={req.client.profilePictureUrl || ''} alt={req.client.name} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{req.client.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {t('requestedTime', {
                      time: formatDistanceToNow(new Date(req.requested_at), { addSuffix: true, locale: getDateLocale() })
                    })}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button variant="outline" className="w-full" onClick={() => openClientDetails(req.client.id)}>
                  {t('viewDetailsButton')}
                </Button>
              </CardContent>

              <CardFooter className="gap-2">
                <Button
                  className="w-full bg-destructive hover:bg-destructive/90"
                  onClick={() => handleResponse(req.id, req.client.id, 'declined')}
                  disabled={isResponding === req.id}
                >
                  <>
                    {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    <span className="ml-2">{t('rejectButton')}</span>
                  </>
                </Button>

                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleResponse(req.id, req.client.id, 'active')}
                  disabled={isResponding === req.id}
                >
                  <>
                    {isResponding === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span className="ml-2">{t('approveButton')}</span>
                  </>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
