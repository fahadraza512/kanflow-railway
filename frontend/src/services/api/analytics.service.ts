import { BaseService } from './base.service';
import type { ApiResponse } from '@/types/api.types';

export interface AnalyticsData {
    projects: {
        total: number;
        active: number;
    };
    boards: {
        total: number;
    };
    tasks: {
        total: number;
        completed: number;
        inProgress: number;
        inReview?: number;
        todo: number;
        overdue: number;
        completionRate: number;
        byPriority?: Array<{ priority: string; count: string }>;
        byStatus?: Array<{ status: string; count: string }>;
    };
    projectStats?: Array<{
        projectId: string;
        name: string;
        totalTasks: number;
        completedTasks: number;
        completionRate: number;
    }>;
}

export interface AnalyticsFilters {
    timeRange?: '7d' | '30d' | '90d';
    workspaceId?: string;
}

class AnalyticsService extends BaseService {
    /**
     * Get workspace analytics
     */
    async getWorkspaceAnalytics(
        workspaceId: string,
        filters?: AnalyticsFilters
    ): Promise<ApiResponse<AnalyticsData>> {
        return this.get<AnalyticsData>(`/analytics/workspace/${workspaceId}`, filters);
    }

    /**
     * Export analytics data as downloadable PDF report
     */
    async exportAnalytics(
        workspaceId: string,
        filters?: AnalyticsFilters
    ): Promise<void> {
        try {
            const response = await this.client.get(
                `/analytics/workspace/${workspaceId}/export`,
                {
                    params: filters,
                    responseType: 'blob',
                }
            );
            
            // Get time range for filename
            const timeRange = filters?.timeRange || '30d';
            const timeRangeLabel = {
                '7d': '7days',
                '30d': '30days',
                '90d': '90days'
            }[timeRange] || '30days';
            
            // Create download link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${timeRangeLabel}-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }
}

export const analyticsService = new AnalyticsService();
