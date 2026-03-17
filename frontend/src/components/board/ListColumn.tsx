"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { List, Task } from "@/types/kanban";
import { Plus, GripVertical, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react";
import TaskCard from "@/components/board/TaskCard";
import EmptyListState from "@/components/board/EmptyListState";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { clsx } from "clsx";
import { useCreateTask } from "@/hooks/api";
import { useState, useRef, useEffect } from "react";
import { showToast } from "@/lib/toast";
import { useUpdateList, useDeleteList } from "@/hooks/api/useLists";

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
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(list.name);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const renameInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const createTaskMutation = useCreateTask();
    const updateListMutation = useUpdateList();
    const deleteListMutation = useDeleteList();

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (isRenaming) renameInputRef.current?.focus();
    }, [isRenaming]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: list.id,
        data: { type: "List", list },
        disabled: readOnly || groupBy !== 'none'
    });

    const handleQuickAdd = async () => {
        if (quickTitle.trim()) {
            try {
                await createTaskMutation.mutateAsync({
                    listId: list.id.toString(),
                    boardId: list.boardId.toString(),
                    projectId,
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

    const handleRename = async () => {
        const trimmed = renameValue.trim();
        if (!trimmed || trimmed === list.name) {
            setIsRenaming(false);
            setRenameValue(list.name);
            return;
        }
        try {
            await updateListMutation.mutateAsync({
                id: list.id.toString(),
                data: { name: trimmed }
            });
            setIsRenaming(false);
            onUpdate?.();
        } catch {
            showToast.error("Failed to rename column");
            setRenameValue(list.name);
            setIsRenaming(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteListMutation.mutateAsync({
                id: list.id.toString(),
                boardId: list.boardId.toString()
            });
            setShowDeleteConfirm(false);
            onUpdate?.();
        } catch {
            showToast.error("Failed to delete column");
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
            default: return "bg-orange-400";
        }
    };

    const getDotRingColor = (name: string) => {
        switch (name.toLowerCase()) {
            case "backlog": return "bg-slate-400/50";
            case "in progress": return "bg-blue-500/50";
            case "in review": return "bg-purple-500/50";
            case "done": return "bg-green-500/50";
            default: return "bg-orange-400/50";
        }
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style} className="bg-gray-50 border-2 border-dashed border-gray-300 w-[260px] h-full rounded-lg shrink-0" />
        );
    }

    return (
        <div ref={setNodeRef} style={style} className="w-[260px] h-full shrink-0 flex flex-col">
            {/* Header */}
            <div className="p-3 flex justify-between items-center group/header">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    {!readOnly && groupBy === 'none' && (
                        <button
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                        >
                            <GripVertical className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <div className="relative flex items-center justify-center w-4 h-4 flex-shrink-0">
                        <div className={clsx("absolute w-3 h-3 rounded-full animate-ping", getDotRingColor(list.name))} />
                        <div className={clsx("absolute w-2 h-2 rounded-full animate-pulse opacity-60", getDotColor(list.name))} />
                        <div className={clsx("relative w-1.5 h-1.5 rounded-full", getDotColor(list.name))} />
                    </div>

                    {isRenaming ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                            <input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") handleRename();
                                    if (e.key === "Escape") { setIsRenaming(false); setRenameValue(list.name); }
                                }}
                                className="flex-1 min-w-0 text-[10px] font-bold uppercase tracking-wide text-gray-900 bg-white border border-blue-400 rounded px-1 py-0.5 focus:outline-none"
                            />
                            <button onClick={handleRename} className="text-green-600 hover:text-green-700 flex-shrink-0">
                                <Check className="w-3 h-3" />
                            </button>
                            <button onClick={() => { setIsRenaming(false); setRenameValue(list.name); }} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <h3 className="font-bold text-[10px] uppercase tracking-wide text-gray-900 truncate">
                            {list.name} <span className="text-gray-400 ml-1">{tasks.length}</span>
                        </h3>
                    )}
                </div>

                {/* Column menu */}
                {!readOnly && !isRenaming && groupBy === 'none' && (
                    <div className="relative flex-shrink-0" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="opacity-0 group-hover/header:opacity-100 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
                        >
                            <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-6 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36">
                                <button
                                    onClick={() => { setIsRenaming(true); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                                >
                                    <Pencil className="w-3 h-3" /> Rename
                                </button>
                                <button
                                    onClick={() => { setShowDeleteConfirm(true); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete column
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && (
                <div className="mx-2 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium mb-1">Delete "{list.name}"?</p>
                    {tasks.length > 0 && (
                        <p className="text-xs text-red-600 mb-2">{tasks.length} task{tasks.length !== 1 ? 's' : ''} will be deleted.</p>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            disabled={deleteListMutation.isPending}
                            className="flex-1 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {deleteListMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-1 text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Task Area */}
            <div className="flex-1 p-1 space-y-2 overflow-y-auto scrollbar-hide">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 && !isQuickAdding ? (
                        <EmptyListState listName={list.name} />
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
                            onChange={e => setQuickTitle(e.target.value)}
                            onBlur={handleQuickAdd}
                            onKeyDown={e => {
                                if (e.key === "Enter") { e.preventDefault(); handleQuickAdd(); }
                                if (e.key === "Escape") { setQuickTitle(""); setIsQuickAdding(false); }
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
