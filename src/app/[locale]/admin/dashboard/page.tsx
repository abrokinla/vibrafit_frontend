'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, BarChart3, TrendingUp, Activity, Target, MessageSquare, Eye, Download } from "lucide-react";
import Link from 'next/link';

const adminData = {
  totalUsers: 1250,
  totalTrainers: 45,
  activeClients: 890,
  activeSubscriptions: 980,
  totalGyms: 12,
  monthlyRevenue: 14700,
  userGrowth: '+12%',
  trainerEngagement: '87%',
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's your platform overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">Generate Analytics</Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={adminData.totalUsers.toLocaleString()}
          change={adminData.userGrowth}
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Total Trainers"
          value={adminData.totalTrainers}
          change="+3 this month"
          icon={UserCheck}
          trend="up"
        />
        <StatCard
          title="Active Clients"
          value={adminData.activeClients}
          change={adminData.trainerEngagement}
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${adminData.monthlyRevenue.toLocaleString()}`}
          change="+$2,500 from last month"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Subscriptions"
          value={adminData.activeSubscriptions}
          change={`${((adminData.activeSubscriptions / adminData.totalUsers) * 100).toFixed(1)}% conversion`}
          icon={BarChart3}
        />
        <StatCard
          title="Partner Gyms"
          value={adminData.totalGyms}
          change="3 trial, 9 active"
          icon={Target}
        />
        <StatCard
          title="Platform Views"
          value="45.2k"
          change="+18% last week"
          icon={Eye}
        />
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>Control and manage all user accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="View All Users"
              description="Browse and filter all users"
              href="/admin/users"
            />
            <ManagementOption
              label="User Roles & Permissions"
              description="Manage user roles and access levels"
              href="/admin/users?tab=roles"
            />
            <ManagementOption
              label="User Activity"
              description="Monitor user engagement and activity"
              href="/admin/logs"
            />
            <ManagementOption
              label="Banned/Inactive Users"
              description="View and manage inactive accounts"
              href="/admin/users?status=inactive"
            />
          </CardContent>
        </Card>

        {/* Trainer Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Trainer Management
            </CardTitle>
            <CardDescription>Oversee trainers and their clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="All Trainers"
              description="Browse all registered trainers"
              href="/admin/trainers"
            />
            <ManagementOption
              label="Trainer Performance"
              description="View trainer ratings and reviews"
              href="/admin/trainers/performance"
            />
            <ManagementOption
              label="Client-Trainer Subscriptions"
              description="Manage subscription requests"
              href="/admin/subscriptions"
            />
            <ManagementOption
              label="Verify Certifications"
              description="Review trainer credentials"
              href="/admin/trainers/certifications"
            />
          </CardContent>
        </Card>

        {/* Content Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Content Management
            </CardTitle>
            <CardDescription>Control training and nutrition content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="Training Plans"
              description="View and manage all training plans"
              href="/admin/plans"
            />
            <ManagementOption
              label="Nutrition Plans"
              description="Manage nutrition plans and meals"
              href="/admin/nutrition"
            />
            <ManagementOption
              label="User Goals"
              description="Monitor and manage user fitness goals"
              href="/admin/goals"
            />
            <ManagementOption
              label="User Metrics"
              description="Track user health metrics data"
              href="/admin/metrics"
            />
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Communication
            </CardTitle>
            <CardDescription>Monitor messages and conversations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="Messages"
              description="View all user messages"
              href="/admin/messages"
            />
            <ManagementOption
              label="Conversations"
              description="Monitor active conversations"
              href="/admin/conversations"
            />
            <ManagementOption
              label="Timeline Posts"
              description="Manage user posts and engagement"
              href="/admin/posts"
            />
            <ManagementOption
              label="Support Tickets"
              description="Handle user support requests"
              href="/admin/support"
            />
          </CardContent>
        </Card>

        {/* Gym Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Gym Management
            </CardTitle>
            <CardDescription>Manage partner gyms and memberships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="All Gyms"
              description="Browse all registered gyms"
              href="/admin/gyms"
            />
            <ManagementOption
              label="Gym Members"
              description="View gym membership details"
              href="/admin/gym-members"
            />
            <ManagementOption
              label="Subscriptions & Billing"
              description="Manage gym subscriptions"
              href="/admin/gyms/billing"
            />
            <ManagementOption
              label="Gym Staff"
              description="Manage gym trainers and staff"
              href="/admin/gyms/staff"
            />
          </CardContent>
        </Card>

        {/* Analytics & Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analytics & Reports
            </CardTitle>
            <CardDescription>View platform analytics and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ManagementOption
              label="Platform Analytics"
              description="View comprehensive platform metrics"
              href="/admin/analytics"
            />
            <ManagementOption
              label="User Engagement"
              description="Track user engagement metrics"
              href="/admin/engagement"
            />
            <ManagementOption
              label="Revenue Reports"
              description="View subscription and revenue data"
              href="/admin/reports/revenue"
            />
            <ManagementOption
              label="System Health"
              description="Monitor platform performance"
              href="/admin/system"
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ActivityItem
              action="New user registration"
              user="John Doe"
              time="2 hours ago"
              icon="👤"
            />
            <ActivityItem
              action="Trainer certified"
              user="Sarah Smith"
              time="5 hours ago"
              icon="✅"
            />
            <ActivityItem
              action="New gym onboarded"
              user="FitnessPro Gym"
              time="1 day ago"
              icon="🏢"
            />
            <ActivityItem
              action="Subscription expired"
              user="Client - Mike Johnson"
              time="1 day ago"
              icon="⏰"
            />
            <ActivityItem
              action="System maintenance completed"
              user="System Admin"
              time="2 days ago"
              icon="⚙️"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
}: {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

function ManagementOption({
  label,
  description,
  href,
}: {
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="p-3 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground mt-1">{description}</div>
      </div>
    </Link>
  );
}

function ActivityItem({
  action,
  user,
  time,
  icon,
}: {
  action: string;
  user: string;
  time: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
      <div className="text-xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{action}</p>
        <p className="text-xs text-muted-foreground mt-1">{user} • {time}</p>
      </div>
    </div>
  );
}
