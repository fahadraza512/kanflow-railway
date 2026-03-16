import { useState, useEffect } from "react";
import {
    getActiveWorkspace,
    getProjectsByWorkspace,
    getArchivedProjectsByWorkspace,
    Project,
    getBoardsByProject,
    getTasksByBoard,
    getWorkspaceById,
    updateProject,
    deleteProject
} from "@/lib/storage";

export interface DashboardStats {
    totalProjects: number;
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
}

export function useDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
    const [workspaceName, setWorkspaceName] = useState("");
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        totalBoards: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
    });
    const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);
    const [showArchived, setShowArchived] = useState(false);

    const loadDashboardData = () => {
        const activeWsId = getActiveWorkspace();
        if (activeWsId) {
            const ws = getWorkspaceById(activeWsId);
            setWorkspaceName(ws?.name || "Workspace");
            
            const projectsList = getProjectsByWorkspace(activeWsId);
            const archivedList = getArchivedProjectsByWorkspace(activeWsId);
            setProjects(projectsList);
            setArchivedProjects(archivedList);

            calculateStats(projectsList);
        }
    };

    const calculateStats = (projectsList: Project[]) => {
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
    };

    const handleArchiveProject = (projectId: string | number) => {
        if (confirm("Archive this project? You can restore it later.")) {
            updateProject(projectId, { archived: true });
            loadDashboardData();
        }
        setOpenDropdown(null);
    };

    const handleRestoreProject = (projectId: string | number) => {
        updateProject(projectId, { archived: false });
        loadDashboardData();
        setOpenDropdown(null);
    };

    const handleDeleteProject = (projectId: string | number, projectName: string) => {
        if (confirm(`Delete "${projectName}"? This will permanently delete all boards, lists, and tasks. This action cannot be undone.`)) {
            deleteProject(projectId);
            loadDashboardData();
        }
        setOpenDropdown(null);
    };

    const toggleArchived = () => {
        setShowArchived(!showArchived);
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    return {
        projects,
        archivedProjects,
        workspaceName,
        stats,
        openDropdown,
        showArchived,
        setOpenDropdown,
        toggleArchived,
        handleArchiveProject,
        handleRestoreProject,
        handleDeleteProject,
        refresh: loadDashboardData
    };
}
