import { useQuery } from '@tanstack/react-query';
import { analyticsService, type AnalyticsData, type AnalyticsFilters } from '@/services/api/analytics.service';
import { isApiBackendEnabled } from '@/config/app.config';

// Query keys
export const analyticsKeys = {
    all: ['analytics'] as const,
    workspace: (workspaceId: string) => [...analyticsKeys.all, 'workspace', workspaceId] as const,
    workspaceFiltered: (workspaceId: string, filters: AnalyticsFilters) =>
        [...analyticsKeys.workspace(workspaceId), filters] as const,
};

/**
 * Hook to get workspace analytics
 */
export function useWorkspaceAnalytics(
    workspaceId: string | undefined,
    filters?: AnalyticsFilters
) {
    return useQuery({
        queryKey: workspaceId
            ? analyticsKeys.workspaceFiltered(workspaceId, filters || {})
            : ['analytics', 'disabled'],
        queryFn: async () => {
            if (!workspaceId) throw new Error('Workspace ID is required');
            
            const response = await analyticsService.getWorkspaceAnalytics(workspaceId, filters);
            return response.data;
        },
        enabled: isApiBackendEnabled() && !!workspaceId,
        staleTime: 30 * 1000, // 30 seconds - consider data stale after 30s
        gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache for 5 minutes
        refetchOnMount: true, // Always refetch when component mounts
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchInterval: 60 * 1000, // Auto-refetch every 60 seconds
    });
}

/**
 * Hook to export analytics data
 */
export function useExportAnalytics() {
    const exportData = async (workspaceId: string, filters?: AnalyticsFilters) => {
        await analyticsService.exportAnalytics(workspaceId, filters);
    };

    return { exportData };
}
