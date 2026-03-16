import { useState } from "react";
import Link from "next/link";
import { Layout, MoreVertical, Calendar, Edit2, Trash2, Archive, GripVertical, CheckSquare } from "lucide-react";
import { Board } from "@/lib/storage";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTasks } from "@/hooks/api";

interface SortableBoardCardProps {
    board: Board;
    workspaceId: string;
    projectId: string;
    onEdit: () => void;
    onArchive: () => void;
    onDelete: () => void;
}

export default function SortableBoardCard({
    board,
    workspaceId,
    projectId,
    onEdit,
    onArchive,
    onDelete
}: SortableBoardCardProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    
    // Fetch tasks for this board to get count - with longer stale time to reduce refetches
    const { data: tasks = [] } = useTasks(board.id.toString());

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        setActivatorNodeRef
    } = useSortable({ 
        id: board.id.toString(),
        data: {
            type: 'board',
            board
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const boardUrl = `/workspaces/${workspaceId}/projects/${projectId}/boards/${board.id}`;
    
    // Calculate task counts
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;

    const handleLinkClick = (e: React.MouseEvent) => {
        // Don't navigate if dragging
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // Hide card content during drag to improve performance
    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="relative">
                <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-3 h-24" />
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <Link 
                href={boardUrl}
                onClick={handleLinkClick}
                className="block bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <button
                            ref={setActivatorNodeRef}
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-gray-100 rounded transition-colors"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <GripVertical className="w-3 h-3 text-gray-400" />
                        </button>
                        <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center"
                            style={{ backgroundColor: board.color || '#3B82F6' }}
                        >
                            <Layout className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === board.id.toString() ? null : board.id.toString());
                        }}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors z-10 relative"
                    >
                        <MoreVertical className="w-3 h-3 text-gray-400" />
                    </button>
                </div>

                <h3 className="text-xs font-bold text-gray-900 mb-1.5 hover:text-blue-600 transition-colors">
                    {board.name}
                </h3>

                <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-medium">
                        <CheckSquare className="w-3 h-3" />
                        <span>{completedTasks}/{totalTasks}</span>
                    </div>
                </div>
            </Link>

            {openMenuId === board.id.toString() && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setOpenMenuId(null)}
                    />
                    <div className="absolute right-3 top-12 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onEdit();
                            }}
                            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Edit2 className="w-3 h-3" />
                            Edit Board
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onArchive();
                            }}
                            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                        >
                            <Archive className="w-3 h-3" />
                            Archive Board
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(null);
                                onDelete();
                            }}
                            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                            <Trash2 className="w-3 h-3" />
                            Delete Board
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
