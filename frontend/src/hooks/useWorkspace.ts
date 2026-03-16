import { useState, useCallback, useEffect } from "react";
import {
    getWorkspaces,
    getWorkspaceById,
    saveWorkspace,
    setActiveWorkspace as setActiveWorkspaceStorage,
    getActiveWorkspace as getActiveWorkspaceStorage,
    Workspace
} from "@/lib/storage";

export function useWorkspaces(userId?: string | number) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkspaces = useCallback(() => {
        setIsLoading(true);
        const allWorkspaces = getWorkspaces();
        const userWorkspaces = userId 
            ? allWorkspaces.filter(w => String(w.createdBy) === String(userId))
            : allWorkspaces;
        setWorkspaces(userWorkspaces);
        setIsLoading(false);
    }, [userId]);

    useEffect(() => {
        loadWorkspaces();
    }, [loadWorkspaces]);

    const createWorkspace = useCallback((workspace: Workspace) => {
        saveWorkspace(workspace);
        loadWorkspaces();
        return workspace.id;
    }, [loadWorkspaces]);

    const refetch = useCallback(() => {
        loadWorkspaces();
    }, [loadWorkspaces]);

    return {
        workspaces,
        isLoading,
        createWorkspace,
        refetch
    };
}

export function useActiveWorkspace() {
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
    const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

    useEffect(() => {
        const id = getActiveWorkspaceStorage();
        setActiveWorkspaceId(id);
        if (id) {
            const workspace = getWorkspaceById(id);
            setActiveWorkspace(workspace);
        }
    }, []);

    const setActive = useCallback((id: string | number) => {
        const idStr = String(id);
        setActiveWorkspaceStorage(idStr);
        setActiveWorkspaceId(idStr);
        const workspace = getWorkspaceById(idStr);
        setActiveWorkspace(workspace);
    }, []);

    return {
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspace: setActive
    };
}
