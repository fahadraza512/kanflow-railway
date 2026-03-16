import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import { EntityId } from '@/types/api.types';

export interface Comment {
    id: EntityId;
    taskId: EntityId;
    userId: EntityId;
    text: string;
    mentions: EntityId[];
    createdAt: string;
    updatedAt: string;
    user?: {
        id: EntityId;
        firstName: string;
        lastName: string;
        email: string;
        picture?: string;
    };
}

export interface CreateCommentDto {
    taskId: EntityId;
    text: string;
    mentions?: EntityId[];
}

export interface UpdateCommentDto {
    text: string;
    mentions?: EntityId[];
}

class CommentService extends BaseService<Comment> {
    constructor() {
        super('/comments');
    }

    /**
     * Get comments by task
     */
    async getByTask(taskId: EntityId): Promise<Comment[]> {
        try {
            const response = await apiClient.get<ApiResponse<Comment[]>>(this.endpoint, {
                params: { taskId },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new comment
     */
    async createComment(data: CreateCommentDto): Promise<Comment> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update comment
     */
    async updateComment(id: EntityId, data: UpdateCommentDto): Promise<Comment> {
        try {
            return await this.update(id, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete comment
     */
    async deleteComment(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const commentService = new CommentService();
