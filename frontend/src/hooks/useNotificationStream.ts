import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationKeys } from './api/useNotifications';

/**
 * Global notification stream — connected at the USER level, not workspace level.
 * Subscribes once on login and stays connected regardless of which workspace is active.
 */
export function useNotificationStream() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  };

  const showBrowserNotification = (data: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Include workspace name in title so user knows which workspace it's from
      const workspaceName = data.workspaceName || data.metadata?.workspaceName;
      const title = workspaceName
        ? `[${workspaceName}] ${data.title || 'New Notification'}`
        : (data.title || 'New Notification');

      const notification = new Notification(title, {
        body: data.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: data.id,
        requireInteraction: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  useEffect(() => {
    // Connect as soon as we have a token — no workspace required
    if (!token) {
      return;
    }

    const connect = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        const url = `/api/v1/notifications/stream?token=${token}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          reconnectAttemptsRef.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'connected' || data.type === 'heartbeat') return;

            // New notification — play sound and show browser notification
            playNotificationSound();
            showBrowserNotification(data);

            // Invalidate global (user-level) notification queries
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          } catch {}
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          }
        };
      } catch {}
    };

    connect();

    return () => {
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
  }, [token, queryClient]); // token only — no workspace dependency

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}
