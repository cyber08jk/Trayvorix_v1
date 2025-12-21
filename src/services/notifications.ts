import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNotificationsSubscription } from '@hooks/useRealtimeSubscription';

export interface Notification {
  id: string;
  user_id: string;
  type: 'low_stock' | 'expiring_batch' | 'approval_needed' | 'transfer_request' | 'info';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Notification[];
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

/**
 * Create a notification
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function deleteOldNotifications(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;
}

/**
 * Create low stock notification
 */
export async function createLowStockNotification(userId: string, productName: string, productId: string, currentStock: number) {
  return createNotification({
    user_id: userId,
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `${productName} is running low (${currentStock} units remaining)`,
    link: `/products?id=${productId}`,
  });
}

/**
 * Create adjustment approval notification
 */
export async function createAdjustmentApprovalNotification(userId: string, adjustmentId: string, productName: string) {
  return createNotification({
    user_id: userId,
    type: 'approval_needed',
    title: 'Adjustment Approval Needed',
    message: `Inventory adjustment for ${productName} requires your approval`,
    link: `/adjustments?id=${adjustmentId}`,
  });
}

/**
 * Hook for managing notifications
 */
export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  // Subscribe to new notifications
  useNotificationsSubscription((payload) => {
    if (payload.new) {
      setNotifications(prev => [payload.new as Notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    }
  }, userId);

  const markRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllRead = async () => {
    if (!userId) return;

    try {
      await markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead: markRead,
    markAllAsRead: markAllRead,
  };
}
