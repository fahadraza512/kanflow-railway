import { useQuery } from '@tanstack/react-query';
import { workspaceMemberService, WorkspaceMember } from '@/services/api/workspace-member.service';
import { EntityId } from '@/types/api.types';

// Query keys
export const workspaceMemberKeys = {
    all: ['workspace-members'] as const,
    byWorkspace: (workspaceId: EntityId) => [...workspaceMemberKeys.all, workspaceId] as const,
};

/**
 * Options for useWorkspaceMembers hook
 */
export interface UseWorkspaceMembersOptions {
    refetchInterval?: number;
    enabled?: boolean;
    onError?: (error: any) => void;
}

/**
 * Get all members of a workspace
 */
export function useWorkspaceMembers(
    workspaceId: EntityId | null,
    options?: UseWorkspaceMembersOptions
) {
    return useQuery<WorkspaceMember[]>({
        queryKey: workspaceMemberKeys.byWorkspace(workspaceId!),
        queryFn: () => workspaceMemberService.getMembers(workspaceId!),
        enabled: !!workspaceId && (options?.enabled ?? true),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: options?.refetchInterval,
        // Retry configuration: 3 attempts with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff: 1s, 2s, 4s
        // Keep previous data during refetch to show last successful data
        placeholderData: (previousData) => previousData,
        // Call onError callback if all retries fail
        onError: options?.onError,
    });
}
