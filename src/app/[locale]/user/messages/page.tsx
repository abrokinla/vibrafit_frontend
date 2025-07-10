// src/app/[locale]/user/messages/page.tsx
'use client';
export const runtime = 'edge';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, UserCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { fetchConversations, fetchMessages, sendMessage, Conversation, Message } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export default function MessagesPage() {
  const t = useTranslations('MessagesPage');
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId ? parseInt(userId, 10) : null);
    
    setIsLoadingConversations(true);
    fetchConversations()
      .then(data => setConversations(data))
      .catch(() => toast({ title: t('toastErrorLoadConversations'), variant: 'destructive' }))
      .finally(() => setIsLoadingConversations(false));
  }, [toast, t]);

  useEffect(() => {
    if (selectedConversation) {
      setIsLoadingMessages(true);
      fetchMessages(selectedConversation.user.id)
        .then(data => setMessages(data))
        .catch(() => toast({ title: t('toastErrorLoadMessages'), variant: 'destructive' }))
        .finally(() => setIsLoadingMessages(false));
    }
  }, [selectedConversation, toast, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const sentMessage = await sendMessage(selectedConversation.user.id, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      toast({ title: t('toastErrorSendMessage'), variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </header>

      <Card className="h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] flex overflow-hidden shadow-lg">
        {/* Conversations List */}
        <div className="w-1/3 border-r flex flex-col">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg">{t('conversationsTitle')}</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            {isLoadingConversations ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>)}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map(convo => (
                <button
                  key={convo.user.id}
                  onClick={() => setSelectedConversation(convo)}
                  className={cn(
                    "w-full text-left p-3 flex items-center gap-3 hover:bg-accent transition-colors",
                    selectedConversation?.user.id === convo.user.id && "bg-secondary"
                  )}
                >
                  <Avatar>
                    <AvatarImage src={convo.user.profile_picture_url || ''} alt={convo.user.name} />
                    <AvatarFallback>{convo.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="font-semibold">{convo.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{convo.last_message}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-muted-foreground">{t('noConversations')}</p>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <header className="p-4 border-b flex items-center gap-3">
                 <Avatar>
                    <AvatarImage src={selectedConversation.user.profile_picture_url || ''} alt={selectedConversation.user.name} />
                    <AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold">{selectedConversation.user.name}</h2>
              </header>
              <ScrollArea className="flex-1 p-4 bg-muted/20">
                <div className="space-y-4">
                  {isLoadingMessages ? (
                     <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === currentUserId ? "justify-end" : "justify-start")}>
                         {msg.sender !== currentUserId && <Avatar className="h-6 w-6"><AvatarImage src={selectedConversation.user.profile_picture_url || ''} /><AvatarFallback>{selectedConversation.user.name.charAt(0)}</AvatarFallback></Avatar>}
                        <div className={cn(
                          "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 text-sm", 
                          msg.sender === currentUserId ? "bg-primary text-primary-foreground" : "bg-secondary"
                          )}>
                          <p>{msg.content}</p>
                          <p className={cn("text-xs opacity-70 mt-1", msg.sender === currentUserId ? "text-right" : "text-left")}>{format(parseISO(msg.timestamp), 'p')}</p>
                        </div>
                      </div>
                    ))
                  )}
                   <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-background flex items-center gap-2">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder={t('typeMessagePlaceholder')} 
                  className="flex-1"
                  disabled={isSending} 
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
              <UserCircle className="h-16 w-16 mb-4" />
              <h2 className="text-xl font-semibold">{t('selectAConversation')}</h2>
              <p className="text-sm">{t('selectAConversationDesc')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
