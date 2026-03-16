import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';

interface DashboardWorkspaceAddedEvent {
  userId: string;
  workspace: {
    id: string;
    name: string;
    memberCount: number;
  };
  timestamp: string;
}

/**
 * Hook to subscribe to dashboard workspace added events
 * Automatically invalidates dashboard cache when user joins a workspace
 */
export function useDashboardWorkspaceUpdates() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const handleWorkspaceAdded = useCallback(
    (event: DashboardWorkspaceAddedEvent) => {
      // Invalidate dashboard workspaces cache
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      // Invalidate user dashboard cache
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    // Subscribe to dashboard workspace added events
    const eventName = `user:${user.id}:workspace:added`;

    // In a real implementation, this would connect to a WebSocket or EventSource
    // For now, we'll use a simple event listener pattern
    const handleEvent = (event: CustomEvent) => {
      handleWorkspaceAdded(event.detail);
    };

    window.addEventListener(eventName, handleEvent as EventListener);

    return () => {
      window.removeEventListener(eventName, handleEvent as EventListener);
    };
  }, [user, handleWorkspaceAdded]);
}
