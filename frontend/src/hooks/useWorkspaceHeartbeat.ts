import { useEffect, useRef } from 'react';
import { apiClient } from '@/services/api/base.service';

/**
 * Hook to send periodic heartbeats to update user's active status in workspace
 * Sends heartbeat every 60 seconds when tab is active
 */
export function useWorkspaceHeartbeat(workspaceId: string | null) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!workspaceId) return;

    // Track if tab is active
    const handleVisibilityChange = () => {
      isActiveRef.current = !document.hidden;
      
      if (isActiveRef.current) {
        // Send immediate heartbeat when tab becomes active
        sendHeartbeat(workspaceId);
      }
    };

    // Send heartbeat function
    const sendHeartbeat = async (wsId: string) => {
      try {
        await apiClient.post(`/workspaces/${wsId}/heartbeat`);
        console.log('💓 Heartbeat sent for workspace:', wsId);
      } catch (error) {
        console.error('❌ Heartbeat failed:', error);
        // Don't throw - heartbeat failures shouldn't break the app
      }
    };

    // Send initial heartbeat
    sendHeartbeat(workspaceId);

    // Set up interval to send heartbeat every 60 seconds
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        sendHeartbeat(workspaceId);
      }
    }, 60 * 1000); // 60 seconds

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [workspaceId]);
}
