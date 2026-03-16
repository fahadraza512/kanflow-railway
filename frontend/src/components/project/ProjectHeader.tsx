import { Plus, Layout, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/lib/storage";

interface ProjectHeaderProps {
    project: Project;
    boardsCount: number;
    archivedCount: number;
    showArchived: boolean;
    isAtLimit: boolean;
    onCreateBoard: () => void;
    onToggleArchived: () => void;
}

export default function ProjectHeader({
    project,
    boardsCount,
    archivedCount,
    showArchived,
    isAtLimit,
    onCreateBoard,
    onToggleArchived
}: ProjectHeaderProps) {
    return (
        <div className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 mb-3">
                <div className="flex items-start gap-2">
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base"
                        style={{ backgroundColor: project.color || "#3B82F6" }}
                    >
                        {project.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-gray-900 mb-0.5">
                            {project.name}
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold">
                                <Layout className="w-3 h-3" />
                                {boardsCount}
                            </div>
                            <button
                                onClick={onToggleArchived}
                                className={cn(
                                    "flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold transition-colors",
                                    showArchived 
                                        ? "bg-gray-700 text-white" 
                                        : archivedCount > 0
                                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                )}
                                title={archivedCount > 0 ? `${archivedCount} archived boards` : "No archived boards"}
                            >
                                <Archive className="w-3 h-3" />
                                {archivedCount}
                            </button>
                            <span className="text-gray-400">•</span>
                            <span className="text-xs">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onCreateBoard}
                    disabled={isAtLimit}
                    className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors shadow-sm text-xs",
                        isAtLimit
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Board</span>
                </button>
            </div>

            {project.description && (
                <p className="text-xs text-gray-600 max-w-3xl">
                    {project.description}
                </p>
            )}
        </div>
    );
}
