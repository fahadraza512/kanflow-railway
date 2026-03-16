import { ArchiveRestore, Trash2, Calendar, User, Flag, Archive } from "lucide-react";
import { clsx } from "clsx";
import { Task } from "@/lib/storage";

interface ArchivedTaskItemProps {
    task: Task;
    onRestore: (taskId: string | number) => void;
    onDelete: (taskId: string | number, taskTitle: string) => void;
    onTaskClick: (task: Task) => void;
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "urgent": return "text-red-600 bg-red-50";
        case "high": return "text-orange-600 bg-orange-50";
        case "medium": return "text-yellow-600 bg-yellow-50";
        case "low": return "text-green-600 bg-green-50";
        default: return "text-gray-600 bg-gray-50";
    }
};

export default function ArchivedTaskItem({ task, onRestore, onDelete, onTaskClick }: ArchivedTaskItemProps) {
    return (
        <div className="p-4 hover:bg-gray-50 transition-colors group">
            <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <button
                            onClick={() => onTaskClick(task)}
                            className="text-left flex-1"
                        >
                            <h3 className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                                {task.title}
                            </h3>
                            {task.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                    {task.description}
                                </p>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        {/* Project and Board info */}
                        {(task as any).board && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md font-semibold">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <span>{(task as any).board.name}</span>
                            </div>
                        )}
                        
                        <div className={clsx(
                            "flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold",
                            getPriorityColor(task.priority)
                        )}>
                            <Flag className="w-3 h-3" />
                            <span className="capitalize">{task.priority}</span>
                        </div>

                        {task.assigneeId && (task as any).assignee && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-semibold">
                                <User className="w-3 h-3" />
                                <span>{(task as any).assignee.firstName} {(task as any).assignee.lastName}</span>
                            </div>
                        )}

                        {task.dueDate && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-semibold">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                        )}

                        {task.labels && task.labels.length > 0 && task.labels.map(label => (
                            <span
                                key={label}
                                className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-md font-semibold"
                            >
                                {label}
                            </span>
                        ))}

                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md font-medium">
                            <Archive className="w-3 h-3" />
                            <span>Archived {new Date(task.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onRestore(task.id)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        title="Restore task"
                    >
                        <ArchiveRestore className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task.id, task.title)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        title="Delete permanently"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
