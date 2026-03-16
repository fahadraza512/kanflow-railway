import { Plus } from "lucide-react";
import { Workspace } from "@/lib/storage";
import { WorkspaceItem } from "./WorkspaceItem";
import { usePathname } from "next/navigation";

interface WorkspaceListProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | number | null;
  onWorkspaceSelect: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
}

export function WorkspaceList({
  workspaces,
  activeWorkspaceId,
  onWorkspaceSelect,
  onCreateWorkspace
}: WorkspaceListProps) {
  const pathname = usePathname();
  
  // Only show workspace as active if we're on a workspace-specific page
  // Not on settings, dashboard, analytics, or archived-tasks pages
  const isOnWorkspacePage = pathname.startsWith('/workspaces/');
  
  return (
    <div className="px-4 pb-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Workspaces
        </h2>
        <button
          onClick={onCreateWorkspace}
          className="p-1.5 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Create new workspace"
          aria-label="Create new workspace"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        {workspaces.map((workspace) => (
          <WorkspaceItem
            key={workspace.id}
            workspace={workspace}
            isActive={isOnWorkspacePage && activeWorkspaceId === workspace.id}
            onClick={() => onWorkspaceSelect(workspace)}
          />
        ))}
      </div>
    </div>
  );
}
