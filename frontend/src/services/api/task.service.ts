import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import {
    Task,
    CreateTaskDto,
    UpdateTaskDto,
    EntityId,
    FilterParams,
    PaginationParams,
} from '@/types/api.types';

class TaskService extends BaseService<Task> {
    constructor() {
        super('/tasks');
    }

    /**
     * Get tasks by board
     */
    async getByBoard(boardId: EntityId, filters?: FilterParams): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(this.endpoint, {
                params: { boardId, ...filters },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get tasks by list
     */
    async getByList(listId: EntityId): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(this.endpoint, {
                params: { listId },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get archived tasks by board
     */
    async getArchivedByBoard(boardId: EntityId): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(this.endpoint, {
                params: { boardId, archived: true },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get archived tasks by workspace
     */
    async getArchivedByWorkspace(workspaceId: EntityId): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(this.endpoint, {
                params: { workspaceId, archived: true },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get all tasks by workspace (including non-archived)
     */
    async getByWorkspace(workspaceId: EntityId): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(this.endpoint, {
                params: { workspaceId },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get tasks assigned to user
     */
    async getMyTasks(filters?: FilterParams & PaginationParams): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(`${this.endpoint}/my`, {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get overdue tasks
     */
    async getOverdueTasks(workspaceId?: EntityId): Promise<Task[]> {
        try {
            const response = await apiClient.get<ApiResponse<Task[]>>(`${this.endpoint}/overdue`, {
                params: { workspaceId },
            });
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new task
     */
    async createTask(data: CreateTaskDto): Promise<Task> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update task
     */
    async updateTask(id: EntityId, data: UpdateTaskDto): Promise<Task> {
        try {
            console.log('[TaskService.updateTask] Calling update with id:', id, 'data:', data);
            const result = await this.update(id, data);
            console.log('[TaskService.updateTask] Update successful, result:', result);
            return result;
        } catch (error) {
            console.error('[TaskService.updateTask] Update failed:', error);
            throw handleApiError(error);
        }
    }

    /**
     * Move task to different list
     */
    async moveTask(id: EntityId, listId: EntityId, position: number): Promise<Task> {
        try {
            return await this.update(id, { listId, position });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Archive task
     */
    async archiveTask(id: EntityId): Promise<Task> {
        try {
            return await this.update(id, { isArchived: true });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Restore archived task
     */
    async restoreTask(id: EntityId): Promise<Task> {
        try {
            return await this.update(id, { isArchived: false });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete task
     */
    async deleteTask(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Bulk update tasks
     */
    async bulkUpdate(updates: Array<{ id: EntityId; data: UpdateTaskDto }>): Promise<Task[]> {
        try {
            const response = await apiClient.put<ApiResponse<Task[]>>(
                `${this.endpoint}/bulk`,
                updates
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const taskService = new TaskService();
