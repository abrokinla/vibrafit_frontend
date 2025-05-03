import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, MessageSquare } from "lucide-react";

// Placeholder data - replace with actual data fetching
const trainerData = {
  clientCount: 15,
  recentActivity: [
    { id: 1, client: 'Alice', action: 'Completed workout plan', time: '2h ago' },
    { id: 2, client: 'Bob', action: 'Sent a new message', time: '5h ago' },
    { id: 3, client: 'Charlie', action: 'Missed scheduled check-in', time: '1 day ago' },
  ],
  unreadMessages: 3,
};

export default function TrainerDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
      <p className="text-muted-foreground">Oversee your clients and manage their progress.</p>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
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
      </div>

       {/* Recent Client Activity */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Client Activity</CardTitle>
          <CardDescription>Latest updates from your clients.</CardDescription>
        </CardHeader>
        <CardContent>
           {trainerData.recentActivity.length === 0 ? (
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
           )}
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
