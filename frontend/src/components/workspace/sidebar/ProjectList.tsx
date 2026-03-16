import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { Project } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  projects: Project[];
  activeWorkspaceId: string | number | null;
  currentPath: string;
  onCreateProject: () => void;
}

export function ProjectList({
  projects,
  activeWorkspaceId,
  currentPath,
  onCreateProject
}: ProjectListProps) {
  return (
    <div className="px-4 py-4 flex-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Projects
        </h2>
        <button
          onClick={onCreateProject}
          className="p-1.5 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Create new project"
          aria-label="Create new project"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        {projects.length > 0 ? (
          projects.map((project) => {
            const isActive = currentPath.includes(`/projects/${project.id}`);
            return (
              <Link
                key={project.id}
                href={`/workspaces/${activeWorkspaceId}/projects/${project.id}`}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <div 
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ backgroundColor: project.coverColor || '#6B7280' }}
                >
                  {project.name.charAt(0)}
                </div>
                <span className="truncate flex-1">{project.name}</span>
              </Link>
            );
          })
        ) : (
          <EmptyProjectsState onCreateProject={onCreateProject} />
        )}
      </div>
    </div>
  );
}

function EmptyProjectsState({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <div className="px-3 py-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
        <FolderKanban className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-xs text-gray-400 mb-3 font-medium">No projects yet</p>
      <button
        onClick={onCreateProject}
        className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
      >
        Create your first project
      </button>
    </div>
  );
}
