import { apiClient, handleApiError, ApiResponse } from './base.service';
import { EntityId } from '@/types/api.types';

export interface WorkspaceMember {
    id: EntityId;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    status?: string;
    joinedAt?: string;
}

class WorkspaceMemberService {
    /**
     * Get all members of a workspace
     */
    async getMembers(workspaceId: EntityId): Promise<WorkspaceMember[]> {
        try {
            console.log('📡 [Frontend] Fetching workspace members');
            console.log('   workspaceId:', workspaceId);
            console.log('   API URL:', `/workspaces/${workspaceId}/members`);
            
            const response = await apiClient.get<ApiResponse<WorkspaceMember[]>>(
                `/workspaces/${workspaceId}/members`
            );
            
            console.log('📡 [Frontend] Raw response:', response);
            console.log('📡 [Frontend] Response data:', response.data);
            console.log('📡 [Frontend] Members data:', response.data.data);
            
            const members = response.data.data || [];
            console.log('✅ [Frontend] Extracted', members.length, 'member(s)');
            
            return members;
        } catch (error) {
            console.error('❌ [Frontend] Failed to fetch members:', error);
            throw handleApiError(error);
        }
    }
}

export const workspaceMemberService = new WorkspaceMemberService();
