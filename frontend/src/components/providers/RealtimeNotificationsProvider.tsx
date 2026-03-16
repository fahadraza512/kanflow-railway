'use client';

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

/**
 * Real-Time Notifications Provider
 * Wraps the useRealtimeNotifications hook in a component
 * to be used in the root layout
 */
export default function RealtimeNotificationsProvider() {
    useRealtimeNotifications();
    return null;
}
