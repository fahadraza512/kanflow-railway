import { useState, useMemo } from "react";
import { Project } from "@/types/api.types";
import { useTasksByWorkspace } from "@/hooks/api/useTasks";
import { useQueries } from "@tanstack/react-query";
import { projectService } from "@/services/api/project.service";
import ProjectCard from "./ProjectCard";
import ProjectDropdown from "./ProjectDropdown";

interface ProjectGridProps {
    projects: Project[];
    onEditProject: (project: Project) => void;
    onAssignMembers: (project: Project) => void;
    onArchiveProject: (projectId: string | number) => void;
    onDeleteProject: (projectId: string | number, projectName: string) => void;
    canManageProjects?: boolean;
}

export default function ProjectGrid({
    projects,
    onEditProject,
    onAssignMembers,
    onArchiveProject,
    onDeleteProject,
    canManageProjects = true
}: ProjectGridProps) {
    const [openDropdown, setOpenDropdown] = useState<string | number | null>(null);
    
    // Get workspace ID from first project (all projects in grid have same workspace)
    const workspaceId = projects[0]?.workspaceId;
    
    // Fetch all tasks for the workspace
    const { data: allWorkspaceTasks = [], isLoading, error } = useTasksByWorkspace(workspaceId || null);

    // Fetch project members count for all projects
    const projectMembersQueries = useQueries({
        queries: projects.map(project => ({
            queryKey: ['project-members', project.id.toString()],
            queryFn: () => projectService.getMembers(project.id.toString()),
            enabled: !!project.id,
        })),
    });

    // Create a map of project ID to members count
    const projectMembersCount = useMemo(() => {
        const counts: Record<string | number, number> = {};
        projects.forEach((project, index) => {
            const membersData = projectMembersQueries[index]?.data || [];
            counts[project.id] = membersData.length;
        });
        return counts;
    }, [projects, projectMembersQueries]);

    // Debug logging
    console.log('ProjectGrid Debug:', {
        workspaceId,
        tasksCount: allWorkspaceTasks.length,
        tasks: allWorkspaceTasks,
        isLoading,
        error,
        projects: projects.map(p => ({ id: p.id, name: p.name }))
    });

    // Calculate task stats for each project
    const projectStats = useMemo(() => {
        const stats: Record<string | number, {
            allTasks: any[];
            completedCount: number;
            progressPercent: number;
        }> = {};

        projects.forEach(project => {
            // Filter tasks for this project (tasks are linked via board.projectId)
            const projectTasks = allWorkspaceTasks.filter(
                (task: any) => task.board?.projectId === project.id && !task.isArchived
            );
            
            console.log(`Project ${project.name} (${project.id}):`, {
                totalTasks: projectTasks.length,
                tasks: projectTasks.map(t => ({ 
                    id: t.id, 
                    title: t.title, 
                    boardId: t.boardId,
                    boardProjectId: t.board?.projectId,
                    status: t.status 
                }))
            });
            
            // Count completed tasks
            const completed = projectTasks.filter(
                (task: any) => task.status === 'completed' || task.status === 'done'
            ).length;
            
            // Calculate progress percentage
            const progress = projectTasks.length > 0 
                ? Math.round((completed / projectTasks.length) * 100)
                : 0;

            stats[project.id] = {
                allTasks: projectTasks,
                completedCount: completed,
                progressPercent: progress
            };
        });

        console.log('Project Stats:', stats);
        return stats;
    }, [projects, allWorkspaceTasks]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => {
                const boardCount = (project as any).boardCount || 0;
                const membersCount = projectMembersCount[project.id] || 0;
                const stats = projectStats[project.id] || {
                    allTasks: [],
                    completedCount: 0,
                    progressPercent: 0
                };

                return (
                    <div key={project.id} className="relative">
                        <ProjectCard
                            project={project}
                            workspaceId={project.workspaceId}
                            boardCount={boardCount}
                            membersCount={membersCount}
                            allTasks={stats.allTasks}
                            completedCount={stats.completedCount}
                            progressPercent={stats.progressPercent}
                            isDropdownOpen={openDropdown === project.id}
                            onToggleDropdown={(e) => {
                                e.preventDefault();
                                if (canManageProjects) {
                                    setOpenDropdown(openDropdown === project.id ? null : project.id);
                                }
                            }}
                            canManageProjects={canManageProjects}
                        />
                        
                        {canManageProjects && openDropdown === project.id && (
                            <ProjectDropdown
                                project={project}
                                onEdit={() => onEditProject(project)}
                                onAssignMembers={() => onAssignMembers(project)}
                                onArchive={() => {
                                    onArchiveProject(project.id);
                                    setOpenDropdown(null);
                                }}
                                onDelete={() => {
                                    onDeleteProject(project.id, project.name);
                                    setOpenDropdown(null);
                                }}
                                onClose={() => setOpenDropdown(null)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
