import { apiClient } from './base.service';

// Backend activity structure
interface BackendActivity {
    id: string;
    action: string;
    resourceType: string;
    resourceId: string;
    resourceName: string;
    userId: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        picture?: string;
    };
    workspaceId?: string;
    projectId?: string;
    metadata?: any;
    description?: string;
    createdAt: string;
}

// Frontend activity structure
export interface ActivityLog {
    id: string | number;
    taskId: string | number;
    userId: string | number;
    userName: string;
    userAvatar?: string;
    action: 'created' | 'moved' | 'assigned' | 'commented' | 'updated' | 'completed' | 'archived' | 'restored';
    detail: string;
    createdAt: string;
}

// Map backend activity to frontend format
function mapActivity(activity: BackendActivity): ActivityLog {
    return {
        id: activity.id,
        taskId: activity.resourceId,
        userId: activity.userId,
        userName: activity.user 
            ? `${activity.user.firstName} ${activity.user.lastName}`
            : 'Unknown User',
        userAvatar: activity.user?.picture,
        action: activity.action as any,
        detail: activity.description || activity.resourceName || '',
        createdAt: activity.createdAt,
    };
}

export const activityService = {
    /**
     * Get activity logs for a task
     * @param taskId - Task ID
     * @returns Array of activity logs
     */
    getByTask: async (taskId: string): Promise<ActivityLog[]> => {
        const response = await apiClient.get<BackendActivity[]>(`/activities/task/${taskId}`);
        // Backend returns array directly, not wrapped in { data: ... }
        const activities = Array.isArray(response.data) ? response.data : [];
        return activities.map(mapActivity);
    },

    /**
     * Get activity logs for a workspace
     * @param workspaceId - Workspace ID
     * @param limit - Number of logs to return (optional)
     * @returns Array of activity logs
     */
    getByWorkspace: async (workspaceId: string, limit?: number): Promise<ActivityLog[]> => {
        const response = await apiClient.get<{ data: ActivityLog[] }>(
            `/workspaces/${workspaceId}/activity`,
            {
                params: { limit },
            }
        );
        return response.data.data;
    },

    /**
     * Get activity logs for a project
     * @param projectId - Project ID
     * @param limit - Number of logs to return (optional)
     * @returns Array of activity logs
     */
    getByProject: async (projectId: string, limit?: number): Promise<ActivityLog[]> => {
        const response = await apiClient.get<{ data: ActivityLog[] }>(
            `/projects/${projectId}/activity`,
            {
                params: { limit },
            }
        );
        return response.data.data;
    },
};
