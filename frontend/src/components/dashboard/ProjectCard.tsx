import Link from "next/link";
import { Layout, CheckCircle2, Calendar, MoreVertical, Users } from "lucide-react";
import { Project } from "@/types/api.types";
import { useProjectMembers } from "@/hooks/api/useProjectMembers";

interface ProjectCardProps {
    project: Project;
    workspaceId: string | number;
    boardCount: number;
    membersCount: number;
    allTasks: any[];
    completedCount: number;
    progressPercent: number;
    isDropdownOpen: boolean;
    onToggleDropdown: (e: React.MouseEvent) => void;
    canManageProjects?: boolean;
}

export default function ProjectCard({
    project,
    workspaceId,
    boardCount,
    membersCount,
    allTasks,
    completedCount,
    progressPercent,
    isDropdownOpen,
    onToggleDropdown,
    canManageProjects = true
}: ProjectCardProps) {
    // Fetch project members for avatar display
    const { data: projectMembers = [] } = useProjectMembers(project.id.toString());

    return (
        <Link
            href={`/workspaces/${workspaceId}/projects/${project.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow relative"
        >
            <div className="flex items-start justify-between mb-2">
                <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                    style={{ backgroundColor: project.color || "#3B82F6" }}
                >
                    {project.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-semibold">
                        <Layout className="w-3 h-3" />
                        {boardCount}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-semibold">
                        <Users className="w-3 h-3" />
                        {membersCount}
                    </div>
                    {canManageProjects && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleDropdown(e);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors z-10 relative"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors">
                    {project.name}
                </h3>
                
                {project.description ? (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2 min-h-[32px]">
                        {project.description}
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 italic mb-2 min-h-[32px]">
                        No description
                    </p>
                )}

                <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                            <span className="font-medium">{completedCount}/{allTasks.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                    
                    {/* Member Avatars Stack */}
                    {projectMembers.length > 0 && (
                        <div className="flex items-center -space-x-2">
                            {projectMembers.slice(0, 3).map((member: any, index: number) => {
                                const name = member.user?.name || member.user?.firstName || 'U';
                                const initial = name.charAt(0).toUpperCase();
                                
                                return (
                                    <div
                                        key={member.userId || index}
                                        className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px] border-2 border-white shadow-sm"
                                        title={name}
                                    >
                                        {initial}
                                    </div>
                                );
                            })}
                            {projectMembers.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-[10px] border-2 border-white shadow-sm">
                                    +{projectMembers.length - 3}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {allTasks.length > 0 ? (
                    <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-gray-600 font-medium">Progress</span>
                            <span className="text-blue-600 font-semibold">{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-1">
                        <p className="text-[10px] text-gray-400 italic">No tasks yet</p>
                    </div>
                )}
            </div>
        </Link>
    );
}
