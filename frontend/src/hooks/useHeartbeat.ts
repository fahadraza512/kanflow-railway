import { useEffect } from 'react';
import { apiClient } from '@/services/api/base.service';

/**
 * Custom hook to send periodic heartbeat requests to update user activity status
 * 
 * @param workspaceId - The ID of the workspace to send heartbeats for
 * @param enabled - Whether heartbeat tracking is enabled
 * 
 * Requirements: 1.1, 1.4, 6.3
 */
export function useHeartbeat(workspaceId: string | null, enabled: boolean) {
  useEffect(() => {
    // Don't start heartbeat if not enabled or no workspace ID
    if (!enabled || !workspaceId) {
      return;
    }

    // Function to send heartbeat
    const sendHeartbeat = async () => {
      try {
        await apiClient.post(`/workspaces/${workspaceId}/heartbeat`);
      } catch (error) {
        // Handle errors silently - log to console but don't disrupt user experience
        console.error('Heartbeat failed:', error);
      }
    };

    // Send initial heartbeat immediately on mount
    sendHeartbeat();

    // Set up interval to send heartbeat every 30 seconds
    const intervalId = setInterval(sendHeartbeat, 30000);

    // Clean up interval on unmount or when workspace changes
    return () => {
      clearInterval(intervalId);
    };
  }, [workspaceId, enabled]);
}
