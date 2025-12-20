import { useState, useCallback } from 'react';
import { adminUsers, adminTrainers, adminSubscriptions, adminGyms, adminPosts, adminMessages } from '@/lib/admin-api';

/**
 * Hook for managing users
 */
export const useAdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminUsers.getAll(filters);
      setUsers(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: any) => {
    try {
      const updated = await adminUsers.update(id, data);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    }
  }, [users]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await adminUsers.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  }, [users]);

  const toggleUserActive = useCallback(async (id: string, isActive: boolean) => {
    return updateUser(id, { is_active: isActive });
  }, [updateUser]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    toggleUserActive,
  };
};

/**
 * Hook for managing trainers
 */
export const useAdminTrainers = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainers = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminTrainers.getAll(filters);
      setTrainers(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyTrainer = useCallback(async (id: string) => {
    try {
      const updated = await adminTrainers.verify(id);
      setTrainers(trainers.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify trainer');
      throw err;
    }
  }, [trainers]);

  const updateRating = useCallback(async (id: string, rating: number) => {
    try {
      const updated = await adminTrainers.updateRating(id, rating);
      setTrainers(trainers.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rating');
      throw err;
    }
  }, [trainers]);

  return {
    trainers,
    loading,
    error,
    fetchTrainers,
    verifyTrainer,
    updateRating,
  };
};

/**
 * Hook for managing subscriptions
 */
export const useAdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminSubscriptions.getAll(filters);
      setSubscriptions(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  const approveSubscription = useCallback(async (id: string) => {
    try {
      const updated = await adminSubscriptions.approve(id);
      setSubscriptions(subscriptions.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve subscription');
      throw err;
    }
  }, [subscriptions]);

  const declineSubscription = useCallback(async (id: string) => {
    try {
      const updated = await adminSubscriptions.decline(id);
      setSubscriptions(subscriptions.map(s => s.id === id ? updated : s));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline subscription');
      throw err;
    }
  }, [subscriptions]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    approveSubscription,
    declineSubscription,
  };
};

/**
 * Hook for managing gyms
 */
export const useAdminGyms = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGyms = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGyms.getAll(filters);
      setGyms(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gyms');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGym = useCallback(async (id: string, data: any) => {
    try {
      const updated = await adminGyms.update(id, data);
      setGyms(gyms.map(g => g.id === id ? updated : g));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update gym');
      throw err;
    }
  }, [gyms]);

  const updateSubscription = useCallback(async (id: string, status: string, endDate?: string) => {
    return updateGym(id, { subscription_status: status, subscription_end: endDate });
  }, [updateGym]);

  const fetchMembers = useCallback(async (id: string) => {
    try {
      return await adminGyms.getMembers(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gym members');
      throw err;
    }
  }, []);

  return {
    gyms,
    loading,
    error,
    fetchGyms,
    updateGym,
    updateSubscription,
    fetchMembers,
  };
};

/**
 * Hook for managing posts
 */
export const useAdminPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminPosts.getAll(filters);
      setPosts(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostStatus = useCallback(async (id: string, status: 'published' | 'hidden' | 'flagged') => {
    try {
      const updated = await adminPosts.updateStatus(id, status);
      setPosts(posts.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post');
      throw err;
    }
  }, [posts]);

  const deletePost = useCallback(async (id: string) => {
    try {
      await adminPosts.delete(id);
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      throw err;
    }
  }, [posts]);

  return {
    posts,
    loading,
    error,
    fetchPosts,
    updatePostStatus,
    deletePost,
  };
};

/**
 * Hook for managing messages
 */
export const useAdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminMessages.getAll(filters);
      setMessages(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversations = useCallback(async (filters?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminMessages.getConversations(filters);
      setMessages(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      await adminMessages.deleteMessage(id);
      setMessages(messages.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
      throw err;
    }
  }, [messages]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    fetchConversations,
    deleteMessage,
  };
};
