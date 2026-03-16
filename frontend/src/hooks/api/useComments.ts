import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentService, Comment, CreateCommentDto, UpdateCommentDto } from '@/services/api/comment.service';
import { showToast, showApiError } from '@/lib/toast';
import { EntityId } from '@/types/api.types';

// Query keys
export const commentKeys = {
    all: ['comments'] as const,
    byTask: (taskId: EntityId) => [...commentKeys.all, 'task', taskId] as const,
    detail: (id: EntityId) => [...commentKeys.all, 'detail', id] as const,
};

/**
 * Get comments by task
 */
export function useComments(taskId: EntityId | null) {
    return useQuery<Comment[]>({
        queryKey: commentKeys.byTask(taskId!),
        queryFn: () => commentService.getByTask(taskId!),
        enabled: !!taskId,
        staleTime: 30 * 1000, // 30 seconds
    });
}

/**
 * Create comment mutation
 */
export function useCreateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCommentDto) => commentService.createComment(data),
        onSuccess: (newComment) => {
            // Invalidate comments list for this task
            queryClient.invalidateQueries({ queryKey: commentKeys.byTask(newComment.taskId) });
            showToast.success('Comment added');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to add comment');
        },
    });
}

/**
 * Update comment mutation
 */
export function useUpdateComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: EntityId; data: UpdateCommentDto }) =>
            commentService.updateComment(id, data),
        onSuccess: (updatedComment) => {
            // Invalidate comments list for this task
            queryClient.invalidateQueries({ queryKey: commentKeys.byTask(updatedComment.taskId) });
            queryClient.invalidateQueries({ queryKey: commentKeys.detail(updatedComment.id) });
            showToast.success('Comment updated');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to update comment');
        },
    });
}

/**
 * Delete comment mutation
 */
export function useDeleteComment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, taskId }: { id: EntityId; taskId: EntityId }) =>
            commentService.deleteComment(id),
        onSuccess: (_, { taskId }) => {
            // Invalidate comments list for this task
            queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) });
            showToast.success('Comment deleted');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete comment');
        },
    });
}
