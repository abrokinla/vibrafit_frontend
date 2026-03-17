'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, BarChart3, TrendingUp, Target, MessageSquare } from "lucide-react";
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Admin home has been cleaned up to remove hard-coded metrics. Use the sections below for live management pages.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/users">Open User Management</Link>
        </Button>
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              href="/admin/engagement"
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
              href="/admin/trainers"
            />
            <ManagementOption
              label="Client-Trainer Subscriptions"
              description="Manage subscription requests"
              href="/admin/subscriptions"
            />
            <ManagementOption
              label="Verify Certifications"
              description="Review trainer credentials"
              href="/admin/trainers"
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
              href="/admin/engagement"
            />
            <ManagementOption
              label="Nutrition Plans"
              description="Manage nutrition plans and meals"
              href="/admin/engagement"
            />
            <ManagementOption
              label="User Goals"
              description="Monitor and manage user fitness goals"
              href="/admin/engagement"
            />
            <ManagementOption
              label="User Metrics"
              description="Track user health metrics data"
              href="/admin/engagement"
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
              href="/admin/messages"
            />
            <ManagementOption
              label="Timeline Posts"
              description="Manage user posts and engagement"
              href="/admin/posts"
            />
            <ManagementOption
              label="Support Tickets"
              description="Handle user support requests"
              href="/admin/messages"
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
              href="/admin/gyms"
            />
            <ManagementOption
              label="Subscriptions & Billing"
              description="Manage gym subscriptions"
              href="/admin/subscriptions"
            />
            <ManagementOption
              label="Gym Staff"
              description="Manage gym trainers and staff"
              href="/admin/trainers"
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
              href="/admin/engagement"
            />
            <ManagementOption
              label="User Engagement"
              description="Track user engagement metrics"
              href="/admin/engagement"
            />
            <ManagementOption
              label="Revenue Reports"
              description="View subscription and revenue data"
              href="/admin/subscriptions"
            />
            <ManagementOption
              label="System Health"
              description="Monitor platform performance"
              href="/admin/settings"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Note</CardTitle>
          <CardDescription>
            This dashboard is now a navigation hub only. Detailed data should be viewed from each dedicated admin page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
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
