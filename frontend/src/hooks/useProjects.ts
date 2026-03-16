import { useState, useCallback, useEffect } from "react";
import {
    getProjectsByWorkspace,
    getArchivedProjectsByWorkspace,
    saveProject,
    updateProject,
    deleteProject as deleteProjectStorage,
    Project
} from "@/lib/storage";

export function useProjects(workspaceId: string | number | null) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProjects = useCallback(() => {
        if (!workspaceId) {
            setProjects([]);
            setArchivedProjects([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const activeProjects = getProjectsByWorkspace(workspaceId);
        const archived = getArchivedProjectsByWorkspace(workspaceId);
        setProjects(activeProjects);
        setArchivedProjects(archived);
        setIsLoading(false);
    }, [workspaceId]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const createProject = useCallback((project: Project) => {
        saveProject(project);
        loadProjects();
        return project.id;
    }, [loadProjects]);

    const updateProjectData = useCallback((id: string | number, updates: Partial<Project>) => {
        updateProject(id, updates);
        loadProjects();
    }, [loadProjects]);

    const deleteProject = useCallback((id: string | number) => {
        deleteProjectStorage(id);
        loadProjects();
    }, [loadProjects]);

    const archiveProject = useCallback((id: string | number) => {
        updateProject(id, { archived: true });
        loadProjects();
    }, [loadProjects]);

    const restoreProject = useCallback((id: string | number) => {
        updateProject(id, { archived: false });
        loadProjects();
    }, [loadProjects]);

    return {
        projects,
        archivedProjects,
        isLoading,
        createProject,
        updateProject: updateProjectData,
        deleteProject,
        archiveProject,
        restoreProject,
        refetch: loadProjects
    };
}
