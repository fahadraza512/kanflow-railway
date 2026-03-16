import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import { EntityId } from '@/types/api.types';

export interface List {
    id: string;
    boardId: string;
    name: string;
    position: number;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateListDto {
    boardId: string;
    name: string;
    position?: number;
}

export interface UpdateListDto {
    name?: string;
    position?: number;
}

export interface ReorderListsDto {
    listIds: string[];
}

class ListService extends BaseService<List> {
    constructor() {
        super('/lists');
    }

    /**
     * Get lists by board
     */
    async getByBoard(boardId: EntityId): Promise<List[]> {
        try {
            const response = await apiClient.get<ApiResponse<List[]>>(
                `${this.endpoint}/board/${boardId}`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new list
     */
    async createList(data: CreateListDto): Promise<List> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update list
     */
    async updateList(id: EntityId, data: UpdateListDto): Promise<List> {
        try {
            return await this.update(id, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete list
     */
    async deleteList(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Reorder lists within a board
     */
    async reorderLists(boardId: EntityId, listIds: string[]): Promise<void> {
        try {
            const response = await apiClient.post<ApiResponse<void>>(
                `${this.endpoint}/board/${boardId}/reorder`,
                { listIds }
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const listService = new ListService();
