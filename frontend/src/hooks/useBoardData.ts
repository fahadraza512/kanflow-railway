import { useState, useEffect, useCallback } from "react";
import { useStorageListener } from "@/hooks/useLocalStorage";
import { 
    getBoardById, 
    getListsByBoard, 
    getTasksByBoard,
    Board,
    List,
    Task
} from "@/lib/storage";

export function useBoardData(boardId: string) {
    const [board, setBoard] = useState<Board | null>(null);
    const [lists, setLists] = useState<List[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSync, setLastSync] = useState(new Date());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const loadBoardData = useCallback(() => {
        const boardData = getBoardById(boardId);
        if (boardData) {
            setBoard(boardData);
            const listsData = getListsByBoard(boardId);
            setLists(listsData);

            const allTasks = getTasksByBoard(boardId);
            setTasks(allTasks);

            // Update selected task if it exists
            if (selectedTask) {
                const updatedTask = allTasks.find(t => t.id === selectedTask.id);
                if (updatedTask) setSelectedTask(updatedTask);
            }
            
            setLastSync(new Date());
        }
        setIsLoading(false);
    }, [boardId, selectedTask]);

    useEffect(() => {
        loadBoardData();
    }, [loadBoardData]);

    // Listen for storage changes and refresh board data
    useStorageListener(() => {
        loadBoardData();
    }, ['tasks', 'lists']);

    return {
        board,
        lists,
        tasks,
        isLoading,
        lastSync,
        selectedTask,
        setSelectedTask,
        loadBoardData
    };
}
