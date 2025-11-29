
import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';
import { getAuthHeaders, apiUrl } from '@/lib/api';

interface NotificationData {
  type: 'unread_count_update' | 'notification';
  unread_count?: number;
  notification?: any;
}

export function useNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: NotificationData = JSON.parse(event.data);
      if (data.type === 'unread_count_update' && data.unread_count !== undefined) {
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }, []);

  const { isConnected, connect, disconnect } = useWebSocket({
    url: userId ? `${process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:8000'}/ws/notifications/${userId}/` : '',
    token: token || undefined,
    onConnect: () => {
      console.log('Connected to notification WebSocket');
    },
    onDisconnect: () => {
      console.log('Disconnected from notification WebSocket');
    },
    onError: (error) => {
      console.error('Notification WebSocket error:', error);
    },
    onMessage: handleMessage,
  });

  useEffect(() => {
    // Get user data from localStorage
    const storedToken = localStorage.getItem('accessToken');
    const storedUserId = localStorage.getItem('userId');

    setToken(storedToken);
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (userId && token) {
      // Connect to notifications WebSocket
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, token, connect, disconnect]);

  // Fallback to HTTP polling if WebSocket fails
  useEffect(() => {
    if (!isConnected && userId && token) {
      console.log('WebSocket not connected, falling back to HTTP polling');

      const pollUnreadCount = async () => {
        try {
          const headers = await getAuthHeaders();
          const response = await fetch(apiUrl('/users/messages/unread-count/'), {
            headers,
          });

          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count || 0);
          }
        } catch (error) {
          console.error('HTTP polling failed:', error);
        }
      };

      // Poll immediately and then every 60 seconds
      pollUnreadCount();
      const pollInterval = setInterval(pollUnreadCount, 60000);

      return () => clearInterval(pollInterval);
    }
  }, [isConnected, userId, token]);

  return {
    unreadCount,
    isConnected,
  };
}
