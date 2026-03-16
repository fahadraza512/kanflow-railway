"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useWorkspaceAnalytics, useExportAnalytics } from "@/hooks/api";
import { useAuthStore } from "@/store/useAuthStore";
import { isApiBackendEnabled } from "@/config/app.config";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import KeyMetrics from "@/components/analytics/KeyMetrics";
import TaskCompletionRates from "@/components/analytics/TaskCompletionRates";
import PriorityDistribution from "@/components/analytics/PriorityDistribution";
import TeamWorkload from "@/components/analytics/TeamWorkload";
import ProjectStats from "@/components/analytics/ProjectStats";
import RecentActivityChart from "@/components/analytics/RecentActivityChart";
import LoadingState from "@/components/ui/LoadingState";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { showToast } from "@/lib/toast";

// Fallback to old implementation if API is not enabled
import { useAnalytics as useAnalyticsOld } from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
    const { activeWorkspaceId } = useAuthStore();
    const { exportData } = useExportAnalytics();
    
    // Use API backend if enabled, otherwise fallback to localStorage
    const useApiBackend = isApiBackendEnabled();
    
    // API-based data fetching
    const {
        data: apiAnalytics,
        isLoading: apiLoading,
        error: apiError,
        refetch
    } = useWorkspaceAnalytics(
        useApiBackend ? activeWorkspaceId : undefined,
        { timeRange }
    );
    
    // Fallback to old localStorage implementation
    const { analytics: localAnalytics, handleExportData: handleExportLocal } = useAnalyticsOld(timeRange);
    
    // Choose data source based on configuration
    const analytics = useApiBackend ? apiAnalytics : localAnalytics;
    const isLoading = useApiBackend ? apiLoading : false;
    const error = useApiBackend ? apiError : null;

    const handleExport = async () => {
        try {
            if (useApiBackend && activeWorkspaceId) {
                await exportData(activeWorkspaceId, { timeRange });
                showToast.success('Analytics exported successfully');
            } else {
                handleExportLocal();
                showToast.success('Analytics exported successfully');
            }
        } catch (err) {
            showToast.error('Failed to export analytics');
            console.error('Export error:', err);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="mb-4">
                        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                    
                    <SkeletonCard />
                </div>
            </DashboardLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-red-900 mb-1">Failed to Load Analytics</h3>
                        <p className="text-sm text-red-700 mb-4">
                            {error instanceof Error ? error.message : 'An error occurred while loading analytics data'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // No data state - Show full UI with zero values instead of empty state
    if (!analytics) {
        const emptyAnalytics = {
            totalProjects: 0,
            totalBoards: 0,
            completedTasks: 0,
            completionRate: 0,
            inProgressTasks: 0,
            todoTasks: 0,
            totalTasks: 0,
            priorityDistribution: {
                urgent: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            teamWorkload: [],
            projectStats: [],
            recentActivity: []
        };

        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <AnalyticsHeader
                        timeRange={timeRange}
                        onTimeRangeChange={setTimeRange}
                        onExport={handleExport}
                    />

                    <KeyMetrics
                        totalProjects={emptyAnalytics.totalProjects}
                        totalBoards={emptyAnalytics.totalBoards}
                        completedTasks={emptyAnalytics.completedTasks}
                        completionRate={emptyAnalytics.completionRate}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                        <TaskCompletionRates
                            completedTasks={emptyAnalytics.completedTasks}
                            inProgressTasks={emptyAnalytics.inProgressTasks}
                            todoTasks={emptyAnalytics.todoTasks}
                            totalTasks={emptyAnalytics.totalTasks}
                            completionRate={emptyAnalytics.completionRate}
                        />

                        <PriorityDistribution
                            priorityDistribution={emptyAnalytics.priorityDistribution}
                            totalTasks={emptyAnalytics.totalTasks}
                        />
                    </div>

                    <TeamWorkload teamWorkload={emptyAnalytics.teamWorkload} />

                    <ProjectStats projectStats={emptyAnalytics.projectStats} />

                    <RecentActivityChart recentActivity={emptyAnalytics.recentActivity} />
                </div>
            </DashboardLayout>
        );
    }

    // Success state - render analytics
    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto px-4 py-4">
                <AnalyticsHeader
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    onExport={handleExport}
                />

                <KeyMetrics
                    totalProjects={analytics.totalProjects}
                    totalBoards={analytics.totalBoards}
                    completedTasks={analytics.completedTasks}
                    completionRate={analytics.completionRate}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
                    <TaskCompletionRates
                        completedTasks={analytics.completedTasks}
                        inProgressTasks={analytics.inProgressTasks}
                        todoTasks={analytics.todoTasks}
                        totalTasks={analytics.totalTasks}
                        completionRate={analytics.completionRate}
                    />

                    <PriorityDistribution
                        priorityDistribution={analytics.priorityDistribution}
                        totalTasks={analytics.totalTasks}
                    />
                </div>

                <TeamWorkload teamWorkload={analytics.teamWorkload} />

                <ProjectStats projectStats={analytics.projectStats} />

                <RecentActivityChart recentActivity={analytics.recentActivity} />
            </div>
        </DashboardLayout>
    );
}
