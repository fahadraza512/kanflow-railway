"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { List, Task } from "@/types/kanban";
import { Plus, GripVertical } from "lucide-react";
import TaskCard from "@/components/board/TaskCard";
import EmptyListState from "@/components/board/EmptyListState";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { useCreateTask } from "@/hooks/api";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface ListColumnProps {
    list: List;
    tasks: Task[];
    onTaskClick: (task: Task) => void;
    projectId: string;
    workspaceId: string;
    readOnly?: boolean;
    onUpdate?: () => void;
    groupBy?: string;
}

export default function ListColumn({
    list,
    tasks,
    onTaskClick,
    projectId,
    workspaceId,
    readOnly,
    onUpdate,
    groupBy = 'none'
}: ListColumnProps) {
    const [isQuickAdding, setIsQuickAdding] = useState(false);
    const [quickTitle, setQuickTitle] = useState("");
    
    const createTaskMutation = useCreateTask();

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: list.id,
        data: {
            type: "List",
            list
        },
        disabled: readOnly || groupBy !== 'none' // Disable dragging in grouped mode
    });

    const handleQuickAdd = async () => {
        if (quickTitle.trim()) {
            try {
                await createTaskMutation.mutateAsync({
                    listId: list.id.toString(),
                    boardId: list.boardId.toString(),
                    projectId: projectId,
                    title: quickTitle.trim(),
                    description: "",
                    priority: "medium",
                    status: list.name.toLowerCase() === "backlog" ? "todo" :
                        list.name.toLowerCase() === "in progress" ? "inProgress" :
                            list.name.toLowerCase() === "in review" ? "inReview" :
                                list.name.toLowerCase() === "done" ? "done" : "todo",
                    position: tasks.length
                });
                
                setQuickTitle("");
                setIsQuickAdding(false);
                onUpdate?.();
            } catch (error: any) {
                showToast.error(error?.message || "Failed to create task");
            }
        } else {
            setIsQuickAdding(false);
        }
    };

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const getDotColor = (name: string) => {
        switch (name.toLowerCase()) {
            case "backlog": return "bg-slate-400";
            case "in progress": return "bg-blue-500";
            case "in review": return "bg-purple-500";
            case "done": return "bg-green-500";
            default: return "bg-gray-300";
        }
    };

    const getDotRingColor = (name: string) => {
        switch (name.toLowerCase()) {
            case "backlog": return "bg-slate-400/50";
            case "in progress": return "bg-blue-500/50";
            case "in review": return "bg-purple-500/50";
            case "done": return "bg-green-500/50";
            default: return "bg-gray-300/50";
        }
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="bg-gray-50 border-2 border-dashed border-gray-300 w-[260px] h-full rounded-lg shrink-0" />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-[260px] h-full shrink-0 flex flex-col"
        >
            {/* Header */}
            <div className="p-3 flex justify-between items-center group/header">
                <div className="flex items-center gap-2 flex-1">
                    {!readOnly && groupBy === 'none' && (
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <GripVertical className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="relative flex items-center justify-center w-4 h-4">
                        {/* Outer pulsing ring */}
                        <div className={clsx(
                            "absolute w-3 h-3 rounded-full animate-ping",
                            getDotRingColor(list.name)
                        )} />
                        {/* Middle ring */}
                        <div className={clsx(
                            "absolute w-2 h-2 rounded-full animate-pulse",
                            getDotColor(list.name),
                            "opacity-60"
                        )} />
                        {/* Center dot */}
                        <div className={clsx(
                            "relative w-1.5 h-1.5 rounded-full",
                            getDotColor(list.name)
                        )} />
                    </div>
                    <h3 className="font-bold text-[10px] uppercase tracking-wide text-gray-900">
                        {list.name} <span className="text-gray-400 ml-1">{tasks.length}</span>
                    </h3>
                </div>
            </div>

            {/* Task Area */}
            <div className="flex-1 p-1 space-y-2 overflow-y-auto scrollbar-hide">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 && !isQuickAdding ? (
                        <EmptyListState 
                            listName={list.name}
                        />
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} onClick={() => onTaskClick(task)}>
                                <TaskCard task={task} readOnly={readOnly} />
                            </div>
                        ))
                    )}
                </SortableContext>

                {isQuickAdding && (
                    <div className="bg-white p-3 rounded-lg shadow-sm border-2 border-gray-200">
                        <input
                            autoFocus
                            type="text"
                            className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none"
                            placeholder="Task title..."
                            value={quickTitle}
                            onChange={(e) => setQuickTitle(e.target.value)}
                            onBlur={handleQuickAdd}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleQuickAdd();
                                }
                                if (e.key === "Escape") {
                                    setQuickTitle("");
                                    setIsQuickAdding(false);
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Footer Add Button */}
            {!readOnly && (
                <div className="p-2">
                    <button
                        onClick={() => setIsQuickAdding(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-xs font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Task
                    </button>
                </div>
            )}
        </div>
    );
}
