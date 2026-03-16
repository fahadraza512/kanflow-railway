import { useQuery } from '@tanstack/react-query';
import { activityService, ActivityLog } from '@/services/api/activity.service';

// Query keys
export const activityKeys = {
    all: ['activity'] as const,
    byTask: (taskId: string) => [...activityKeys.all, 'task', taskId] as const,
    byWorkspace: (workspaceId: string, limit?: number) =>
        [...activityKeys.all, 'workspace', workspaceId, limit] as const,
    byProject: (projectId: string, limit?: number) =>
        [...activityKeys.all, 'project', projectId, limit] as const,
};

/**
 * Hook to get activity logs for a task
 */
export function useTaskActivity(taskId: string) {
    return useQuery<ActivityLog[]>({
        queryKey: activityKeys.byTask(taskId),
        queryFn: () => activityService.getByTask(taskId),
        enabled: !!taskId,
    });
}

/**
 * Hook to get activity logs for a workspace
 */
export function useWorkspaceActivity(workspaceId: string, limit?: number) {
    return useQuery<ActivityLog[]>({
        queryKey: activityKeys.byWorkspace(workspaceId, limit),
        queryFn: () => activityService.getByWorkspace(workspaceId, limit),
        enabled: !!workspaceId,
    });
}

/**
 * Hook to get activity logs for a project
 */
export function useProjectActivity(projectId: string, limit?: number) {
    return useQuery<ActivityLog[]>({
        queryKey: activityKeys.byProject(projectId, limit),
        queryFn: () => activityService.getByProject(projectId, limit),
        enabled: !!projectId,
    });
}
