import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { projectKeys } from './api/useProjects';
import { boardKeys } from './api/useBoards';
import { taskKeys } from './api/useTasks';

/**
 * Automatically refetch workspace data at regular intervals
 * for real-time sync in shared workspaces
 * 
 * This provides near real-time synchronization without WebSockets
 * by polling the server at regular intervals when the tab is active.
 * 
 * @param workspaceId - The active workspace ID
 * @param enabled - Whether polling is enabled (default: true)
 * @param interval - Polling interval in milliseconds (default: 5000ms = 5 seconds)
 */
export function useWorkspacePolling(
  workspaceId: string | number | null,
  enabled: boolean = true,
  interval: number = 5000
) {
  const queryClient = useQueryClient();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    if (!enabled || !workspaceId) return;

    console.log(`[Polling] Starting workspace polling for workspace ${workspaceId} (interval: ${interval}ms)`);

    // Track tab visibility
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      console.log(`[Polling] Tab visibility changed: ${isVisibleRef.current ? 'visible' : 'hidden'}`);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Poll at regular intervals
    const pollInterval = setInterval(() => {
      // Only poll if tab is visible
      if (!isVisibleRef.current) {
        console.log('[Polling] Skipping poll - tab is hidden');
        return;
      }

      console.log('[Polling] Refetching workspace data...');
      
      // Refetch all workspace-related queries
      // This will trigger automatic refetch for all active queries
      queryClient.invalidateQueries({
        queryKey: ['workspaces', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: projectKeys.byWorkspace(workspaceId),
      });
      
      queryClient.invalidateQueries({
        queryKey: boardKeys.all,
      });
      
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    }, interval);

    return () => {
      console.log('[Polling] Stopping workspace polling');
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [workspaceId, enabled, interval, queryClient]);
}
