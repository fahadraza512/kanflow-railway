import { apiClient } from './base.service';
import { Notification } from '@/types/api.types';

/**
 * Notification API Service
 * Handles all notification-related API calls
 */

export const notificationService = {
    /**
     * Get all notifications for the current user in a specific workspace
     */
    getNotifications: async (workspaceId?: string | null): Promise<Notification[]> => {
        try {
            if (workspaceId) {
                const response = await apiClient.get<{ data: Notification[]; success: boolean }>(`/notifications?workspaceId=${workspaceId}`);
                // Backend returns { data: [...], success: true }
                const notifications = response.data?.data ?? response.data;
                return Array.isArray(notifications) ? notifications : [];
            }
            const response = await apiClient.get<{ data: Notification[]; success: boolean }>('/notifications');
            // Backend returns { data: [...], success: true }
            const notifications = response.data?.data ?? response.data;
            return Array.isArray(notifications) ? notifications : [];
        } catch (error: any) {
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                console.log('Notifications endpoint not found, returning empty array');
                return [];
            }
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    /**
     * Get unread notifications count for a specific workspace
     */
    getUnreadCount: async (workspaceId?: string | null): Promise<number> => {
        try {
            console.log('[NotificationService] Fetching unread count for workspace:', workspaceId);
            if (workspaceId) {
                const response = await apiClient.get<{ data: { count: number }; success: boolean }>(`/notifications/unread-count?workspaceId=${workspaceId}`);
                console.log('[NotificationService] Unread count response:', response.data);
                // Backend returns { data: { count: X }, success: true }
                const count = response.data?.data?.count ?? response.data?.count ?? 0;
                return typeof count === 'number' ? count : 0;
            }
            const response = await apiClient.get<{ data: { count: number }; success: boolean }>('/notifications/unread-count');
            console.log('[NotificationService] Unread count response (no workspace):', response.data);
            // Backend returns { data: { count: X }, success: true }
            const count = response.data?.data?.count ?? response.data?.count ?? 0;
            return typeof count === 'number' ? count : 0;
        } catch (error: any) {
            console.error('[NotificationService] Error fetching unread count:', {
                status: error.response?.status,
                message: error.message,
                url: error.config?.url,
                workspaceId,
            });
            
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                console.warn('[NotificationService] Unread count endpoint not found (404)');
                return 0;
            }
            
            // For other errors, still return 0 but log them
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
     * Mark all notifications as read for a workspace
     */
    markAllAsRead: async (workspaceId?: string | null): Promise<void> => {
        try {
            // Backend endpoint is POST /notifications/mark-all-read
            await apiClient.post('/notifications/mark-all-read');
        } catch (error: any) {
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                return;
            }
            throw error;
        }
    },

    /**
     * Clear all notifications for a workspace
     */
    clearAll: async (workspaceId?: string | null): Promise<void> => {
        try {
            const url = workspaceId 
                ? `/notifications/clear-all?workspaceId=${workspaceId}`
                : '/notifications/clear-all';
            await apiClient.delete(url);
        } catch (error: any) {
            // Gracefully handle 404 errors (endpoint not implemented yet)
            if (error.response?.status === 404) {
                return;
            }
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
