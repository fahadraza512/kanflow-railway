import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { showToast } from '@/lib/toast';
import { notificationKeys } from './api/useNotifications';

interface NotificationEvent {
    id: string | number;
    type: 'assignment' | 'mention' | 'comment' | 'deadline' | 'payment_failed';
    message: string;
    taskId?: string | number;
    taskTitle?: string;
    createdAt: string;
}

/**
 * Hook to manage real-time notifications via Server-Sent Events (SSE)
 * Automatically connects when user is authenticated
 * Displays toast notifications and invalidates notification cache
 */
export function useRealtimeNotifications() {
    const { user, token } = useAuthStore();
    const queryClient = useQueryClient();
    const eventSourceRef = useRef<EventSource | null>(null);

    useEffect(() => {
        // Only connect if user is authenticated
        if (!user || !token) {
            return;
        }

        // SSE uses relative URL so Next.js rewrite proxies it to the backend
        // This works in both dev and production on Railway
        const sseUrl = `/api/v1/notifications/stream?token=${token}`;

        try {
            const eventSource = new EventSource(sseUrl, { withCredentials: true });

            eventSourceRef.current = eventSource;

            // Handle incoming notification events
            eventSource.onmessage = (event) => {
                try {
                    const notification: NotificationEvent = JSON.parse(event.data);

                    // Show toast notification based on type
                    switch (notification.type) {
                        case 'assignment':
                            showToast.info(notification.message);
                            break;
                        case 'mention':
                            showToast.info(notification.message);
                            break;
                        case 'comment':
                            showToast.info(notification.message);
                            break;
                        case 'deadline':
                            showToast.warning(notification.message);
                            break;
                        case 'payment_failed':
                            showToast.error(notification.message);
                            break;
                        default:
                            showToast.info(notification.message);
                    }

                    // Invalidate notifications cache to refetch
                    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
                    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });

                    // If notification is task-related, invalidate task cache
                    if (notification.taskId) {
                        queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    }
                } catch (error) {
                    console.error('Failed to parse notification event:', error);
                }
            };

            // Handle connection errors - silently close since notifications feature not implemented yet
            eventSource.onerror = () => {
                eventSource.close();
            };
        } catch (error) {
            // Silently fail - notifications feature not available yet
        }

        // Cleanup on unmount or when user changes
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [user, token, queryClient]);

    return null;
}
