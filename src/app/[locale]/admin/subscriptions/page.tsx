'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, CheckCircle, Clock, XCircle, CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  clientEmail: string;
  trainerEmail: string;
  status: 'pending' | 'active' | 'declined' | 'expired';
  startDate: string;
  endDate: string;
  requestedAt: string;
}

const mockSubscriptions: Subscription[] = [
  { id: '1', clientEmail: 'john@example.com', trainerEmail: 'trainer1@example.com', status: 'active', startDate: '2024-01-15', endDate: '2025-01-15', requestedAt: '2024-01-10' },
  { id: '2', clientEmail: 'mike@example.com', trainerEmail: 'trainer2@example.com', status: 'pending', startDate: '-', endDate: '-', requestedAt: '2024-12-18' },
  { id: '3', clientEmail: 'jane@example.com', trainerEmail: 'trainer1@example.com', status: 'active', startDate: '2024-06-01', endDate: '2025-06-01', requestedAt: '2024-05-28' },
  { id: '4', clientEmail: 'bob@example.com', trainerEmail: 'trainer3@example.com', status: 'expired', startDate: '2023-12-01', endDate: '2024-12-01', requestedAt: '2023-11-25' },
  { id: '5', clientEmail: 'alice@example.com', trainerEmail: 'trainer2@example.com', status: 'declined', startDate: '-', endDate: '-', requestedAt: '2024-12-15' },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(mockSubscriptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.trainerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      declined: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Declined' },
      expired: { icon: Clock, color: 'bg-gray-100 text-gray-800', label: 'Expired' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const updateSubscriptionStatus = (id: string, newStatus: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, status: newStatus as any } : sub
    ));
  };

  const stats = {
    active: subscriptions.filter(s => s.status === 'active').length,
    pending: subscriptions.filter(s => s.status === 'pending').length,
    expired: subscriptions.filter(s => s.status === 'expired').length,
    total: subscriptions.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="w-8 h-8" />
            Subscription Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage client-trainer subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscriptions ({filteredSubs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-sm">Client</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Trainer</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Start Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">End Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Requested</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map(sub => {
                  const badge = getStatusBadge(sub.status);
                  const StatusIcon = badge.icon;
                  return (
                    <tr key={sub.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono">{sub.clientEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono">{sub.trainerEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{sub.startDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{sub.endDate}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 w-fit ${badge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">{sub.requestedAt}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {sub.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-green-600 hover:bg-green-100"
                              onClick={() => updateSubscriptionStatus(sub.id, 'active')}
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:bg-red-100"
                              onClick={() => updateSubscriptionStatus(sub.id, 'declined')}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        {sub.status !== 'pending' && (
                          <Button variant="outline" size="sm">View</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
