import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

interface WorkspaceMemberAddedEvent {
  workspaceId: string;
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  timestamp: string;
}

/**
 * Hook to subscribe to workspace member added events
 * Automatically invalidates member list cache when new member joins
 */
export function useWorkspaceMemberUpdates(workspaceId: string) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const handleMemberAdded = useCallback(
    (event: WorkspaceMemberAddedEvent) => {
      // Invalidate workspace members cache
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'members'],
      });

      // Invalidate workspace details cache
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId],
      });
    },
    [workspaceId, queryClient],
  );

  useEffect(() => {
    if (!user || !workspaceId) {
      return;
    }

    // Subscribe to workspace member added events
    const eventName = `workspace:${workspaceId}:member:added`;

    // In a real implementation, this would connect to a WebSocket or EventSource
    // For now, we'll use a simple event listener pattern
    const handleEvent = (event: CustomEvent) => {
      handleMemberAdded(event.detail);
    };

    window.addEventListener(eventName, handleEvent as EventListener);

    return () => {
      window.removeEventListener(eventName, handleEvent as EventListener);
    };
  }, [user, workspaceId, handleMemberAdded]);
}
