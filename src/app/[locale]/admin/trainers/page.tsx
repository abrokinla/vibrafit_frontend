'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Search, Download, Trash2, Edit, Star, MessageSquare } from "lucide-react";

interface Trainer {
  id: string;
  email: string;
  name: string;
  specialization: string;
  rating: number;
  clients: number;
  experience: number;
  verified: boolean;
  joinDate: string;
}

const mockTrainers: Trainer[] = [
  { id: '1', email: 'trainer1@example.com', name: 'Sarah Smith', specialization: 'HIIT & Strength', rating: 4.8, clients: 12, experience: 5, verified: true, joinDate: '2024-02-01' },
  { id: '2', email: 'trainer2@example.com', name: 'John Fitness', specialization: 'Yoga & Flexibility', rating: 4.6, clients: 8, experience: 3, verified: true, joinDate: '2024-03-15' },
  { id: '3', email: 'trainer3@example.com', name: 'Mike Power', specialization: 'Bodybuilding', rating: 4.9, clients: 15, experience: 7, verified: true, joinDate: '2024-01-20' },
];

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerified = verifiedFilter === 'all' || 
                           (verifiedFilter === 'verified' ? trainer.verified : !trainer.verified);
    return matchesSearch && matchesVerified;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4.7) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="w-8 h-8" />
            Trainer Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage all certified trainers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">Invite Trainer</Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8★</div>
            <p className="text-xs text-muted-foreground mt-1">Very satisfied clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainers.reduce((sum, t) => sum + t.clients, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all trainers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(trainers.reduce((sum, t) => sum + t.experience, 0) / trainers.length).toFixed(1)} yrs</div>
            <p className="text-xs text-muted-foreground mt-1">Average experience</p>
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
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Status</label>
              <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trainers</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrainers.map(trainer => (
          <Card key={trainer.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{trainer.name}</CardTitle>
                  <CardDescription className="text-xs font-mono">{trainer.email}</CardDescription>
                </div>
                {trainer.verified && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">✓ Verified</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Specialization</p>
                <p className="text-sm font-semibold">{trainer.specialization}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className={`text-2xl font-bold ${getRatingColor(trainer.rating)}`}>{trainer.rating}★</p>
                  <p className="text-xs text-muted-foreground mt-1">Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{trainer.clients}</p>
                  <p className="text-xs text-muted-foreground mt-1">Clients</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{trainer.experience}</p>
                  <p className="text-xs text-muted-foreground mt-1">Years</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100">
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
