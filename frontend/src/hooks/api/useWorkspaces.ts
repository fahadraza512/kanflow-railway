import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceService } from '@/services/api';
import { showToast, showApiError } from '@/lib/toast';
import {
    CreateWorkspaceDto,
    UpdateWorkspaceDto,
    EntityId,
    UserRole,
} from '@/types/api.types';

// Query keys
export const workspaceKeys = {
    all: ['workspaces'] as const,
    lists: () => [...workspaceKeys.all, 'list'] as const,
    list: (filters: string) => [...workspaceKeys.lists(), { filters }] as const,
    details: () => [...workspaceKeys.all, 'detail'] as const,
    detail: (id: EntityId) => [...workspaceKeys.details(), id] as const,
    members: (id: EntityId) => [...workspaceKeys.detail(id), 'members'] as const,
};

/**
 * Get all workspaces for current user
 */
export function useWorkspaces() {
    return useQuery({
        queryKey: workspaceKeys.lists(),
        queryFn: () => workspaceService.getMyWorkspaces(),
        staleTime: 0, // Always fetch fresh data for real-time updates
        refetchInterval: 30000, // Poll every 30s to detect removals/deletions by others
        refetchIntervalInBackground: false, // Only poll when tab is active
    });
}

/**
 * Get workspace by ID
 */
export function useWorkspace(id: EntityId | null) {
    return useQuery({
        queryKey: workspaceKeys.detail(id!),
        queryFn: () => workspaceService.getById(id!),
        enabled: !!id,
        staleTime: 0, // Always fetch fresh data for real-time updates
    });
}

/**
 * Get workspace members
 */
export function useWorkspaceMembers(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: workspaceKeys.members(workspaceId!),
        queryFn: () => workspaceService.getMembers(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Create workspace mutation
 */
export function useCreateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWorkspaceDto) => workspaceService.createWorkspace(data),
        onSuccess: (newWorkspace) => {
            // CRITICAL: Add new workspace to store immediately
            // This ensures it appears alongside existing workspaces (owned + invited)
            const { addWorkspace, setActiveWorkspace } = require('@/store/useWorkspaceStore').useWorkspaceStore.getState();
            
            // Add to store (will not duplicate if already exists)
            addWorkspace(newWorkspace);
            
            // Set as active workspace
            setActiveWorkspace(newWorkspace);
            
            // Invalidate and refetch ALL workspaces to ensure consistency
            queryClient.invalidateQueries({ 
                queryKey: workspaceKeys.all,
                refetchType: 'all'
            });
            
            showToast.success(`Workspace "${newWorkspace.name}" created successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to create workspace');
        },
    });
}

/**
 * Update workspace mutation
 */
export function useUpdateWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateWorkspaceDto }) =>
            workspaceService.updateWorkspace(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: workspaceKeys.detail(id) });
            await queryClient.cancelQueries({ queryKey: workspaceKeys.lists() });

            // Snapshot previous values
            const previousWorkspace = queryClient.getQueryData(workspaceKeys.detail(id));
            const previousWorkspaces = queryClient.getQueryData(workspaceKeys.lists());

            // Optimistically update workspace detail
            queryClient.setQueryData(workspaceKeys.detail(id), (old: any) => {
                if (!old) return old;
                return { ...old, ...data };
            });

            // Optimistically update workspaces list
            queryClient.setQueryData(workspaceKeys.lists(), (old: any) => {
                if (!old) return old;
                return old.map((ws: any) => 
                    ws.id === id ? { ...ws, ...data } : ws
                );
            });

            return { previousWorkspace, previousWorkspaces };
        },
        onSuccess: (updatedWorkspace) => {
            // Update with server data immediately
            queryClient.setQueryData(workspaceKeys.detail(updatedWorkspace.id), updatedWorkspace);
            
            // Update the workspaces list with the new data
            queryClient.setQueryData(workspaceKeys.lists(), (old: any) => {
                if (!old) return old;
                return old.map((ws: any) => 
                    ws.id === updatedWorkspace.id ? updatedWorkspace : ws
                );
            });
            
            // Update workspace store
            const { workspaces, activeWorkspace, setWorkspaces, setActiveWorkspace } = require('@/store/useWorkspaceStore').useWorkspaceStore.getState();
            
            // Update workspaces array in store
            const updatedWorkspaces = workspaces.map((ws: any) => 
                ws.id === updatedWorkspace.id ? updatedWorkspace : ws
            );
            setWorkspaces(updatedWorkspaces);
            
            // Update active workspace if it's the one being updated
            if (activeWorkspace?.id === updatedWorkspace.id) {
                setActiveWorkspace(updatedWorkspace);
            }
            
            // Force refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(updatedWorkspace.id) });
            
            // Only show toast for non-logo updates (to avoid spam during logo upload)
            if (!updatedWorkspace.logo && updatedWorkspace.name) {
                showToast.success('Workspace updated successfully');
            }
        },
        onError: (error: any, { id }, context) => {
            // Rollback on error
            if (context?.previousWorkspace) {
                queryClient.setQueryData(workspaceKeys.detail(id), context.previousWorkspace);
            }
            if (context?.previousWorkspaces) {
                queryClient.setQueryData(workspaceKeys.lists(), context.previousWorkspaces);
            }
            showApiError(error, 'Failed to update workspace');
        },
    });
}

/**
 * Delete workspace mutation
 */
export function useDeleteWorkspace() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: EntityId) => workspaceService.deleteWorkspace(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: workspaceKeys.detail(deletedId) });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
            
            // Also invalidate all workspace-related queries
            queryClient.invalidateQueries({ 
                predicate: (query) => {
                    const key = query.queryKey;
                    return Array.isArray(key) && (key.includes('workspaces') || key.includes('my-workspaces'));
                }
            });
            
            showToast.success('Workspace deleted successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete workspace');
        },
    });
}

/**
 * Add member to workspace mutation
 */
export function useAddWorkspaceMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, email, role }: { workspaceId: EntityId; email: string; role: UserRole }) =>
            workspaceService.addMember(workspaceId, { email, role }),
        onSuccess: (_, { workspaceId }) => {
            // Invalidate members list
            queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
            
            showToast.success('Member added successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to add member');
        },
    });
}

/**
 * Update member role mutation
 */
export function useUpdateMemberRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, userId, role }: { workspaceId: EntityId; userId: EntityId; role: UserRole }) =>
            workspaceService.updateMemberRole(workspaceId, userId, role),
        onSuccess: (_, { workspaceId }) => {
            // Invalidate members list
            queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
            // Invalidate workspace list so the affected member's next poll gets the updated role
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId) });
            
            showToast.success('Member role updated successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update member role');
        },
    });
}

/**
 * Remove member from workspace mutation
 */
export function useRemoveWorkspaceMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, userId }: { workspaceId: EntityId; userId: EntityId }) =>
            workspaceService.removeMember(workspaceId, userId),
        onSuccess: (_, { workspaceId }) => {
            // Invalidate members list
            queryClient.invalidateQueries({ queryKey: workspaceKeys.members(workspaceId) });
            // Invalidate workspace list so the removed member's next poll drops the workspace
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            
            showToast.success('Member removed successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to remove member');
        },
    });
}

/**
 * Update workspace subscription mutation
 */
export function useUpdateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ 
            workspaceId, 
            subscription, 
            billingCycle 
        }: { 
            workspaceId: EntityId; 
            subscription: 'free' | 'pro';
            billingCycle?: 'monthly' | 'annual';
        }) => workspaceService.updateSubscription(workspaceId, { subscription, billingCycle }),
        onSuccess: (updatedWorkspace) => {
            // Invalidate workspace data
            queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(updatedWorkspace.id) });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            
            showToast.success('Subscription updated successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update subscription');
        },
    });
}

/**
 * Cancel workspace subscription mutation
 */
export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: EntityId) => workspaceService.cancelSubscription(workspaceId),
        onSuccess: (updatedWorkspace) => {
            // Invalidate workspace data
            queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(updatedWorkspace.id) });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            
            showToast.success('Subscription cancelled successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to cancel subscription');
        },
    });
}

/**
 * Reactivate workspace subscription mutation
 */
export function useReactivateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (workspaceId: EntityId) => workspaceService.reactivateSubscription(workspaceId),
        onSuccess: (updatedWorkspace) => {
            // Invalidate workspace data
            queryClient.invalidateQueries({ queryKey: workspaceKeys.detail(updatedWorkspace.id) });
            queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });
            
            showToast.success('Subscription reactivated successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to reactivate subscription');
        },
    });
}
