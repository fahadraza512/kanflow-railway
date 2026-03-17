import { apiClient } from './base.service';
import { Notification } from '@/types/api.types';

/**
 * Notification API Service
 * Handles all notification-related API calls
 */

export const notificationService = {
    /**
     * Get ALL notifications for the current user across all workspaces
     */
    getNotifications: async (workspaceId?: string | null): Promise<Notification[]> => {
        try {
            // Always fetch globally — no workspace filter
            const response = await apiClient.get<{ data: Notification[]; success: boolean }>('/notifications');
            const notifications = response.data?.data ?? response.data;
            return Array.isArray(notifications) ? notifications : [];
        } catch (error: any) {
            if (error.response?.status === 404) return [];
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    /**
     * Get global unread count across ALL workspaces
     */
    getUnreadCount: async (workspaceId?: string | null): Promise<number> => {
        try {
            // Always fetch globally — no workspace filter
            const response = await apiClient.get<{ data: { count: number }; success: boolean }>('/notifications/unread-count');
            const count = response.data?.data?.count ?? (response.data as any)?.count ?? 0;
            return typeof count === 'number' ? count : 0;
        } catch (error: any) {
            if (error.response?.status === 404) return 0;
            return 0;
        }
    },

    /**
     * Mark a notification as read
     */
    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            await apiClient.patch(`/notifications/${notificationId}/read`);
        } catch (error: any) {
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                return;
            }
            throw error;
        }
    },

    /**
     * Mark all notifications as read (global — all workspaces)
     */
    markAllAsRead: async (workspaceId?: string | null): Promise<void> => {
        try {
            await apiClient.post('/notifications/mark-all-read');
        } catch (error: any) {
            if (error.response?.status === 404) return;
            throw error;
        }
    },

    /**
     * Clear all notifications (global — all workspaces)
     */
    clearAll: async (workspaceId?: string | null): Promise<void> => {
        try {
            await apiClient.delete('/notifications/clear-all');
        } catch (error: any) {
            if (error.response?.status === 404) return;
            throw error;
        }
    },

    /**
     * Delete a notification
     */
    deleteNotification: async (notificationId: string): Promise<void> => {
        try {
            await apiClient.delete(`/notifications/${notificationId}`);
        } catch (error: any) {
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                return;
            }
            throw error;
        }
    },
};
