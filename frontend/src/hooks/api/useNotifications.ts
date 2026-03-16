import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/api/notification.service';
import { Notification } from '@/types/api.types';

/**
 * Query keys for notifications
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    list: (workspaceId?: string | null) => [...notificationKeys.all, 'list', workspaceId] as const,
    unreadCount: (workspaceId?: string | null) => [...notificationKeys.all, 'unread-count', workspaceId] as const,
};

/**
 * Hook to fetch all notifications for a workspace
 */
export function useNotifications(workspaceId?: string | null) {
    return useQuery({
        queryKey: notificationKeys.list(workspaceId),
        queryFn: () => notificationService.getNotifications(workspaceId),
        enabled: !!workspaceId, // Only fetch if workspaceId is provided
    });
}

/**
 * Hook to fetch unread notifications count for a workspace
 */
export function useUnreadNotificationsCount(workspaceId?: string | null) {
    return useQuery({
        queryKey: notificationKeys.unreadCount(workspaceId),
        queryFn: async () => {
            console.log('[useUnreadNotificationsCount] Fetching for workspace:', workspaceId);
            const count = await notificationService.getUnreadCount(workspaceId);
            console.log('[useUnreadNotificationsCount] Count received:', count);
            return count;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
        enabled: !!workspaceId, // Only fetch if workspaceId is provided
        retry: 3,
        retryDelay: 1000,
    });
}

/**
 * Hook to mark a notification as read
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            // Invalidate all notifications lists and unread counts
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Hook to mark all notifications as read for a workspace
 */
export function useMarkAllNotificationsAsRead(workspaceId?: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(workspaceId),
        onSuccess: () => {
            // Invalidate notifications list and unread count for this workspace
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(workspaceId) });
        },
    });
}

/**
 * Hook to clear all notifications for a workspace
 */
export function useClearAllNotifications(workspaceId?: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.clearAll(workspaceId),
        onSuccess: () => {
            // Invalidate notifications list and unread count for this workspace
            queryClient.invalidateQueries({ queryKey: notificationKeys.list(workspaceId) });
            queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount(workspaceId) });
        },
    });
}

/**
 * Hook to delete a notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
        onMutate: async (notificationId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });
            
            // Snapshot previous values
            const previousNotifications = queryClient.getQueryData(notificationKeys.all);
            
            // Optimistically update all notification lists
            queryClient.setQueriesData(
                { queryKey: notificationKeys.all },
                (old: any) => {
                    if (Array.isArray(old)) {
                        return old.filter((n: any) => n.id !== notificationId);
                    }
                    return old;
                }
            );
            
            return { previousNotifications };
        },
        onError: (err, notificationId, context) => {
            // Rollback on error
            if (context?.previousNotifications) {
                queryClient.setQueryData(notificationKeys.all, context.previousNotifications);
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
