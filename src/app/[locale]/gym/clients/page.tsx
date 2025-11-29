// src/app/[locale]/gym/clients/page.tsx
'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, CheckCircle, Clock, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchMyGyms, fetchGymMembers, approveGymMember, GymData, GymMemberData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function GymClientsPage() {
  const t = useTranslations('GymClientsPage');
  const { toast } = useToast();
  const [gyms, setGyms] = useState<GymData[]>([]);
  const [selectedGym, setSelectedGym] = useState<GymData | null>(null);
  const [members, setMembers] = useState<GymMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gymData = await fetchMyGyms();
        setGyms(gymData);
        if (gymData.length > 0) {
          setSelectedGym(gymData[0]);
        }
      } catch (error) {
        console.error('Failed to load gyms:', error);
        toast({
          title: t('errorLoadingGyms'),
          description: t('errorLoadingGymsDesc'),
          variant: 'destructive',
        });
      }
    };

    loadGyms();
  }, [toast, t]);

  useEffect(() => {
    const loadMembers = async () => {
      if (!selectedGym) return;

      setLoading(true);
      try {
        const memberData = await fetchGymMembers(selectedGym.id);
        setMembers(memberData);
      } catch (error) {
        console.error('Failed to load members:', error);
        toast({
          title: t('errorLoadingMembers'),
          description: t('errorLoadingMembersDesc'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [selectedGym, toast, t]);

  const handleApproveMember = async (userId: number) => {
    if (!selectedGym) return;

    setApproving(userId);
    try {
      await approveGymMember(selectedGym.id, userId);
      toast({
        title: t('memberApproved'),
        description: t('memberApprovedDesc'),
      });

      // Update the member status locally
      setMembers(prev => prev.map(member =>
        member.user === userId
          ? { ...member, membership_status: 'active' as const }
          : member
      ));
    } catch (error) {
      console.error('Failed to approve member:', error);
      toast({
        title: t('errorApprovingMember'),
        description: t('errorApprovingMemberDesc'),
        variant: 'destructive',
      });
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('statusActive')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            {t('statusPending')}
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            {t('statusInactive')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  if (gyms.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Users className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noGymsTitle')}</h3>
            <p className="text-muted-foreground mb-4">{t('noGymsDescription')}</p>
            <Link href="/gym/dashboard" className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              {t('backToDashboard')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingMembers = members.filter(m => m.membership_status === 'pending');
  const activeMembers = members.filter(m => m.membership_status === 'active');

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

        {gyms.length > 1 && (
          <select
            value={selectedGym?.id || gyms[0].id}
            onChange={(e) => {
              const gymId = parseInt(e.target.value);
              const gym = gyms.find(g => g.id === gymId);
              setSelectedGym(gym || null);
            }}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Pending Approvals */}
      {pendingMembers.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('pendingApprovals')} ({pendingMembers.length})
            </CardTitle>
            <CardDescription>{t('pendingApprovalsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" alt={member.user_name} />
                      <AvatarFallback>{member.user_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user_name}</p>
                      <p className="text-sm text-muted-foreground">{member.user_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(member.membership_status)}
                    <Button
                      onClick={() => handleApproveMember(member.user)}
                      disabled={approving === member.user}
                      size="sm"
                    >
                      {approving === member.user ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {t('approve')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Members */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('activeMembers')} ({activeMembers.length})
          </CardTitle>
          <CardDescription>{t('activeMembersDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('noActiveMembers')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="" alt={member.user_name} />
                      <AvatarFallback>{member.user_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user_name}</p>
                      <p className="text-sm text-muted-foreground">{member.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('joined')} {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(member.membership_status)}
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
