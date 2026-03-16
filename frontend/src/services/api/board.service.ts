import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import { Board, CreateBoardDto, UpdateBoardDto, EntityId } from '@/types/api.types';

class BoardService extends BaseService<Board> {
    constructor() {
        super('/boards');
    }

    /**
     * Get boards by project
     */
    async getByProject(projectId: EntityId): Promise<Board[]> {
        try {
            const response = await apiClient.get<ApiResponse<Board[]>>(this.endpoint, {
                params: { projectId },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get archived boards by project
     */
    async getArchivedByProject(projectId: EntityId): Promise<Board[]> {
        try {
            const response = await apiClient.get<ApiResponse<Board[]>>(this.endpoint, {
                params: { projectId, archived: true },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new board
     */
    async createBoard(data: CreateBoardDto): Promise<Board> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update board
     */
    async updateBoard(id: EntityId, data: UpdateBoardDto): Promise<Board> {
        try {
            return await this.update(id, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Archive board
     */
    async archiveBoard(id: EntityId): Promise<Board> {
        try {
            const response = await apiClient.post<ApiResponse<Board>>(
                `${this.endpoint}/${id}/archive`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Restore archived board
     */
    async restoreBoard(id: EntityId): Promise<Board> {
        try {
            const response = await apiClient.post<ApiResponse<Board>>(
                `${this.endpoint}/${id}/restore`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete board
     */
    async deleteBoard(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Reorder boards
     */
    async reorderBoards(projectId: EntityId, boardIds: EntityId[]): Promise<void> {
        try {
            const response = await apiClient.patch<ApiResponse<void>>(
                `${this.endpoint}/reorder`,
                { boardIds },
                { params: { projectId } }
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const boardService = new BoardService();
