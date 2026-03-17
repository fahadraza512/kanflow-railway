import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/api/notification.service';
import { Notification } from '@/types/api.types';

/**
 * Query keys for notifications — all global (user-level, no workspace scoping)
 */
export const notificationKeys = {
    all: ['notifications'] as const,
    list: () => [...notificationKeys.all, 'list'] as const,
    unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/**
 * Hook to fetch ALL notifications for the current user across all workspaces
 */
export function useNotifications(workspaceId?: string | null) {
    return useQuery({
        queryKey: notificationKeys.list(),
        queryFn: () => notificationService.getNotifications(), // no workspace filter
        enabled: true,
    });
}

/**
 * Hook to fetch global unread notifications count across ALL workspaces
 */
export function useUnreadNotificationsCount(workspaceId?: string | null) {
    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: async () => {
            const count = await notificationService.getUnreadCount(); // no workspace filter
            return count;
        },
        refetchInterval: 30000,
        enabled: true,
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
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Hook to mark all notifications as read (global)
 */
export function useMarkAllNotificationsAsRead(workspaceId?: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}

/**
 * Hook to clear all notifications (global)
 */
export function useClearAllNotifications(workspaceId?: string | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationService.clearAll(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
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
            await queryClient.cancelQueries({ queryKey: notificationKeys.all });
            const previousNotifications = queryClient.getQueryData(notificationKeys.all);
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
            if (context?.previousNotifications) {
                queryClient.setQueryData(notificationKeys.all, context.previousNotifications);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
        },
    });
}
