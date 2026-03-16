import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '@/services/api/board.service';
import { showToast, showApiError } from '@/lib/toast';
import { CreateBoardDto, UpdateBoardDto, EntityId } from '@/types/api.types';

// Query keys
export const boardKeys = {
    all: ['boards'] as const,
    lists: () => [...boardKeys.all, 'list'] as const,
    list: (filters: string) => [...boardKeys.lists(), { filters }] as const,
    byProject: (projectId: EntityId) => [...boardKeys.lists(), 'project', projectId] as const,
    archived: (projectId: EntityId) => [...boardKeys.lists(), 'archived', projectId] as const,
    details: () => [...boardKeys.all, 'detail'] as const,
    detail: (id: EntityId) => [...boardKeys.details(), id] as const,
};

/**
 * Get boards by project
 */
export function useBoards(projectId: EntityId | null) {
    return useQuery({
        queryKey: boardKeys.byProject(projectId!),
        queryFn: () => boardService.getByProject(projectId!),
        enabled: !!projectId,
        staleTime: 0, // Always refetch for real-time updates
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Get archived boards by project
 */
export function useArchivedBoards(projectId: EntityId | null, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: boardKeys.archived(projectId!),
        queryFn: () => boardService.getArchivedByProject(projectId!),
        enabled: options?.enabled !== undefined ? (!!projectId && options.enabled) : !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Get board by ID
 */
export function useBoard(id: EntityId | null) {
    return useQuery({
        queryKey: boardKeys.detail(id!),
        queryFn: () => boardService.getById(id!),
        enabled: !!id,
        staleTime: 0, // Always refetch to get latest board name
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when window regains focus
    });
}

/**
 * Create board mutation
 */
export function useCreateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateBoardDto) => boardService.createBoard(data),
        onSuccess: (newBoard) => {
            // Invalidate ALL board and project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['projects'],
                refetchType: 'all'
            });
            
            showToast.success(`Board "${newBoard.name}" created successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to create board');
        },
    });
}

/**
 * Update board mutation
 */
export function useUpdateBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateBoardDto }) =>
            boardService.updateBoard(id, data),
        onSuccess: (updatedBoard) => {
            // Invalidate ALL board queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Board updated successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update board');
        },
    });
}

/**
 * Archive board mutation
 */
export function useArchiveBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, projectId }: { id: EntityId; projectId: EntityId }) => 
            boardService.archiveBoard(id),
        onSuccess: (archivedBoard, { projectId }) => {
            // Invalidate ALL board and project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['projects'],
                refetchType: 'all'
            });
            
            showToast.success('Board archived successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to archive board');
        },
    });
}

/**
 * Restore archived board mutation
 */
export function useRestoreBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, projectId }: { id: EntityId; projectId: EntityId }) => 
            boardService.restoreBoard(id),
        onSuccess: (restoredBoard, { projectId }) => {
            // Invalidate ALL board and project queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['projects'],
                refetchType: 'all'
            });
            
            showToast.success('Board restored successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to restore board');
        },
    });
}

/**
 * Delete board mutation
 */
export function useDeleteBoard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, projectId }: { id: EntityId; projectId: EntityId }) =>
            boardService.deleteBoard(id),
        onSuccess: (_, { id, projectId }) => {
            // Remove from cache and invalidate ALL board and project queries
            queryClient.removeQueries({ queryKey: boardKeys.detail(id) });
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            queryClient.invalidateQueries({ 
                queryKey: ['projects'],
                refetchType: 'all'
            });
            
            showToast.success('Board deleted successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete board');
        },
    });
}

/**
 * Reorder boards mutation
 */
export function useReorderBoards() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ 
            projectId, 
            boardIds 
        }: { 
            projectId: EntityId; 
            boardIds: EntityId[];
        }) => boardService.reorderBoards(projectId, boardIds),
        onSuccess: (_, { projectId }) => {
            // Invalidate ALL board queries to ensure all workspace members see the change
            queryClient.invalidateQueries({ 
                queryKey: boardKeys.all,
                refetchType: 'all'
            });
            
            showToast.success('Boards reordered successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to reorder boards');
        },
    });
}
