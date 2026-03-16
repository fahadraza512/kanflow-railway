import { X, ChevronRight, Archive, Trash2, ChevronLeft, Home, Folder } from "lucide-react";

interface TaskDetailHeaderProps {
    breadcrumb: { project: string; list: string };
    readOnly?: boolean;
    isArchived: boolean;
    onArchive: () => void;
    onDelete: () => void;
    onClose: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
}

export default function TaskDetailHeader({
    breadcrumb,
    readOnly,
    isArchived,
    onArchive,
    onDelete,
    onClose,
    onNext,
    onPrevious
}: TaskDetailHeaderProps) {
    return (
        <div className="px-3 py-2.5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center">
            {/* Improved Breadcrumb */}
            <div className="flex items-center gap-1 text-xs flex-1 min-w-0">
                {/* Home Icon */}
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-600 shrink-0">
                    <Home className="w-3 h-3" />
                </div>
                
                {/* Separator */}
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                
                {/* Project */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-200 hover:border-gray-300 transition-colors max-w-[120px] shrink-0">
                    <Folder className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="font-medium text-gray-700 truncate text-[10px]">
                        {breadcrumb.project}
                    </span>
                </div>
                
                {/* Separator */}
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                
                {/* List/Board */}
                <div className="flex items-center px-2 py-1 rounded-md bg-blue-50 border border-blue-100 max-w-[100px] shrink-0">
                    <span className="font-semibold text-blue-700 truncate text-[10px]">
                        {breadcrumb.list}
                    </span>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
                {/* Task Navigation */}
                {(onPrevious || onNext) && (
                    <div className="flex items-center gap-0.5 mr-1 border-r border-gray-200 pr-1.5">
                        <button 
                            onClick={onPrevious}
                            disabled={!onPrevious}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
                            title="Previous task (Shift + ←)"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700" />
                        </button>
                        <button 
                            onClick={onNext}
                            disabled={!onNext}
                            className="p-1.5 hover:bg-gray-100 rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent group"
                            title="Next task (Shift + →)"
                        >
                            <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700" />
                        </button>
                    </div>
                )}
                {!readOnly && (
                    <>
                        <button 
                            onClick={onArchive}
                            className="p-1.5 hover:bg-amber-50 rounded-md transition-all group"
                            title={isArchived ? "Restore task" : "Archive task"}
                        >
                            <Archive className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600" />
                        </button>
                        <button 
                            onClick={onDelete}
                            className="p-1.5 hover:bg-red-50 rounded-md transition-all group"
                            title="Delete task"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
                        </button>
                    </>
                )}
                <button 
                    onClick={onClose} 
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-all group ml-0.5"
                    title="Close (Esc)"
                >
                    <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />
                </button>
            </div>
        </div>
    );
}
