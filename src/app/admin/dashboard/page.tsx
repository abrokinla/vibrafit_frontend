import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, BarChart, Settings } from "lucide-react";

// Placeholder data - replace with actual data fetching from backend API
const adminData = {
  totalUsers: 1250,
  totalTrainers: 45,
  activeSubscriptions: 980,
  monthlyRevenue: 14700, // Example revenue
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Manage users, trainers, and application settings.</p>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+50 since last week</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalTrainers}</div>
             <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.activeSubscriptions.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">~{((adminData.activeSubscriptions / adminData.totalUsers) * 100).toFixed(0)}% conversion</p>
          </CardContent>
        </Card>
         <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue (Est.)</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" /> {/* Using Settings as a placeholder */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${adminData.monthlyRevenue.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground">Based on active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Sections for Management Tools */}
       <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, search, and manage user accounts.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">User management tools will appear here.</p>
               {/* Table or list for user management */}
            </CardContent>
          </Card>

           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Trainer Management</CardTitle>
              <CardDescription>Approve, manage, and view trainer profiles.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">Trainer management tools will appear here.</p>
               {/* Table or list for trainer management */}
            </CardContent>
          </Card>
       </div>

       <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
               <CardDescription>Configure application-wide settings.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-muted-foreground text-center py-8">System configuration options will appear here.</p>
               {/* Form elements for settings */}
            </CardContent>
          </Card>

    </div>
  );
}
