import { Layout, MoreVertical, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Project } from "@/types/api.types";

interface ArchivedProjectCardProps {
    project: Project;
    boardCount: number;
    isDropdownOpen: boolean;
    onToggleDropdown: (e: React.MouseEvent) => void;
    onRestore: () => void;
    onDelete: () => void;
    onCloseDropdown: () => void;
}

export default function ArchivedProjectCard({
    project,
    boardCount,
    isDropdownOpen,
    onToggleDropdown,
    onRestore,
    onDelete,
    onCloseDropdown
}: ArchivedProjectCardProps) {
    return (
        <div className="relative">
            <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow opacity-60">
                <div className="flex items-start justify-between mb-2">
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-base"
                        style={{ backgroundColor: project.color || "#3B82F6" }}
                    >
                        {project.name.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-semibold">
                            <Layout className="w-3 h-3" />
                            {boardCount}
                        </div>
                        <button
                            onClick={onToggleDropdown}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
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

                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-1">
                        <Archive className="w-3 h-3 text-gray-400" />
                        <span className="font-medium">Archived</span>
                    </div>
                </div>

                <div className="text-center py-1">
                    <p className="text-[10px] text-gray-400 italic">Project archived</p>
                </div>
            </div>
            
            {isDropdownOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={onCloseDropdown}
                    />
                    <div className="absolute top-16 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 opacity-100">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onRestore();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <ArchiveRestore className="w-4 h-4" />
                            Restore
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Permanently
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
