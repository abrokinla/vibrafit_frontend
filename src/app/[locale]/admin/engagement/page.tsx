'use client';
export const runtime = 'edge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Activity, MessageSquare, Download } from "lucide-react";
import { useState } from 'react';

export default function EngagementPage() {
  const [timeRange, setTimeRange] = useState('week');

  const engagementData = {
    totalPosts: 245,
    totalEngagement: 5430,
    avgEngagementPerPost: 22.2,
    topPost: {
      author: 'Sarah Smith',
      content: 'New nutrition tips...',
      engagement: 234,
      likes: 156,
      comments: 28,
    },
    postsByDay: [
      { day: 'Mon', posts: 12, engagement: 245 },
      { day: 'Tue', posts: 14, engagement: 320 },
      { day: 'Wed', posts: 18, engagement: 420 },
      { day: 'Thu', posts: 16, engagement: 380 },
      { day: 'Fri', posts: 22, engagement: 510 },
      { day: 'Sat', posts: 15, engagement: 350 },
      { day: 'Sun', posts: 11, engagement: 205 },
    ],
    topAuthors: [
      { name: 'Sarah Smith', posts: 18, engagement: 1205, followers: 342 },
      { name: 'John Trainer', posts: 14, engagement: 890, followers: 287 },
      { name: 'Mike Coach', posts: 12, engagement: 756, followers: 215 },
      { name: 'Jane Fitness', posts: 10, engagement: 645, followers: 198 },
    ],
    engagementTypes: [
      { type: 'Likes', count: 3245, percentage: 60 },
      { type: 'Comments', count: 1512, percentage: 28 },
      { type: 'Shares', count: 673, percentage: 12 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="w-8 h-8" />
            Engagement Analytics
          </h1>
          <p className="text-muted-foreground mt-2">Track user engagement and post performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.totalPosts}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.totalEngagement.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">+18% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg per Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementData.avgEngagementPerPost}</div>
            <p className="text-xs text-muted-foreground mt-1">Interactions per post</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Friday</div>
            <p className="text-xs text-muted-foreground mt-1">Highest engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Breakdown</CardTitle>
          <CardDescription>Distribution of engagement types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementData.engagementTypes.map(item => (
              <div key={item.type}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm">{item.type}</span>
                  <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Post */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Post</CardTitle>
          <CardDescription>Highest engagement this period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="font-semibold text-base mb-1">{engagementData.topPost.author}</div>
            <p className="text-sm text-muted-foreground mb-4">{engagementData.topPost.content}</p>
            <div className="grid grid-cols-3 gap-4 text-center p-4 bg-muted rounded-lg">
              <div>
                <div className="text-2xl font-bold text-red-600">{engagementData.topPost.likes}</div>
                <div className="text-xs text-muted-foreground mt-1">Likes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{engagementData.topPost.comments}</div>
                <div className="text-xs text-muted-foreground mt-1">Comments</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{engagementData.topPost.engagement}</div>
                <div className="text-xs text-muted-foreground mt-1">Total</div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">View Post Details</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Activity by Day</CardTitle>
            <CardDescription>Posts and engagement per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.postsByDay.map(day => (
                <div key={day.day}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{day.day}</span>
                    <span className="text-xs text-muted-foreground">{day.posts} posts • {day.engagement} engagement</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 bg-blue-200 rounded h-2">
                      <div
                        className="bg-blue-600 h-2 rounded transition-all"
                        style={{ width: `${(day.posts / 22) * 100}%` }}
                      />
                    </div>
                    <div className="flex-1 bg-green-200 rounded h-2">
                      <div
                        className="bg-green-600 h-2 rounded transition-all"
                        style={{ width: `${(day.engagement / 510) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Authors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Authors</CardTitle>
            <CardDescription>Most active contributors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.topAuthors.map((author, idx) => (
                <div key={author.name} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-sm">#{idx + 1} {author.name}</div>
                      <div className="text-xs text-muted-foreground">{author.followers} followers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{author.engagement}</div>
                      <div className="text-xs text-muted-foreground">engagement</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">{author.posts} posts</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
