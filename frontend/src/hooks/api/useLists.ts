import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '@/services/api/list.service';
import { showToast, showApiError } from '@/lib/toast';
import { EntityId } from '@/types/api.types';
import type { CreateListDto, UpdateListDto, List } from '@/services/api/list.service';
import { boardKeys } from './useBoards';

// Query keys
export const listKeys = {
    all: ['lists'] as const,
    lists: () => [...listKeys.all, 'list'] as const,
    byBoard: (boardId: EntityId) => [...listKeys.lists(), 'board', boardId] as const,
    detail: (id: EntityId) => [...listKeys.all, 'detail', id] as const,
};

/** Helper: update the lists array embedded inside the board detail cache */
function patchBoardLists(
    queryClient: ReturnType<typeof useQueryClient>,
    boardId: EntityId,
    updater: (lists: List[]) => List[],
) {
    queryClient.setQueryData<any>(boardKeys.detail(boardId), (old: any) => {
        if (!old) return old;
        return { ...old, lists: updater(old.lists ?? []) };
    });
}

/**
 * Get lists by board
 */
export function useLists(boardId: EntityId | null) {
    return useQuery({
        queryKey: listKeys.byBoard(boardId!),
        queryFn: () => listService.getByBoard(boardId!),
        enabled: !!boardId,
        staleTime: 0,
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
 * Create list — optimistic update
 */
export function useCreateList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateListDto) => listService.createList(data),

        onMutate: async (data) => {
            await queryClient.cancelQueries({ queryKey: listKeys.byBoard(data.boardId) });

            const previous = queryClient.getQueryData<List[]>(listKeys.byBoard(data.boardId));

            // Optimistic placeholder with a temp id
            const optimistic: List = {
                id: `temp-${Date.now()}`,
                boardId: data.boardId,
                name: data.name,
                position: (previous?.length ?? 0) + 1,
                createdAt: new Date().toISOString(),
            };

            queryClient.setQueryData<List[]>(listKeys.byBoard(data.boardId), (old) =>
                [...(old ?? []), optimistic]
            );
            patchBoardLists(queryClient, data.boardId, (lists) => [...lists, optimistic]);

            return { previous, boardId: data.boardId };
        },

        onError: (_err, data, ctx) => {
            // Roll back
            if (ctx?.previous !== undefined) {
                queryClient.setQueryData(listKeys.byBoard(data.boardId), ctx.previous);
                patchBoardLists(queryClient, data.boardId, () => ctx.previous ?? []);
            }
            showApiError(_err, 'Failed to create column');
        },

        onSuccess: (newList, data) => {
            // Replace optimistic entry with real one
            queryClient.setQueryData<List[]>(listKeys.byBoard(data.boardId), (old) =>
                (old ?? []).map(l => l.id.startsWith('temp-') ? newList : l)
            );
            patchBoardLists(queryClient, data.boardId, (lists) =>
                lists.map(l => l.id.startsWith('temp-') ? newList : l)
            );
            showToast.success(`Column "${newList.name}" added`);
        },
    });
}

/**
 * Update list — optimistic update
 */
export function useUpdateList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateListDto }) =>
            listService.updateList(id, data),

        onMutate: async ({ id, data }) => {
            // Find boardId from cache
            const allBoards = queryClient.getQueriesData<List[]>({ queryKey: listKeys.lists() });
            let boardId: string | undefined;
            let previous: List[] | undefined;

            for (const [key, lists] of allBoards) {
                if (Array.isArray(lists) && lists.some(l => l.id === id)) {
                    boardId = lists.find(l => l.id === id)?.boardId;
                    previous = lists;
                    break;
                }
            }

            if (boardId) {
                await queryClient.cancelQueries({ queryKey: listKeys.byBoard(boardId) });

                queryClient.setQueryData<List[]>(listKeys.byBoard(boardId), (old) =>
                    (old ?? []).map(l => l.id === id ? { ...l, ...data } : l)
                );
                patchBoardLists(queryClient, boardId, (lists) =>
                    lists.map(l => l.id === id ? { ...l, ...data } : l)
                );
            }

            return { previous, boardId };
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.boardId && ctx?.previous) {
                queryClient.setQueryData(listKeys.byBoard(ctx.boardId), ctx.previous);
                patchBoardLists(queryClient, ctx.boardId, () => ctx.previous ?? []);
            }
            showApiError(_err, 'Failed to rename column');
        },

        onSuccess: (updatedList) => {
            // Sync with server value
            queryClient.setQueryData<List[]>(listKeys.byBoard(updatedList.boardId), (old) =>
                (old ?? []).map(l => l.id === updatedList.id ? updatedList : l)
            );
            patchBoardLists(queryClient, updatedList.boardId, (lists) =>
                lists.map(l => l.id === updatedList.id ? updatedList : l)
            );
        },
    });
}

/**
 * Delete list — optimistic update
 */
export function useDeleteList() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, boardId }: { id: EntityId; boardId: EntityId }) =>
            listService.deleteList(id),

        onMutate: async ({ id, boardId }) => {
            await queryClient.cancelQueries({ queryKey: listKeys.byBoard(boardId) });

            const previous = queryClient.getQueryData<List[]>(listKeys.byBoard(boardId));

            queryClient.setQueryData<List[]>(listKeys.byBoard(boardId), (old) =>
                (old ?? []).filter(l => l.id !== id)
            );
            patchBoardLists(queryClient, boardId, (lists) => lists.filter(l => l.id !== id));

            return { previous, boardId };
        },

        onError: (_err, { boardId }, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(listKeys.byBoard(boardId), ctx.previous);
                patchBoardLists(queryClient, boardId, () => ctx.previous ?? []);
            }
            showApiError(_err, 'Failed to delete column');
        },

        onSuccess: (_, { boardId }) => {
            showToast.success('Column deleted');
            // Soft sync — don't force a full refetch
            queryClient.invalidateQueries({ queryKey: listKeys.byBoard(boardId), refetchType: 'none' });
        },
    });
}

/**
 * Reorder lists — optimistic update
 */
export function useReorderLists() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ boardId, listIds }: { boardId: EntityId; listIds: string[] }) =>
            listService.reorderLists(boardId, listIds),

        onMutate: async ({ boardId, listIds }) => {
            await queryClient.cancelQueries({ queryKey: listKeys.byBoard(boardId) });

            const previous = queryClient.getQueryData<List[]>(listKeys.byBoard(boardId));

            // Reorder in cache immediately
            queryClient.setQueryData<List[]>(listKeys.byBoard(boardId), (old) => {
                if (!old) return old;
                const map = new Map(old.map(l => [l.id, l]));
                return listIds.map((id, i) => ({ ...map.get(id)!, position: i + 1 })).filter(Boolean);
            });

            return { previous, boardId };
        },

        onError: (_err, { boardId }, ctx) => {
            if (ctx?.previous) {
                queryClient.setQueryData(listKeys.byBoard(boardId), ctx.previous);
            }
            showApiError(_err, 'Failed to reorder columns');
        },
    });
}
