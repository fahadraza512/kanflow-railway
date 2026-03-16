import { useState, useEffect } from "react";
import { 
    getActiveWorkspace, 
    getArchivedTasksByBoard,
    getBoardsByProject,
    getProjectsByWorkspace,
    updateTask,
    deleteTask,
    Task
} from "@/lib/storage";

export function useArchivedTasks() {
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [filterProject, setFilterProject] = useState<string>("all");
    const [projects, setProjects] = useState<{ id: string | number; name: string }[]>([]);

    const loadArchivedTasks = () => {
        const activeWsId = getActiveWorkspace();
        if (!activeWsId) return;

        const projectsList = getProjectsByWorkspace(activeWsId);
        setProjects(projectsList.map(p => ({ id: p.id, name: p.name })));

        let allArchivedTasks: Task[] = [];
        projectsList.forEach(project => {
            const boards = getBoardsByProject(project.id);
            boards.forEach(board => {
                const tasks = getArchivedTasksByBoard(board.id);
                allArchivedTasks = [...allArchivedTasks, ...tasks];
            });
        });

        setArchivedTasks(allArchivedTasks);
    };

    useEffect(() => {
        loadArchivedTasks();

        const handleStorageChange = () => {
            loadArchivedTasks();
        };

        window.addEventListener('local-storage-change', handleStorageChange);
        return () => window.removeEventListener('local-storage-change', handleStorageChange);
    }, []);

    const handleRestore = (taskId: string | number) => {
        updateTask(taskId, { archived: false });
        loadArchivedTasks();
    };

    const handleDelete = (taskId: string | number, taskTitle: string) => {
        if (confirm(`Permanently delete "${taskTitle}"? This action cannot be undone.`)) {
            deleteTask(taskId);
            loadArchivedTasks();
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailPanelOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailPanelOpen(false);
        setSelectedTask(null);
    };

    const handleTaskUpdate = () => {
        loadArchivedTasks();
        setIsDetailPanelOpen(false);
        setSelectedTask(null);
    };

    const filteredTasks = filterProject === "all" 
        ? archivedTasks 
        : archivedTasks.filter(t => t.projectId.toString() === filterProject);

    return {
        archivedTasks,
        filteredTasks,
        selectedTask,
        isDetailPanelOpen,
        filterProject,
        setFilterProject,
        projects,
        handleRestore,
        handleDelete,
        handleTaskClick,
        handleCloseDetail,
        handleTaskUpdate
    };
}
