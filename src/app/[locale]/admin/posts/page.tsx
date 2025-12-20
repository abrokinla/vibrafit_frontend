'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Trash2, Eye, EyeOff, Heart, MessageCircle } from "lucide-react";

interface Post {
  id: string;
  author: string;
  authorEmail: string;
  content: string;
  likes: number;
  comments: number;
  engagement: number;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
  hasImage: boolean;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'John Doe',
    authorEmail: 'john@example.com',
    content: 'Just completed my morning workout! Feeling energized and ready for the day! 💪',
    likes: 24,
    comments: 5,
    engagement: 34,
    status: 'published',
    createdAt: '2024-12-20',
    hasImage: true,
  },
  {
    id: '2',
    author: 'Sarah Smith',
    authorEmail: 'trainer1@example.com',
    content: 'New nutrition tips for post-workout recovery...',
    likes: 156,
    comments: 28,
    engagement: 212,
    status: 'published',
    createdAt: '2024-12-19',
    hasImage: true,
  },
  {
    id: '3',
    author: 'Mike Johnson',
    authorEmail: 'mike@example.com',
    content: 'Inappropriate content',
    likes: 3,
    comments: 1,
    engagement: 4,
    status: 'flagged',
    createdAt: '2024-12-19',
    hasImage: false,
  },
  {
    id: '4',
    author: 'Jane Wilson',
    authorEmail: 'jane@example.com',
    content: 'Achieved my weight loss goal! 30 lbs down! 🎉',
    likes: 89,
    comments: 15,
    engagement: 104,
    status: 'hidden',
    createdAt: '2024-12-18',
    hasImage: true,
  },
];

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'engagement') return b.engagement - a.engagement;
    if (sortBy === 'flagged') return (b.status === 'flagged' ? 1 : 0) - (a.status === 'flagged' ? 1 : 0);
    return 0;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      hidden: { color: 'bg-gray-100 text-gray-800', label: 'Hidden' },
      flagged: { color: 'bg-red-100 text-red-800', label: 'Flagged' },
    };
    return badges[status as keyof typeof badges] || badges.published;
  };

  const togglePostStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'hidden' : 'published';
    setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
  };

  const deletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    flagged: posts.filter(p => p.status === 'flagged').length,
    hidden: posts.filter(p => p.status === 'hidden').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            📸
            Timeline Posts
          </h1>
          <p className="text-muted-foreground mt-2">Moderate user posts and engagement</p>
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
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Flagged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{stats.flagged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hidden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hidden}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters & Sort</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by author or content..."
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
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="engagement">Highest Engagement</SelectItem>
                  <SelectItem value="flagged">Flagged First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="grid gap-6">
        {sortedPosts.map(post => {
          const badge = getStatusBadge(post.status);
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{post.author}</CardTitle>
                    <CardDescription className="text-xs font-mono">{post.authorEmail}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.createdAt}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-foreground">{post.content}</p>
                  {post.hasImage && (
                    <div className="mt-3 p-4 bg-gray-100 rounded-lg text-center text-sm text-muted-foreground">
                      📷 Image attached
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments} comments</span>
                  </div>
                  <div className="ml-auto font-semibold text-foreground">
                    Engagement: {post.engagement}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePostStatus(post.id, post.status)}
                  >
                    {post.status === 'published' ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-100 ml-auto"
                    onClick={() => deletePost(post.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
