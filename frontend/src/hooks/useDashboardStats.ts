import { useState, useEffect } from "react";
import {
    getProjectsByWorkspace,
    getBoardsByProject,
    getTasksByBoard
} from "@/lib/storage";

interface DashboardStats {
    totalProjects: number;
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
}

export function useDashboardStats(workspaceId: string | null) {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalBoards: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
    });

    useEffect(() => {
        if (!workspaceId) {
            setStats({
                totalProjects: 0,
                totalBoards: 0,
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                overdueTasks: 0
            });
            return;
        }

        const projectsList = getProjectsByWorkspace(workspaceId);
        let totalBoards = 0;
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;
        let overdueTasks = 0;

        projectsList.forEach(project => {
            const boards = getBoardsByProject(project.id);
            totalBoards += boards.length;

            boards.forEach(board => {
                const tasks = getTasksByBoard(board.id);
                totalTasks += tasks.length;
                
                tasks.forEach(task => {
                    if (task.status === "done") completedTasks++;
                    if (task.status === "inProgress") inProgressTasks++;
                    
                    if (task.dueDate) {
                        const dueDate = new Date(task.dueDate);
                        const today = new Date();
                        if (dueDate < today && task.status !== "done") {
                            overdueTasks++;
                        }
                    }
                });
            });
        });

        setStats({
            totalProjects: projectsList.length,
            totalBoards,
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks
        });
    }, [workspaceId]);

    return stats;
}
