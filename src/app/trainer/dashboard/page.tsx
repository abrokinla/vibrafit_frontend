'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, MessageSquare, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingModal from '@/components/trainer/onboarding-modal';
import { useToast } from "@/hooks/use-toast";
import { getUserData, UserData } from '@/lib/api';

export default function TrainerDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const [trainerData, setTrainerData] = useState({
    clientCount: 0,
    unreadMessages: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoadingUser(true);
      try {
        const data = await getUserData();
        setUser(data);

        if (!data.is_onboarded) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } catch (err: any) {
        if (err.message === 'NO_CREDENTIALS' || err.message === 'UNAUTHORIZED') {
          localStorage.clear();
          router.push('/signin');
          return;
        }
        toast({
          title: 'Error',
          description: 'Could not load your profile.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [router, toast]);

    useEffect(() => {
    if (!user?.id) return;

    fetch(`https://vibrafit.onrender.com/api/users/${user.id}/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Could not load trainer');
        return res.json();
      })
      .then((t: { clientCount: number; unreadMessages: number }) => {
        setTrainerData({
          clientCount: t.clientCount ?? 0,
          unreadMessages: t.unreadMessages ?? 0,
        });
      })
      .catch(console.error);
  }, [user]);


  const handleOnboardingClose = async () => {
    try {
      const updatedUser = await getUserData();
      setUser(updatedUser);
      setShowOnboarding(!updatedUser.is_onboarded);
    } catch (error) {
      toast({
        title: 'Refresh Error',
        description: 'Could not update your dashboard info.',
        variant: 'destructive',
      });
    }
  };

  if (!user) return <Card className="shadow-sm p-4">Loading…</Card>;
  
  return (    
    <div className="space-y-8">
      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          userId={user.id.toString()}
        />
      )}
      <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
      <p className="text-muted-foreground">Oversee your clients and manage their progress.</p>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"> {/* Changed to lg:grid-cols-4 */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.clientCount}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainerData.unreadMessages}</div>
             <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">e.g., Plan reviews, check-ins</p>
          </CardContent>
        </Card>
        {/* New Card for Manage Client Routines */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Routines</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             <p className="text-xs text-muted-foreground mb-2">Create & manage workout plans.</p>
            <Link href="/trainer/routines" passHref>
                <Button size="sm" className="w-full">Manage Routines</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

       {/* Recent Client Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Client Activity</CardTitle>
          <CardDescription>Latest updates from your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           {/* {trainerData.recentActivity.length === 0 ? (
             <p className="text-muted-foreground text-center py-4">No recent client activity.</p>
           ) : (
             <ul className="space-y-4">
                {trainerData.recentActivity.map((activity) => (
                    <li key={activity.id} className="flex items-center justify-between gap-4 border-b pb-3 last:border-0">
                        <div>
                            <p className="text-sm font-medium">{activity.client}: <span className="text-muted-foreground">{activity.action}</span></p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                    </li>
                ))} 
             </ul>
           )}*/}
        </CardContent>
      </Card>

        {/* Placeholder for Client List/Management */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>View and manage your client roster.</CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-muted-foreground text-center py-8">Client list and management tools will appear here.</p>
           {/* In a real app, this would be a table or list of clients with links to their profiles */}
        </CardContent>
      </Card>

    </div>
  );
}
