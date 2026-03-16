import { useEffect, useState, useCallback } from "react";
import {
  getWorkspaces,
  Workspace,
  setActiveWorkspace,
  getActiveWorkspace,
  getProjectsByWorkspace,
  Project
} from "@/lib/storage";
import { useStorageListener } from "@/hooks/useLocalStorage";

export function useWorkspaceSidebar(onWorkspaceSelect?: (workspace: Workspace) => void) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | number | null>(null);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const loadWorkspaceData = useCallback(() => {
    const ws = getWorkspaces();
    setWorkspaces(ws);
    const activeId = getActiveWorkspace();
    if (activeId) {
      setActiveWorkspaceId(activeId);
      setActiveProjects(getProjectsByWorkspace(activeId));
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData, isProjectModalOpen]);

  useStorageListener(() => {
    loadWorkspaceData();
  }, ['projects', 'workspaces', 'activeWorkspace']);

  const handleWorkspaceSelect = useCallback((workspace: Workspace) => {
    const id = String(workspace.id);
    setActiveWorkspace(id);
    setActiveWorkspaceId(id);
    setActiveProjects(getProjectsByWorkspace(id));
    onWorkspaceSelect?.(workspace);
  }, [onWorkspaceSelect]);

  const handleProjectCreated = useCallback(() => {
    setIsProjectModalOpen(false);
    if (activeWorkspaceId) {
      setActiveProjects(getProjectsByWorkspace(activeWorkspaceId));
    }
  }, [activeWorkspaceId]);

  return {
    workspaces,
    activeWorkspaceId,
    activeProjects,
    isProjectModalOpen,
    setIsProjectModalOpen,
    handleWorkspaceSelect,
    handleProjectCreated
  };
}
