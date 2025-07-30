import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, total: 1, totalRecords: 0, limit: 20 });
  const { user } = useAuth();

  // Cleanup function for logout
  const cleanup = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
    setPagination({ current: 1, total: 1, totalRecords: 0, limit: 20 });
  }, []);

  // Fetch notifications (replace or append)
  const fetchNotifications = useCallback(async (page = 1, limit = 20, append = false) => {
    if (!user) return;
    try {
      setLoading(true);
      const apiUrl = 'https://offaccess-portal-production.up.railway.app';
      console.log('🔍 NotificationContext - API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/api/notifications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      console.log('Fetched notifications:', data);
      setNotifications(prev => append ? [...prev, ...(data.notifications || [])] : (data.notifications || []));
      setUnreadCount(data.unreadCount || 0);
      setPagination({
        current: data.pagination?.current || 1,
        total: data.pagination?.total || 1,
        totalRecords: data.pagination?.totalRecords || 0,
        limit: limit
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load more notifications (next page)
  const loadMoreNotifications = async () => {
    if (pagination.current < pagination.total && !loading) {
      await fetchNotifications(pagination.current + 1, pagination.limit, true);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Update local state
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n._id === notificationId);
        return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Add new notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      // User logged out - cleanup immediately
      cleanup();
    }
  }, [user, fetchNotifications, cleanup]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    loadMoreNotifications,
    pagination,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    cleanup
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 