import { BaseService, handleApiError, apiClient, ApiResponse } from './base.service';
import {
    Workspace,
    CreateWorkspaceDto,
    UpdateWorkspaceDto,
    EntityId,
    WorkspaceMember,
    UserRole,
} from '@/types/api.types';

class WorkspaceService extends BaseService<Workspace> {
    constructor() {
        super('/workspaces');
    }

    /**
     * Get workspaces for current user
     */
    async getMyWorkspaces(): Promise<Workspace[]> {
        try {
            // Backend /workspaces endpoint already filters by current user
            const response = await apiClient.get<ApiResponse<Workspace[]>>(`${this.endpoint}`);
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Create new workspace
     */
    async createWorkspace(data: CreateWorkspaceDto): Promise<Workspace> {
        try {
            return await this.create(data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update workspace
     */
    async updateWorkspace(id: EntityId, data: UpdateWorkspaceDto): Promise<Workspace> {
        try {
            return await this.update(id, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete workspace
     */
    async deleteWorkspace(id: EntityId): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get workspace members
     */
    async getMembers(workspaceId: EntityId): Promise<WorkspaceMember[]> {
        try {
            const response = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
                `${this.endpoint}/${workspaceId}/members`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Add member directly to workspace (accepts email or userId)
     */
    async addMember(
        workspaceId: EntityId,
        data: { email?: string; userId?: string; role: UserRole }
    ): Promise<WorkspaceMember> {
        try {
            // Convert role format from ADMIN/MEMBER to admin/member
            const roleMap: Record<string, string> = {
                'ADMIN': 'admin',
                'PROJECT_MANAGER': 'admin',
                'MEMBER': 'member',
                'VIEWER': 'member'
            };
            
            const response = await apiClient.post<ApiResponse<WorkspaceMember>>(
                `${this.endpoint}/${workspaceId}/members`,
                {
                    email: data.email,
                    userId: data.userId,
                    role: roleMap[data.role] || 'member'
                }
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update member role
     */
    async updateMemberRole(
        workspaceId: EntityId,
        userId: EntityId,
        role: UserRole
    ): Promise<WorkspaceMember> {
        try {
            const response = await apiClient.put<ApiResponse<WorkspaceMember>>(
                `${this.endpoint}/${workspaceId}/members/${userId}`,
                { role }
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Remove member from workspace
     */
    async removeMember(workspaceId: EntityId, userId: EntityId): Promise<void> {
        try {
            await apiClient.delete(`${this.endpoint}/${workspaceId}/members/${userId}`);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Update workspace subscription
     */
    async updateSubscription(
        workspaceId: EntityId,
        data: {
            subscription: 'free' | 'pro';
            billingCycle?: 'monthly' | 'annual';
        }
    ): Promise<Workspace> {
        try {
            const response = await apiClient.put<ApiResponse<Workspace>>(
                `${this.endpoint}/${workspaceId}/subscription`,
                data
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Cancel workspace subscription
     */
    async cancelSubscription(workspaceId: EntityId): Promise<Workspace> {
        try {
            const response = await apiClient.post<ApiResponse<Workspace>>(
                `${this.endpoint}/${workspaceId}/subscription/cancel`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Reactivate workspace subscription
     */
    async reactivateSubscription(workspaceId: EntityId): Promise<Workspace> {
        try {
            const response = await apiClient.post<ApiResponse<Workspace>>(
                `${this.endpoint}/${workspaceId}/subscription/reactivate`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const workspaceService = new WorkspaceService();
