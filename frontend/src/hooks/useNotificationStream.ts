import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { notificationKeys } from './api/useNotifications';

/**
 * Hook to connect to SSE notification stream for real-time notifications
 * Automatically reconnects on disconnect and invalidates queries when new notifications arrive
 */
export function useNotificationStream() {
  const { token } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silently fail if audio can't play
      });
    } catch (error) {
      // Silently fail if audio not available
    }
  };

  // Show browser notification
  const showBrowserNotification = (data: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title || 'New Notification', {
        body: data.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: data.id, // Prevent duplicates
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to related content if available
        if (data.relatedEntityType === 'task' && data.relatedEntityId) {
          window.location.href = `/tasks/${data.relatedEntityId}`;
        }
        notification.close();
      };
    }
  };

  useEffect(() => {
    // Only connect if we have a token and active workspace
    if (!token || !activeWorkspace?.id) {
      console.log('[NotificationStream] Not connecting - missing token or workspace');
      return;
    }

    const connect = () => {
      try {
        console.log('[NotificationStream] Connecting to SSE stream...');
        
        // Close existing connection if any
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // Create new EventSource connection
        // Note: EventSource doesn't support custom headers, so we pass token as query param
        const url = `/api/v1/notifications/stream?token=${token}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('[NotificationStream] Connected successfully');
          reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('[NotificationStream] Received event:', data);

            // Handle different event types
            if (data.type === 'connected') {
              console.log('[NotificationStream] Connection confirmed');
              return;
            }

            if (data.type === 'heartbeat') {
              // Heartbeat to keep connection alive
              return;
            }

            // New notification received
            console.log('[NotificationStream] New notification:', data);

            // Play sound
            playNotificationSound();

            // Show browser notification
            showBrowserNotification(data);

            // Invalidate notification queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
            queryClient.invalidateQueries({ 
              queryKey: notificationKeys.unreadCount(activeWorkspace.id) 
            });
          } catch (error) {
            console.error('[NotificationStream] Error parsing message:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('[NotificationStream] Connection error:', error);
          eventSource.close();
          eventSourceRef.current = null;

          // Attempt to reconnect with exponential backoff
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            console.log(`[NotificationStream] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            console.error('[NotificationStream] Max reconnect attempts reached');
          }
        };
      } catch (error) {
        console.error('[NotificationStream] Error creating EventSource:', error);
      }
    };

    // Initial connection
    connect();

    // Cleanup on unmount or dependency change
    return () => {
      console.log('[NotificationStream] Cleaning up connection');
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      reconnectAttemptsRef.current = 0;
    };
  }, [token, activeWorkspace?.id, queryClient]);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('[NotificationStream] Notification permission:', permission);
      });
    }
  }, []);
}
