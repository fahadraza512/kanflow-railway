import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/api';
import { showToast, showApiError } from '@/lib/toast';
import {
    CreateTaskDto,
    UpdateTaskDto,
    EntityId,
    FilterParams,
    PaginationParams,
} from '@/types/api.types';
import { analyticsKeys } from './useAnalyticsApi';

// Query keys
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
    byBoard: (boardId: EntityId) => [...taskKeys.lists(), 'board', boardId] as const,
    byWorkspace: (workspaceId: EntityId) => [...taskKeys.lists(), 'workspace', workspaceId] as const,
    byList: (listId: EntityId) => [...taskKeys.lists(), 'list', listId] as const,
    archived: (boardId: EntityId) => [...taskKeys.lists(), 'archived', boardId] as const,
    archivedByWorkspace: (workspaceId: EntityId) => [...taskKeys.lists(), 'archived-workspace', workspaceId] as const,
    myTasks: () => [...taskKeys.lists(), 'my-tasks'] as const,
    overdue: (workspaceId?: EntityId) => [...taskKeys.lists(), 'overdue', workspaceId] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: EntityId) => [...taskKeys.details(), id] as const,
};

/**
 * Get tasks by board
 */
export function useTasks(boardId: EntityId | null, filters?: FilterParams) {
    return useQuery({
        queryKey: [...taskKeys.byBoard(boardId!), filters],
        queryFn: () => taskService.getByBoard(boardId!, filters),
        enabled: !!boardId,
        staleTime: 30000, // 30 seconds - reduce unnecessary refetches
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Get all tasks by workspace
 */
export function useTasksByWorkspace(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: taskKeys.byWorkspace(workspaceId!),
        queryFn: () => taskService.getByWorkspace(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 0, // Always refetch for real-time updates
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Get tasks by list
 */
export function useTasksByList(listId: EntityId | null) {
    return useQuery({
        queryKey: taskKeys.byList(listId!),
        queryFn: () => taskService.getByList(listId!),
        enabled: !!listId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Get archived tasks by board
 */
export function useArchivedTasks(boardId: EntityId | null) {
    return useQuery({
        queryKey: taskKeys.archived(boardId!),
        queryFn: () => taskService.getArchivedByBoard(boardId!),
        enabled: !!boardId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Get archived tasks by workspace
 */
export function useArchivedTasksByWorkspace(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: taskKeys.archivedByWorkspace(workspaceId!),
        queryFn: () => taskService.getArchivedByWorkspace(workspaceId!),
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Get tasks assigned to current user
 */
export function useMyTasks(filters?: FilterParams & PaginationParams) {
    return useQuery({
        queryKey: [...taskKeys.myTasks(), filters],
        queryFn: () => taskService.getMyTasks(filters),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Get overdue tasks
 */
export function useOverdueTasks(workspaceId?: EntityId) {
    return useQuery({
        queryKey: taskKeys.overdue(workspaceId),
        queryFn: () => taskService.getOverdueTasks(workspaceId),
        enabled: !!workspaceId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Get task by ID
 */
export function useTask(id: EntityId | null) {
    return useQuery({
        queryKey: taskKeys.detail(id!),
        queryFn: () => taskService.getById(id!),
        enabled: !!id,
        staleTime: 0, // Always refetch for real-time updates
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Create task mutation
 */
export function useCreateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTaskDto) => taskService.createTask(data),
        onSuccess: (newTask) => {
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            // Invalidate analytics to update stats
            queryClient.invalidateQueries({ 
                queryKey: analyticsKeys.all,
                refetchType: 'all'
            });
            
            showToast.success(`Task "${newTask.title}" created successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to create task');
        },
    });
}

/**
 * Update task mutation with optimistic updates
 */
export function useUpdateTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateTaskDto }) => {
            console.log('[useUpdateTask.mutationFn] Called with id:', id, 'data:', data);
            return taskService.updateTask(id, data);
        },
        // Optimistic update
        onMutate: async ({ id, data }) => {
            console.log('[useUpdateTask.onMutate] Starting optimistic update for id:', id, 'data:', data);
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: taskKeys.detail(id) });
            
            // Snapshot previous value
            const previousTask = queryClient.getQueryData(taskKeys.detail(id));
            
            // Optimistically update the cache
            queryClient.setQueryData(taskKeys.detail(id), (old: any) => ({
                ...old,
                ...data,
                // If unassigning, also clear the assignee relation
                assignee: data.assigneeId === null ? null : old?.assignee,
            }));
            
            // Return context with previous value
            return { previousTask, id };
        },
        onSuccess: (updatedTask, { data, id }) => {
            console.log('[useUpdateTask.onSuccess] Task updated successfully:', updatedTask);
            
            // CRITICAL: Update the cache with the actual server response
            // This prevents polling from overwriting with stale data
            queryClient.setQueryData(taskKeys.detail(id), updatedTask);
            
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            // Invalidate analytics to update stats
            queryClient.invalidateQueries({ 
                queryKey: analyticsKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Task updated successfully');
        },
        // Rollback on error
        onError: (error: any, variables, context) => {
            console.error('[useUpdateTask.onError] Update failed:', error);
            if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(context.id), context.previousTask);
            }
            showApiError(error, 'Failed to update task');
        },
    });
}

/**
 * Move task to different list mutation
 */
export function useMoveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, listId, position }: { id: EntityId; listId: EntityId; position: number }) =>
            taskService.moveTask(id, listId, position),
        onSuccess: (movedTask, { listId: oldListId }) => {
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Task moved successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to move task');
        },
    });
}

/**
 * Archive task mutation
 */
export function useArchiveTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: EntityId) => taskService.archiveTask(id),
        onSuccess: (archivedTask) => {
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            // Invalidate analytics to update stats
            queryClient.invalidateQueries({ 
                queryKey: analyticsKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Task archived successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to archive task');
        },
    });
}

/**
 * Restore archived task mutation
 */
export function useRestoreTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: EntityId) => taskService.restoreTask(id),
        onSuccess: (restoredTask) => {
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Task restored successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to restore task');
        },
    });
}

/**
 * Delete task mutation
 */
export function useDeleteTask() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, boardId, listId }: { id: EntityId; boardId: EntityId; listId: EntityId }) =>
            taskService.deleteTask(id),
        onSuccess: (_, { id, boardId, listId }) => {
            // Remove from cache and invalidate ALL task queries
            queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Task deleted successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete task');
        },
    });
}

/**
 * Bulk update tasks mutation
 */
export function useBulkUpdateTasks() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updates: Array<{ id: EntityId; data: UpdateTaskDto }>) =>
            taskService.bulkUpdate(updates),
        onSuccess: (updatedTasks) => {
            // Invalidate ALL task queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: taskKeys.all,
                refetchType: 'all'
            });
            
            showToast.success(`${updatedTasks.length} tasks updated successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update tasks');
        },
    });
}
