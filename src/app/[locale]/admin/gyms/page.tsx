'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Edit, Trash2, Users, CheckCircle } from "lucide-react";

interface Gym {
  id: string;
  name: string;
  owner: string;
  location: string;
  members: number;
  maxMembers: number;
  subscription: 'trial' | 'active' | 'expired' | 'suspended';
  joinDate: string;
  phone: string;
}

const mockGyms: Gym[] = [
  { id: '1', name: 'FitnessPro Gym', owner: 'John Manager', location: 'New York', members: 45, maxMembers: 100, subscription: 'active', joinDate: '2024-01-20', phone: '+1-555-0101' },
  { id: '2', name: 'StrengthHub', owner: 'Sarah Owner', location: 'Los Angeles', members: 23, maxMembers: 50, subscription: 'active', joinDate: '2024-03-10', phone: '+1-555-0102' },
  { id: '3', name: 'YogaZone', owner: 'Mike Trainer', location: 'Chicago', members: 32, maxMembers: 75, subscription: 'trial', joinDate: '2024-12-01', phone: '+1-555-0103' },
  { id: '4', name: 'PowerLift Center', owner: 'Tom Admin', location: 'Houston', members: 0, maxMembers: 100, subscription: 'expired', joinDate: '2023-06-15', phone: '+1-555-0104' },
];

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>(mockGyms);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gym.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubscription = subscriptionFilter === 'all' || gym.subscription === subscriptionFilter;
    return matchesSearch && matchesSubscription;
  });

  const getSubscriptionBadge = (status: string) => {
    const colors = {
      trial: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getMemberPercentage = (members: number, maxMembers: number) => {
    return Math.round((members / maxMembers) * 100);
  };

  const stats = {
    totalGyms: gyms.length,
    activeSubscriptions: gyms.filter(g => g.subscription === 'active').length,
    totalMembers: gyms.reduce((sum, g) => sum + g.members, 0),
    trialGyms: gyms.filter(g => g.subscription === 'trial').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            🏢
            Gym Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage partner gyms and memberships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">Add Gym</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gyms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGyms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Trial Gyms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.trialGyms}</div>
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
                  placeholder="Search by gym name, owner, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Status</label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subscriptions</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gyms List */}
      <div className="grid gap-6">
        {filteredGyms.map(gym => (
          <Card key={gym.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{gym.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Owner: <span className="font-semibold text-foreground">{gym.owner}</span> • Location: <span className="font-semibold text-foreground">{gym.location}</span>
                  </CardDescription>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${getSubscriptionBadge(gym.subscription)}`}>
                  {gym.subscription.charAt(0).toUpperCase() + gym.subscription.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Members</p>
                  <p className="text-2xl font-bold">{gym.members}/{gym.maxMembers}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${getMemberPercentage(gym.members, gym.maxMembers)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getMemberPercentage(gym.members, gym.maxMembers)}% full</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
                  <p className="text-sm font-mono">{gym.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Joined</p>
                  <p className="text-sm">{gym.joinDate}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Capacity</p>
                  <p className="text-sm font-semibold">{gym.maxMembers} members max</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  View Members
                </Button>
                <Button variant="outline" size="sm">
                  View Stats
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100 ml-auto">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
