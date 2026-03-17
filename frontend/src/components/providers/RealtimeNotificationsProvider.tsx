'use client';

import { useNotificationStream } from '@/hooks/useNotificationStream';

/**
 * App-level SSE connection — mounted ONCE in root layout, lives for the entire session.
 * Handles all workspaces, all pages, survives navigation and workspace switches.
 */
export default function RealtimeNotificationsProvider() {
    useNotificationStream();
    return null;
}
