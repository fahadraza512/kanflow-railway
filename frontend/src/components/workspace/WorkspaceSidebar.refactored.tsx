"use client";

import { memo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Workspace } from "@/lib/storage";
import { useWorkspaceSidebar } from "@/hooks/useWorkspaceSidebar";
import { NavigationLinks } from "./sidebar/NavigationLinks";
import { WorkspaceList } from "./sidebar/WorkspaceList";
import { ProjectList } from "./sidebar/ProjectList";
import CreateProjectModal from "@/components/project/CreateProjectModal";

interface WorkspaceSidebarProps {
  onWorkspaceSelect?: (workspace: Workspace) => void;
}

function WorkspaceSidebar({ onWorkspaceSelect }: WorkspaceSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    workspaces,
    activeWorkspaceId,
    activeProjects,
    isProjectModalOpen,
    setIsProjectModalOpen,
    handleWorkspaceSelect,
    handleProjectCreated
  } = useWorkspaceSidebar(onWorkspaceSelect);

  const handleWorkspaceClick = (workspace: Workspace) => {
    handleWorkspaceSelect(workspace);
    router.push("/dashboard");
  };

  const handleCreateWorkspace = () => {
    router.push("/dashboard/workspace");
  };

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
        <NavigationLinks currentPath={pathname} />
        
        <WorkspaceList
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onWorkspaceSelect={handleWorkspaceClick}
          onCreateWorkspace={handleCreateWorkspace}
        />
        
        <ProjectList
          projects={activeProjects}
          activeWorkspaceId={activeWorkspaceId}
          currentPath={pathname}
          onCreateProject={() => setIsProjectModalOpen(true)}
        />
      </div>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </>
  );
}

export default memo(WorkspaceSidebar);
