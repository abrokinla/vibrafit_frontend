/**
 * Admin API Utilities
 * Helper functions for admin operations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Admin User Management APIs
 */
export const adminUsers = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`);
    return response.json();
  },
  
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  
  toggleActive: async (id: string, isActive: boolean) => {
    return adminUsers.update(id, { is_active: isActive });
  },
};

/**
 * Admin Trainer Management APIs
 */
export const adminTrainers = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/trainers?${params}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/trainers/${id}`);
    return response.json();
  },
  
  verify: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/trainers/${id}/verify`, {
      method: 'POST',
    });
    return response.json();
  },
  
  updateRating: async (id: string, rating: number) => {
    const response = await fetch(`${API_BASE_URL}/admin/trainers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating }),
    });
    return response.json();
  },
};

/**
 * Admin Subscription Management APIs
 */
export const adminSubscriptions = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions?${params}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${id}`);
    return response.json();
  },
  
  approve: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${id}/approve`, {
      method: 'POST',
    });
    return response.json();
  },
  
  decline: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${id}/decline`, {
      method: 'POST',
    });
    return response.json();
  },
  
  updateStatus: async (id: string, status: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
};

/**
 * Admin Gym Management APIs
 */
export const adminGyms = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/gyms?${params}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/gyms/${id}`);
    return response.json();
  },
  
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/gyms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  updateSubscription: async (id: string, status: string, endDate?: string) => {
    return adminGyms.update(id, { subscription_status: status, subscription_end: endDate });
  },
  
  getMembers: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/gyms/${id}/members`);
    return response.json();
  },
};

/**
 * Admin Post Management APIs
 */
export const adminPosts = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/posts?${params}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`);
    return response.json();
  },
  
  updateStatus: async (id: string, status: 'published' | 'hidden' | 'flagged') => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  },
  
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

/**
 * Admin Analytics APIs
 */
export const adminAnalytics = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`);
    return response.json();
  },
  
  getEngagementStats: async (timeRange = 'week') => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/engagement?time_range=${timeRange}`);
    return response.json();
  },
  
  getUserMetrics: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/analytics/users?${params}`);
    return response.json();
  },
  
  getRevenueReport: async (startDate: string, endDate: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/revenue?start_date=${startDate}&end_date=${endDate}`);
    return response.json();
  },
};

/**
 * Admin Message Management APIs
 */
export const adminMessages = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/messages?${params}`);
    return response.json();
  },
  
  getConversations: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/conversations?${params}`);
    return response.json();
  },
  
  deleteMessage: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

/**
 * Admin Settings APIs
 */
export const adminSettings = {
  getSystemSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`);
    return response.json();
  },
  
  updateSystemSettings: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

/**
 * Admin Activity Logs
 */
export const adminLogs = {
  getActivityLogs: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/admin/logs?${params}`);
    return response.json();
  },
  
  getUserActivityLogs: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/logs/user/${userId}`);
    return response.json();
  },
};

/**
 * Helper function to generate report
 */
export const generateReport = async (reportType: string, filters: any) => {
  const response = await fetch(`${API_BASE_URL}/admin/reports/${reportType}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  
  if (!response.ok) throw new Error('Failed to generate report');
  
  // Get the blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
