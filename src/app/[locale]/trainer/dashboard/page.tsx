'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, MessageSquare, ClipboardList, BellRing, Mail, MailOpen } from "lucide-react";
import { Link, useRouter } from '@/navigation';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import OnboardingModal from '@/components/trainer/onboarding-modal';
import TrainerRecentActivityFeed from '@/components/trainer/TrainerRecentActivityFeed';
import { useToast } from "@/hooks/use-toast";
import { getUserData, UserData, fetchPendingSubscriptions, fetchConversations, fetchActiveClientCount } from '@/lib/api';
import { useTranslations } from 'next-intl';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vibrafit.onrender.com';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
function apiUrl(path: string) {
  return `${API_BASE_URL}/api/${API_VERSION}${path.startsWith('/') ? path : '/' + path}`;
}

interface ConversationData {
  id: string;
  user: {
    id: string;
    name: string;
    profile_picture_url?: string;
  };
  last_message: string;
  timestamp: string;
  unread_count: number;
}

interface ConversationsResponse {
  conversations: ConversationData[];
  totalUnread: number;
  conversationsWithUnread: ConversationData[];
}

interface TrainerData {
  clientCount: number;
  unreadMessages: number;
  pendingActions: number;
  conversationsWithUnread: ConversationData[];
}

// Updated API function specifically for trainer unread messages
async function getTrainerUnreadMessageCount(): Promise<number> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) throw new Error('NO_CREDENTIALS');
    
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    
  const res = await fetch(apiUrl('/messages/unread_count/'), { headers });
    if (!res.ok) {
      console.error('Failed to fetch unread count:', await res.text());
      return 0;
    }
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    return 0;
  }
}

// Get detailed conversation data with unread counts
async function getConversationsWithUnreadCounts(): Promise<ConversationsResponse> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) throw new Error('NO_CREDENTIALS');
    
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    
  const res = await fetch(apiUrl('/messages/conversations/'), { headers });
    if (!res.ok) {
      console.error('Failed to fetch conversations:', await res.text());
      // Return consistent structure even on error
      return {
        conversations: [],
        totalUnread: 0,
        conversationsWithUnread: []
      };
    }
    
    const conversations: ConversationData[] = await res.json();
    const totalUnread = conversations.reduce((sum: number, conv: ConversationData) => {
      return sum + (conv.unread_count || 0);
    }, 0);
    
    // Filter and deduplicate conversations with unread messages by user id
    const conversationsWithUnread = Object.values(
      conversations.filter((conv: ConversationData) => conv.unread_count > 0)
        .reduce((acc: Record<string, ConversationData>, conv: ConversationData) => {
          acc[conv.user.id] = conv;
          return acc;
        }, {})
    );

    return {
      conversations,
      totalUnread,
      conversationsWithUnread
    };
  } catch (error) {
    console.error('Error fetching conversations:', error);
    // Always return consistent structure
    return {
      conversations: [],
      totalUnread: 0,
      conversationsWithUnread: []
    };
  }
}

export default function TrainerDashboardPage() {
  const t = useTranslations('TrainerDashboardPage');
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const [trainerData, setTrainerData] = useState<TrainerData>({
    clientCount: 0,
    unreadMessages: 0,
    pendingActions: 0,
    conversationsWithUnread: [],
  });
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Ensure client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return; // Only run after client-side hydration

    const loadData = async () => {
      setIsLoadingUser(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/signin');
        return;
      }

      try {
        const userData = await getUserData();
        setUser(userData);
        if (!userData.is_onboarded) setShowOnboarding(true);

        // Fetch stats individually to handle partial failures
        let clientCount = 0;
        let unreadMessages = 0;
        let pendingActions = 0;
        let conversationsWithUnread: any[] = [];

        try {
          clientCount = await fetchActiveClientCount();
        } catch (err: any) {
          console.error('Error fetching client count:', err);
          toast({
            title: t('errorLoadStats'),
            description: t('errorLoadClientCount'),
            variant: 'destructive',
          });
        }

        try {
          const messageData = await getConversationsWithUnreadCounts();
          unreadMessages = messageData.totalUnread;
          conversationsWithUnread = messageData.conversationsWithUnread;
        } catch (err: any) {
          console.error('Error fetching message data:', err);
          toast({
            title: t('errorLoadStats'),
            description: t('errorLoadMessages'),
            variant: 'destructive',
          });
        }

        try {
          const pendingSubs = await fetchPendingSubscriptions();
          pendingActions = pendingSubs.length;
        } catch (err: any) {
          console.error('Error fetching pending subscriptions:', err);
          toast({
            title: t('errorLoadStats'),
            description: t('errorLoadPendingActions'),
            variant: 'destructive',
          });
        }

        setTrainerData({
          clientCount,
          unreadMessages,
          pendingActions,
          conversationsWithUnread,
        });
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({ 
          title: t('errorLoadProfile'), 
          description: err.message || t('errorLoadProfileDescription'), 
          variant: 'destructive' 
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadData();
  }, [mounted, router, toast, t]);

  // Show loading during hydration
  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/2 bg-muted rounded"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
        <div className="h-64 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }
  

  const handleOnboardingClose = async () => {
    try {
      const updatedUser = await getUserData();
      setUser(updatedUser);
      setShowOnboarding(!updatedUser.is_onboarded);
    } catch (error) {
      toast({ 
        title: t('refreshErrorToastTitle'), 
        description: t('refreshErrorToastDescription'), 
        variant: 'destructive' 
      });
    }
  };

  const handleMessagesClick = () => {
    router.push('/trainer/messages');
  };

  if (isLoadingUser || !user) return <Card className="shadow-sm p-4">{t('loadingUser')}</Card>;

  return (
    <div className="space-y-8">
      {showOnboarding && (
        <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingClose} userId={user.id.toString()} />
      )}
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-muted-foreground">{t('description')}</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('activeClients')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.clientCount}</div>
            <p className="text-xs text-muted-foreground">{t('clientsFromLastMonth', { count: 0 })}</p>
          </CardContent>
        </Card>

        {/* Enhanced Unread Messages Card */}
        <Card className={`shadow-sm transition-all duration-200 ${trainerData.unreadMessages > 0 ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {t('unreadMessages')}
              {isLoadingMessages && (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              )}
            </CardTitle>
            {trainerData.unreadMessages > 0 ? (
              <Mail className="h-4 w-4 text-blue-600" />
            ) : (
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {trainerData.unreadMessages}
              {trainerData.unreadMessages > 0 && (
                <span className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </div>
            <div className="mt-2 space-y-1">
              {trainerData.unreadMessages > 0 ? (
                <>
                  <p className="text-xs text-blue-600 font-medium">
                    {trainerData.conversationsWithUnread.length} conversation(s) need attention
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={handleMessagesClick}
                  >
                    View Messages
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">All caught up!</p>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="w-full text-xs"
                    onClick={handleMessagesClick}
                  >
                    View Messages
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('pendingActions')}</CardTitle>
            <BellRing className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.pendingActions}</div>
            <Link href="/trainer/requests" className="text-xs text-primary hover:underline">
              {t('reviewRequestsLink')}
            </Link>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('clientRoutines')}</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">{t('manageRoutinesDescription')}</p>
            <Link href="/trainer/routines" passHref>
              <Button size="sm" className="w-full">{t('manageRoutinesButton')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Unread Messages */}
      {trainerData.unreadMessages > 0 && trainerData.conversationsWithUnread.length > 0 && (
        <Card className="shadow-sm border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Recent Unread Messages</CardTitle>
            <CardDescription className="text-blue-600">
              Quick access to conversations that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainerData.conversationsWithUnread.slice(0, 3).map((conversation: any) => (
                <div key={conversation.id || conversation.user?.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {conversation.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{conversation.user?.name || 'Unknown User'}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-48">
                        {conversation.last_message || 'No recent message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {conversation.unread_count}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => router.push({
                        pathname: '/trainer/messages',
                        query: { user: conversation.user?.id }
                      })}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
              {trainerData.conversationsWithUnread.length > 3 && (
                <Button 
                  variant="link" 
                  className="w-full text-blue-600"
                  onClick={handleMessagesClick}
                >
                  View all {trainerData.conversationsWithUnread.length} conversations with unread messages
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('recentClientActivityTitle')}</CardTitle>
          <CardDescription>{t('recentClientActivityDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TrainerRecentActivityFeed limit={5} />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{t('clientManagementTitle')}</CardTitle>
          <CardDescription>{t('clientManagementDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">{t('clientManagementPlaceholder')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 