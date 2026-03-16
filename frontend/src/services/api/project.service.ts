import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import { Project, CreateProjectDto, UpdateProjectDto, EntityId } from '@/types/api.types';

class ProjectService extends BaseService<Project> {
    constructor() {
        super('/projects');
    }

    /**
     * Get projects by workspace
     */
    async getByWorkspace(workspaceId: EntityId): Promise<Project[]> {
        try {
            const response = await apiClient.get<ApiResponse<Project[]>>(
                `${this.endpoint}?workspaceId=${workspaceId}`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get archived projects by workspace
     */
    async getArchivedByWorkspace(workspaceId: EntityId): Promise<Project[]> {
        try {
            const response = await apiClient.get<ApiResponse<Project[]>>(
                `${this.endpoint}?workspaceId=${workspaceId}&isArchived=true`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new project
     */
    async createProject(data: CreateProjectDto): Promise<Project> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update project
     */
    async updateProject(id: EntityId, data: UpdateProjectDto): Promise<Project> {
        try {
            return await this.update(id, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Archive project
     */
    async archiveProject(id: EntityId): Promise<Project> {
        try {
            return await this.update(id, { isArchived: true });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Restore archived project
     */
    async restoreProject(id: EntityId): Promise<Project> {
        try {
            return await this.update(id, { isArchived: false });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete project
     */
    async deleteProject(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get project members
     */
    async getMembers(projectId: string): Promise<any[]> {
        try {
            const response = await apiClient.get<ApiResponse<any[]>>(
                `${this.endpoint}/${projectId}/members`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Add member to project
     */
    async addMember(projectId: string, userId: string, role?: string): Promise<any> {
        try {
            const response = await apiClient.post<ApiResponse<any>>(
                `${this.endpoint}/${projectId}/members`,
                { userId, role: role || 'member' }
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Remove member from project
     */
    async removeMember(projectId: string, userId: string): Promise<void> {
        try {
            await apiClient.delete(
                `${this.endpoint}/${projectId}/members/${userId}`
            );
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const projectService = new ProjectService();
