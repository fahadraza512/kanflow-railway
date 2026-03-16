import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api';
import { showToast, showApiError } from '@/lib/toast';
import { CreateProjectDto, UpdateProjectDto, EntityId } from '@/types/api.types';

// Query keys
export const projectKeys = {
    all: ['projects'] as const,
    lists: () => [...projectKeys.all, 'list'] as const,
    list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
    byWorkspace: (workspaceId: EntityId) => [...projectKeys.lists(), 'workspace', workspaceId] as const,
    archived: (workspaceId: EntityId) => [...projectKeys.lists(), 'archived', workspaceId] as const,
    details: () => [...projectKeys.all, 'detail'] as const,
    detail: (id: EntityId) => [...projectKeys.details(), id] as const,
};

/**
 * Get projects by workspace
 */
export function useProjects(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: projectKeys.byWorkspace(workspaceId!),
        queryFn: () => projectService.getByWorkspace(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 0, // Always refetch for real-time updates
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
        placeholderData: (previousData) => previousData, // Keep old data while fetching
    });
}

/**
 * Get archived projects by workspace
 */
export function useArchivedProjects(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: projectKeys.archived(workspaceId!),
        queryFn: () => projectService.getArchivedByWorkspace(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData, // Keep old data while fetching
    });
}

/**
 * Get project by ID
 */
export function useProject(id: EntityId | null) {
    return useQuery({
        queryKey: projectKeys.detail(id!),
        queryFn: () => projectService.getById(id!),
        enabled: !!id,
        staleTime: 0, // Always consider data stale, refetch on mount
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Create project mutation
 */
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectDto) => projectService.createProject(data),
        onSuccess: (newProject) => {
            // Invalidate ALL project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: projectKeys.all,
                refetchType: 'all' // Refetch both active and inactive queries
            });
            
            showToast.success(`Project "${newProject.name}" created successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to create project');
        },
    });
}

/**
 * Update project mutation
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateProjectDto }) =>
            projectService.updateProject(id, data),
        onMutate: async ({ id, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });

            // Snapshot the previous value
            const previousProject = queryClient.getQueryData(projectKeys.detail(id));

            // Optimistically update to the new value
            if (previousProject) {
                queryClient.setQueryData(projectKeys.detail(id), (old: any) => ({
                    ...old,
                    ...data,
                }));
            }

            // Return context with the previous value
            return { previousProject, id };
        },
        onError: (error: any, variables, context) => {
            // Rollback to the previous value on error
            if (context?.previousProject) {
                queryClient.setQueryData(projectKeys.detail(context.id), context.previousProject);
            }
            showApiError(error, 'Failed to update project');
        },
        onSuccess: (updatedProject) => {
            // Invalidate ALL project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: projectKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Project updated successfully');
        },
        onSettled: (updatedProject) => {
            // Always refetch after error or success to ensure consistency
            if (updatedProject) {
                queryClient.invalidateQueries({ 
                    queryKey: projectKeys.detail(updatedProject.id),
                    refetchType: 'active'
                });
            }
        },
    });
}

/**
 * Archive project mutation
 */
export function useArchiveProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: EntityId) => projectService.archiveProject(id),
        onSuccess: (archivedProject) => {
            // Invalidate ALL project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: projectKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Project archived successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to archive project');
        },
    });
}

/**
 * Restore archived project mutation
 */
export function useRestoreProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: EntityId) => projectService.restoreProject(id),
        onSuccess: (restoredProject) => {
            // Invalidate ALL project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: projectKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Project restored successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to restore project');
        },
    });
}

/**
 * Delete project mutation
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, workspaceId }: { id: EntityId; workspaceId: EntityId }) =>
            projectService.deleteProject(id),
        onSuccess: (_, { id, workspaceId }) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
            // Invalidate ALL project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: projectKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Project deleted successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete project');
        },
    });
}
