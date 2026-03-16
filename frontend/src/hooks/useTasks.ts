import { useState, useCallback, useEffect } from "react";
import {
    getTasksByBoard,
    getTasksByList,
    getArchivedTasksByBoard,
    saveTask,
    updateTask,
    deleteTask as deleteTaskStorage,
    reorderTasks as reorderTasksStorage,
    Task
} from "@/lib/storage";

export function useTasks(boardId: string | number | null) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadTasks = useCallback(() => {
        if (!boardId) {
            setTasks([]);
            setArchivedTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const activeTasks = getTasksByBoard(boardId);
        const archived = getArchivedTasksByBoard(boardId);
        setTasks(activeTasks);
        setArchivedTasks(archived);
        setIsLoading(false);
    }, [boardId]);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    const createTask = useCallback((task: Task) => {
        saveTask(task);
        loadTasks();
        return task.id;
    }, [loadTasks]);

    const updateTaskData = useCallback((id: string | number, updates: Partial<Task>) => {
        updateTask(id, updates);
        loadTasks();
    }, [loadTasks]);

    const deleteTask = useCallback((id: string | number) => {
        deleteTaskStorage(id);
        loadTasks();
    }, [loadTasks]);

    const archiveTask = useCallback((id: string | number) => {
        updateTask(id, { archived: true });
        loadTasks();
    }, [loadTasks]);

    const restoreTask = useCallback((id: string | number) => {
        updateTask(id, { archived: false });
        loadTasks();
    }, [loadTasks]);

    const reorderTasks = useCallback((listId: string | number, taskIds: (string | number)[]) => {
        reorderTasksStorage(listId, taskIds);
        loadTasks();
    }, [loadTasks]);

    return {
        tasks,
        archivedTasks,
        isLoading,
        createTask,
        updateTask: updateTaskData,
        deleteTask,
        archiveTask,
        restoreTask,
        reorderTasks,
        refetch: loadTasks
    };
}

export function useTasksByList(listId: string | number | null) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!listId) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const listTasks = getTasksByList(listId);
        setTasks(listTasks);
        setIsLoading(false);
    }, [listId]);

    return { tasks, isLoading };
}
