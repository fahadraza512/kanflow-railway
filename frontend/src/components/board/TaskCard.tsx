"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/kanban";
import { MessageSquare, Calendar, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComments } from "@/hooks/api/useComments";
import { useSwipeableCard } from "@/hooks/useSwipeGesture";
import { useState } from "react";

interface TaskCardProps {
    task: Task;
    readOnly?: boolean;
    onArchive?: (task: Task) => void;
    onDelete?: (task: Task) => void;
}

export default function TaskCard({ task, readOnly, onArchive, onDelete }: TaskCardProps) {
    // Fetch comments count from API
    const { data: comments = [] } = useComments(task.id as string);
    const commentCount = comments.length;
    const [showActions, setShowActions] = useState(false);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task
        },
        disabled: readOnly
    });

    // Swipe gesture for mobile
    const { elementRef: swipeRef, swipeOffset, swipeStyle } = useSwipeableCard({
        enabled: !readOnly && !isDragging,
        threshold: 80,
        onSwipeLeft: () => {
            if (onArchive) {
                onArchive(task);
            }
        },
        onSwipeRight: () => {
            if (onDelete) {
                onDelete(task);
            }
        }
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "urgent": return "bg-red-50 text-red-600 border-red-100";
            case "high": return "bg-orange-50 text-orange-600 border-orange-100";
            case "medium": return "bg-yellow-50 text-yellow-600 border-yellow-100";
            case "low": return "bg-blue-50 text-blue-600 border-blue-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case "todo": return "bg-gray-50 text-gray-600 border-gray-100";
            case "inProgress": return "bg-blue-50 text-blue-600 border-blue-100";
            case "inReview": return "bg-yellow-50 text-yellow-600 border-yellow-100";
            case "done": return "bg-green-50 text-green-600 border-green-100";
            default: return "bg-gray-50 text-gray-600 border-gray-100";
        }
    };

    const getStatusLabel = (s: string) => {
        switch (s) {
            case "todo": return "To Do";
            case "inProgress": return "In Progress";
            case "inReview": return "In Review";
            case "done": return "Done";
            default: return s;
        }
    };

    const isCompleted = task.status === "done";

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="bg-gray-50 border-2 border-dashed border-gray-300 h-32 rounded-lg w-full" />
        );
    }

    // Show swipe action indicators
    const showLeftAction = swipeOffset > 40; // Delete (swipe right)
    const showRightAction = swipeOffset < -40; // Archive (swipe left)

    return (
        <div className="relative overflow-hidden">
            {/* Swipe action backgrounds */}
            {!readOnly && (
                <>
                    {/* Delete action (left side - swipe right) */}
                    <div className={cn(
                        "absolute inset-y-0 left-0 flex items-center justify-start px-4 bg-red-500 rounded-lg transition-opacity",
                        showLeftAction ? "opacity-100" : "opacity-0"
                    )}>
                        <Trash2 className="w-5 h-5 text-white" />
                    </div>
                    {/* Archive action (right side - swipe left) */}
                    <div className={cn(
                        "absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-blue-500 rounded-lg transition-opacity",
                        showRightAction ? "opacity-100" : "opacity-0"
                    )}>
                        <Archive className="w-5 h-5 text-white" />
                    </div>
                </>
            )}

            <div
                ref={(node) => {
                    setNodeRef(node);
                    if (swipeRef) {
                        (swipeRef as any).current = node;
                    }
                }}
                style={{ ...style, ...swipeStyle }}
                className={cn(
                    "bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative",
                    !readOnly && "cursor-grab active:cursor-grabbing"
                )}
                {...attributes}
                {...listeners}
            >
            {isCompleted && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[9px] font-semibold">Done</span>
                </div>
            )}
            <h4 className={cn(
                "text-xs font-semibold text-gray-900 mb-2 leading-snug line-clamp-2",
                isCompleted && "pr-12 text-gray-500 line-through"
            )}>
                {task.title}
            </h4>

            {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                    {task.labels.slice(0, 3).map((label, idx) => (
                        <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 text-blue-700"
                        >
                            {label}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    getStatusColor(task.status)
                )}>
                    {getStatusLabel(task.status)}
                </span>
                <span className={cn(
                    "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                    getPriorityColor(task.priority)
                )}>
                    {task.priority}
                </span>
                {task.dueDate && (
                    <div className={cn(
                        "flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded",
                        new Date(task.dueDate) < new Date() 
                            ? "bg-red-50 text-red-600" 
                            : "bg-gray-100 text-gray-600"
                    )}>
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center">
                    {task.assigneeId && task.assignee ? (
                        <div 
                            className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-[9px] font-semibold text-white uppercase"
                            title={`${task.assignee.firstName} ${task.assignee.lastName}`}
                        >
                            {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                        </div>
                    ) : (
                        <div 
                            className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center text-[9px] font-semibold text-gray-400 uppercase border border-dashed border-gray-300"
                            title="Unassigned"
                        >
                            ?
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-0.5 text-[9px] font-medium text-gray-400">
                    <MessageSquare className="w-2.5 h-2.5" />
                    <span>{commentCount}</span>
                </div>
            </div>
            </div>
        </div>
    );
}
