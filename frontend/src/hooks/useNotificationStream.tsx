import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { notificationKeys } from './api/useNotifications';
import toast from 'react-hot-toast';
import { Notification } from '@/types/api.types';

/**
 * Global notification stream — user-level SSE connection.
 * On new notification: instantly writes into React Query cache (no HTTP round-trip).
 * Shows in-app toast. Handles reconnect with missed-notification sync.
 */
export function useNotificationStream() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const seenIdsRef = useRef<Set<string>>(new Set()); // dedup guard
  const maxReconnectAttempts = 10;

  // Reconnecting indicator state — exposed via a custom event so any component can read it
  const setReconnecting = (value: boolean) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification-stream-status', { detail: { reconnecting: value } }));
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {}
  };

  const showBrowserNotification = (data: Notification & { workspaceName?: string }) => {
    if (typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const workspaceName = data.workspaceName || (data.metadata as any)?.workspaceName;
      const title = workspaceName
        ? `[${workspaceName}] ${data.title || 'New Notification'}`
        : (data.title || 'New Notification');

      const n = new window.Notification(title, {
        body: data.message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: data.id,
        requireInteraction: false,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  };

  /**
   * Instantly inject a new notification into the React Query cache.
   * No HTTP request — the UI updates in the same render cycle.
   */
  const injectIntoCache = (notification: Notification) => {
    // Deduplicate
    if (seenIdsRef.current.has(notification.id)) return;
    seenIdsRef.current.add(notification.id);

    // 1. Prepend to the notifications list cache
    queryClient.setQueryData<Notification[]>(notificationKeys.list(), (old) => {
      const existing = Array.isArray(old) ? old : [];
      // Guard against duplicate already in cache
      if (existing.some(n => n.id === notification.id)) return existing;
      return [notification, ...existing];
    });

    // 2. Increment the unread count cache directly
    queryClient.setQueryData<number>(notificationKeys.unreadCount(), (old) => {
      return (typeof old === 'number' ? old : 0) + 1;
    });
  };

  /**
   * Show an in-app toast for the incoming notification.
   */
  const showInAppToast = (data: Notification & { workspaceName?: string }) => {
    const workspaceName = data.workspaceName || (data.metadata as any)?.workspaceName;
    const label = workspaceName ? `[${workspaceName}]` : '';

    toast(
      (t) => (
        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => toast.dismiss(t.id)}
        >
          <div className="flex-1 min-w-0">
            {label && (
              <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">{label}</p>
            )}
            <p className="text-xs font-semibold text-gray-900 leading-tight">{data.title || 'Notification'}</p>
            <p className="text-xs text-gray-600 leading-tight mt-0.5 line-clamp-2">{data.message}</p>
          </div>
        </div>
      ),
      {
        duration: 5000,
        icon: '🔔',
        style: { maxWidth: 320, padding: '10px 12px' },
      }
    );
  };

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      try {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        // SSE must connect directly to the backend — Next.js rewrites buffer SSE responses.
        const backendUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005').replace(/\/api\/v1\/?$/, '');
        const url = `${backendUrl}/api/v1/notifications/stream?token=${token}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          const isReconnect = reconnectAttemptsRef.current > 0;
          reconnectAttemptsRef.current = 0;
          setReconnecting(false);

          // On reconnect, sync any missed notifications
          if (isReconnect) {
            queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          }
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected' || data.type === 'heartbeat') return;

            const notification = data as Notification & { workspaceName?: string };

            // Instant cache write — no HTTP round-trip
            injectIntoCache(notification);

            // Sound + browser notification + in-app toast
            playNotificationSound();
            showBrowserNotification(notification);
            showInAppToast(notification);
          } catch {}
        };

        eventSource.onerror = () => {
          eventSource.close();
          eventSourceRef.current = null;

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            setReconnecting(true);
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
  }, [token, queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}

/**
 * Hook to read the reconnecting status from the stream.
 * Use in any component that wants to show a "Reconnecting..." indicator.
 */
export function useNotificationStreamStatus() {
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setReconnecting((e as CustomEvent).detail.reconnecting);
    };
    window.addEventListener('notification-stream-status', handler);
    return () => window.removeEventListener('notification-stream-status', handler);
  }, []);

  return { reconnecting };
}
