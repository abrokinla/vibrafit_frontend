'use client';
export const runtime = 'edge';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Search, Filter, Trash2, Reply, Check } from "lucide-react";

interface Message {
  id: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderEmail: 'john@example.com',
    senderName: 'John Doe',
    recipientEmail: 'trainer1@example.com',
    content: 'Can you check my workout plan?',
    timestamp: '2024-12-20 10:30',
    isRead: true,
  },
  {
    id: '2',
    senderEmail: 'sarah@example.com',
    senderName: 'Sarah Smith',
    recipientEmail: 'mike@example.com',
    content: 'Looking good on your progress!',
    timestamp: '2024-12-20 09:15',
    isRead: false,
  },
  {
    id: '3',
    senderEmail: 'trainer1@example.com',
    senderName: 'Sarah Smith',
    recipientEmail: 'john@example.com',
    content: 'Great work on the last session!',
    timestamp: '2024-12-19 16:45',
    isRead: true,
  },
  {
    id: '4',
    senderEmail: 'mike@example.com',
    senderName: 'Mike Johnson',
    recipientEmail: 'admin@example.com',
    content: 'Need help with account issue',
    timestamp: '2024-12-19 14:20',
    isRead: false,
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRead = readFilter === 'all' ||
                       (readFilter === 'unread' && !msg.isRead) ||
                       (readFilter === 'read' && msg.isRead);
    return matchesSearch && matchesRead;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;
  const toggleMessageRead = (id: string) => {
    setMessages(messages.map(m => m.id === id ? { ...m, isRead: !m.isRead } : m));
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const toggleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Messages & Support
          </h1>
          <p className="text-muted-foreground mt-2">Monitor user messages and conversations</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 hrs</div>
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
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All messages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Toolbar */}
            {selectedMessages.length > 0 && (
              <div className="flex gap-2 p-3 bg-muted rounded-lg items-center">
                <span className="text-sm font-medium">{selectedMessages.length} selected</span>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm">Mark as Read</Button>
                  <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="border border-border rounded-lg overflow-hidden">
              {filteredMessages.map((message, idx) => (
                <div
                  key={message.id}
                  className={`p-4 border-b border-border hover:bg-muted/50 transition-colors last:border-0 flex gap-3 ${
                    !message.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMessages.includes(message.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMessages([...selectedMessages, message.id]);
                      } else {
                        setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold text-sm">{message.senderName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{message.senderEmail}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-foreground mt-2">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">To: {message.recipientEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMessageRead(message.id)}
                    >
                      {message.isRead ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-300" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-100"
                      onClick={() => deleteMessage(message.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
