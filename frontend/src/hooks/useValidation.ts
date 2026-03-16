import { useState, useCallback } from "react";
import {
    getWorkspaces,
    getProjectsByWorkspace,
    getBoardsByProject,
    getListsByBoard,
    getTasksByList
} from "@/lib/storage";

export function useWorkspaceValidation(userId: string | number | undefined) {
    const [error, setError] = useState("");

    const validate = useCallback((name: string) => {
        if (!name.trim() || !userId) {
            setError("");
            return false;
        }

        const workspaces = getWorkspaces();
        const userWorkspaces = workspaces.filter(w => String(w.createdBy) === String(userId));
        const isDuplicate = userWorkspaces.some(w => 
            w.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError("You have already created a workspace with this name. Please choose a different name.");
            return false;
        }

        setError("");
        return true;
    }, [userId]);

    const clearError = useCallback(() => setError(""), []);

    return { error, validate, clearError };
}

export function useProjectValidation(workspaceId: string | number | null) {
    const [error, setError] = useState("");

    const validate = useCallback((name: string) => {
        if (!name.trim() || !workspaceId) {
            setError("");
            return false;
        }

        const projects = getProjectsByWorkspace(workspaceId);
        const isDuplicate = projects.some(p => 
            p.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError("This name already exists. Please choose a different name.");
            return false;
        }

        setError("");
        return true;
    }, [workspaceId]);

    const clearError = useCallback(() => setError(""), []);

    return { error, validate, clearError };
}

export function useBoardValidation(projectId: string | number) {
    const [error, setError] = useState("");

    const validate = useCallback((name: string) => {
        if (!name.trim()) {
            setError("");
            return false;
        }

        const boards = getBoardsByProject(projectId);
        const isDuplicate = boards.some(b => 
            b.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError("This name already exists. Please choose a different name.");
            return false;
        }

        setError("");
        return true;
    }, [projectId]);

    const clearError = useCallback(() => setError(""), []);

    return { error, validate, clearError };
}

export function useListValidation(boardId: string | number) {
    const [error, setError] = useState("");

    const validate = useCallback((name: string) => {
        if (!name.trim()) {
            setError("");
            return false;
        }

        const lists = getListsByBoard(boardId);
        const isDuplicate = lists.some(l => 
            l.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError("This name already exists. Please choose a different name.");
            return false;
        }

        setError("");
        return true;
    }, [boardId]);

    const clearError = useCallback(() => setError(""), []);

    return { error, validate, clearError };
}

export function useTaskValidation(listId: string | number) {
    const [error, setError] = useState("");

    const validate = useCallback((name: string) => {
        if (!name.trim()) {
            setError("");
            return false;
        }

        const tasks = getTasksByList(listId);
        const isDuplicate = tasks.some(t => 
            t.title.toLowerCase() === name.trim().toLowerCase()
        );

        if (isDuplicate) {
            setError("This name already exists. Please choose a different name.");
            return false;
        }

        setError("");
        return true;
    }, [listId]);

    const clearError = useCallback(() => setError(""), []);

    return { error, validate, clearError };
}
