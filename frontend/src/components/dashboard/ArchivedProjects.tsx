import { useState } from "react";
import { Archive } from "lucide-react";
import { Project } from "@/types/api.types";
import ArchivedProjectCard from "./ArchivedProjectCard";

interface ArchivedProjectsProps {
    archivedProjects: Project[];
    onRestoreProject: (projectId: string | number) => void;
    onDeleteProject: (projectId: string | number, projectName: string) => void;
}

export default function ArchivedProjects({
    archivedProjects,
    onRestoreProject,
    onDeleteProject
}: ArchivedProjectsProps) {
    const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);

    if (archivedProjects.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-0.5">Archived Projects</h2>
                    <p className="text-xs text-gray-500">
                        {archivedProjects.length} archived project{archivedProjects.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {archivedProjects.map((project) => {
                    return (
                        <ArchivedProjectCard
                            key={project.id}
                            project={project}
                            boardCount={project.boardCount || 0}
                            isDropdownOpen={openDropdown === project.id}
                            onToggleDropdown={(e) => {
                                e.preventDefault();
                                setOpenDropdown(openDropdown === project.id ? null : project.id);
                            }}
                            onRestore={() => {
                                onRestoreProject(project.id);
                                setOpenDropdown(null);
                            }}
                            onDelete={() => {
                                onDeleteProject(project.id, project.name);
                                setOpenDropdown(null);
                            }}
                            onCloseDropdown={() => setOpenDropdown(null)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
