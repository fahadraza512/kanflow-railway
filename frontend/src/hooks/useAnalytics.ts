import { useState, useEffect } from "react";
import {
    getActiveWorkspace,
    getProjectsByWorkspace,
    getBoardsByProject,
    getTasksByBoard,
    Task
} from "@/lib/storage";

export interface AnalyticsData {
    totalProjects: number;
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionRate: number;
    teamWorkload: { userId: string | number; name: string; taskCount: number; completedCount: number }[];
    projectStats: { projectId: string | number; name: string; totalTasks: number; completedTasks: number; completionRate: number }[];
    priorityDistribution: { low: number; medium: number; high: number; urgent: number };
    recentActivity: { date: string; completed: number; created: number }[];
}

export function useAnalytics(timeRange: "7d" | "30d" | "90d") {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalProjects: 0,
        totalBoards: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        completionRate: 0,
        teamWorkload: [],
        projectStats: [],
        priorityDistribution: { low: 0, medium: 0, high: 0, urgent: 0 },
        recentActivity: []
    });

    useEffect(() => {
        const loadAnalytics = () => {
            const activeWsId = getActiveWorkspace();
            if (!activeWsId) return;

            const projects = getProjectsByWorkspace(activeWsId);
            
            let totalBoards = 0;
            let allTasks: Task[] = [];
            const projectStats: AnalyticsData["projectStats"] = [];
            const teamWorkload: Map<string | number, { name: string; taskCount: number; completedCount: number }> = new Map();
            const priorityDist = { low: 0, medium: 0, high: 0, urgent: 0 };

            projects.forEach(project => {
                const boards = getBoardsByProject(project.id);
                totalBoards += boards.length;

                let projectTasks: Task[] = [];
                boards.forEach(board => {
                    const tasks = getTasksByBoard(board.id);
                    projectTasks = [...projectTasks, ...tasks];
                    allTasks = [...allTasks, ...tasks];
                });

                const completedInProject = projectTasks.filter(t => t.status === "done").length;
                projectStats.push({
                    projectId: project.id,
                    name: project.name,
                    totalTasks: projectTasks.length,
                    completedTasks: completedInProject,
                    completionRate: projectTasks.length > 0 ? Math.round((completedInProject / projectTasks.length) * 100) : 0
                });
            });

            allTasks.forEach(task => {
                if (task.assignedTo) {
                    const existing = teamWorkload.get(task.assignedTo);
                    if (existing) {
                        existing.taskCount++;
                        if (task.status === "done") existing.completedCount++;
                    } else {
                        teamWorkload.set(task.assignedTo, {
                            name: task.assignedToName || "Unknown",
                            taskCount: 1,
                            completedCount: task.status === "done" ? 1 : 0
                        });
                    }
                }

                priorityDist[task.priority]++;
            });

            const recentActivity: AnalyticsData["recentActivity"] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const completed = allTasks.filter(t => 
                    t.status === "done" && t.updatedAt.startsWith(dateStr)
                ).length;
                
                const created = allTasks.filter(t => 
                    t.createdAt.startsWith(dateStr)
                ).length;
                
                recentActivity.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    completed,
                    created
                });
            }

            const completedTasks = allTasks.filter(t => t.status === "done").length;
            const inProgressTasks = allTasks.filter(t => t.status === "inProgress").length;
            const todoTasks = allTasks.filter(t => t.status === "todo").length;

            setAnalytics({
                totalProjects: projects.length,
                totalBoards,
                totalTasks: allTasks.length,
                completedTasks,
                inProgressTasks,
                todoTasks,
                completionRate: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0,
                teamWorkload: Array.from(teamWorkload.entries()).map(([userId, data]) => ({
                    userId,
                    ...data
                })),
                projectStats,
                priorityDistribution: priorityDist,
                recentActivity
            });
        };

        loadAnalytics();

        const handleStorageChange = () => {
            loadAnalytics();
        };

        window.addEventListener('local-storage-change', handleStorageChange);
        return () => window.removeEventListener('local-storage-change', handleStorageChange);
    }, [timeRange]);

    const handleExportData = () => {
        const exportData = {
            generatedAt: new Date().toISOString(),
            timeRange,
            ...analytics
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return {
        analytics,
        handleExportData
    };
}
