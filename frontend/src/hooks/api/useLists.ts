import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '@/services/api/list.service';
import { showToast, showApiError } from '@/lib/toast';
import { EntityId } from '@/types/api.types';
import type { CreateListDto, UpdateListDto } from '@/services/api/list.service';

// Query keys
export const listKeys = {
    all: ['lists'] as const,
    lists: () => [...listKeys.all, 'list'] as const,
    byBoard: (boardId: EntityId) => [...listKeys.lists(), 'board', boardId] as const,
    detail: (id: EntityId) => [...listKeys.all, 'detail', id] as const,
};

/**
 * Get lists by board
 */
export function useLists(boardId: EntityId | null) {
    return useQuery({
        queryKey: listKeys.byBoard(boardId!),
        queryFn: () => listService.getByBoard(boardId!),
        enabled: !!boardId,
        staleTime: 0, // Always refetch for real-time updates
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });
}

/**
 * Get list by ID
 */
export function useList(id: EntityId | null) {
    return useQuery({
        queryKey: listKeys.detail(id!),
        queryFn: () => listService.getById(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Create list mutation
 */
export function useCreateList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateListDto) => listService.createList(data),
        onSuccess: (newList) => {
            queryClient.invalidateQueries({ queryKey: listKeys.byBoard(newList.boardId) });
            showToast.success(`List "${newList.name}" created successfully`);
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to create list');
        },
    });
}

/**
 * Update list mutation
 */
export function useUpdateList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateListDto }) =>
            listService.updateList(id, data),
        onSuccess: (updatedList) => {
            queryClient.invalidateQueries({ queryKey: listKeys.detail(updatedList.id) });
            queryClient.invalidateQueries({ queryKey: listKeys.byBoard(updatedList.boardId) });
            showToast.success('List updated successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update list');
        },
    });
}

/**
 * Delete list mutation
 */
export function useDeleteList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, boardId }: { id: EntityId; boardId: EntityId }) =>
            listService.deleteList(id),
        onSuccess: (_, { boardId }) => {
            queryClient.invalidateQueries({ queryKey: listKeys.byBoard(boardId) });
            showToast.success('List deleted successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete list');
        },
    });
}

/**
 * Reorder lists mutation
 */
export function useReorderLists() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, listIds }: { boardId: EntityId; listIds: string[] }) =>
            listService.reorderLists(boardId, listIds),
        onSuccess: (_, { boardId }) => {
            queryClient.invalidateQueries({ queryKey: listKeys.byBoard(boardId) });
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to reorder lists');
        },
    });
}
