"use client";

import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { List, Task } from "@/types/kanban";
import ListColumn from "@/components/board/ListColumn";
import TaskCard from "@/components/board/TaskCard";
import EmptyBoardState from "@/components/board/EmptyBoardState";
import { useUpdateTask } from "@/hooks/api/useTasks";
import { useReorderLists, useCreateList } from "@/hooks/api/useLists";
import { Plus } from "lucide-react";

// Helper function to map list name to task status
function getStatusFromListName(listName: string): string {
    const lowerName = listName.toLowerCase();
    if (lowerName.includes("progress")) return "inProgress";
    if (lowerName.includes("review")) return "inReview";
    if (lowerName.includes("done") || lowerName.includes("complete")) return "done";
    return "todo"; // Default for Backlog or any other list
}

interface BoardViewProps {
    lists: List[];
    tasks: Task[];
    onTaskUpdate: () => void;
    onTaskClick: (task: Task) => void;
    projectId: string;
    workspaceId: string;
    readOnly?: boolean;
    groupBy?: string;
}

export default function BoardView({
    lists,
    tasks,
    onTaskUpdate,
    onTaskClick,
    projectId,
    workspaceId,
    readOnly,
    groupBy = 'none'
}: BoardViewProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeList, setActiveList] = useState<List | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState("");

    // API mutations
    const updateTaskMutation = useUpdateTask();
    const reorderListsMutation = useReorderLists();
    const createListMutation = useCreateList();

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activeSensors = readOnly ? [] : sensors;

    const handleAddColumn = async () => {
        const name = newColumnName.trim();
        if (!name) { setIsAddingColumn(false); return; }
        const boardId = lists[0]?.boardId?.toString();
        if (!boardId) return;
        try {
            await createListMutation.mutateAsync({ boardId, name });
            setNewColumnName("");
            setIsAddingColumn(false);
            onTaskUpdate();
        } catch {
            // error toast handled by hook
        }
    };

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "List") {
            setActiveList(event.active.data.current.list);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";

        if (!isActiveATask) return;

        // Im dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const overIndex = tasks.findIndex((t) => t.id === overId);

            if (tasks[activeIndex].listId !== tasks[overIndex].listId) {
                // Moving to different list/group
                const newListId = tasks[overIndex].listId;
                const overTaskPosition = tasks[overIndex].position;
                
                // Prepare update data based on grouping mode
                const updateData: any = { position: overTaskPosition };
                
                if (groupBy === 'none') {
                    // Normal mode: update listId and status
                    const targetList = lists.find(l => l.id === newListId);
                    const status = getStatusFromListName(targetList?.name || "");
                    updateData.listId = newListId;
                    updateData.status = status;
                } else if (groupBy === 'priority') {
                    // Priority grouping: update priority
                    updateData.priority = newListId;
                } else if (groupBy === 'status') {
                    // Status grouping: update status
                    updateData.status = newListId;
                } else if (groupBy === 'assignee') {
                    // Assignee grouping: update assigneeId
                    updateData.assigneeId = newListId === 'unassigned' ? null : newListId;
                }

                updateTaskMutation.mutate({
                    id: activeId.toString(),
                    data: updateData
                }, {
                    onSuccess: () => {
                        onTaskUpdate();
                    }
                });
            } else {
                // Reordering within same list/group - update position via API
                const listId = tasks[activeIndex].listId;
                const listTasks = tasks.filter(t => t.listId === listId);
                const activeTaskIndex = listTasks.findIndex(t => t.id === activeId);
                const overTaskIndex = listTasks.findIndex(t => t.id === overId);
                
                if (activeTaskIndex !== overTaskIndex) {
                    const overTaskPosition = listTasks[overTaskIndex].position;
                    
                    updateTaskMutation.mutate({
                        id: activeId.toString(),
                        data: {
                            position: overTaskPosition
                        }
                    }, {
                        onSuccess: () => {
                            onTaskUpdate();
                        }
                    });
                }
            }
        }

        // Im dropping a Task over a Column
        const isOverAColumn = over.data.current?.type === "List";
        if (isActiveATask && isOverAColumn) {
            const activeIndex = tasks.findIndex((t) => t.id === activeId);
            const newListId = overId.toString();

            if (tasks[activeIndex].listId !== newListId) {
                // Get the last position in the target list
                const targetListTasks = tasks.filter(t => t.listId === newListId);
                const maxPosition = targetListTasks.length > 0 
                    ? Math.max(...targetListTasks.map(t => t.position))
                    : 0;

                // Prepare update data based on grouping mode
                const updateData: any = { position: maxPosition + 1 };
                
                if (groupBy === 'none') {
                    // Normal mode: update listId and status
                    const targetList = over.data.current?.list;
                    const status = getStatusFromListName(targetList?.name || "");
                    updateData.listId = newListId;
                    updateData.status = status;
                } else if (groupBy === 'priority') {
                    // Priority grouping: update priority
                    updateData.priority = newListId;
                } else if (groupBy === 'status') {
                    // Status grouping: update status
                    updateData.status = newListId;
                } else if (groupBy === 'assignee') {
                    // Assignee grouping: update assigneeId
                    updateData.assigneeId = newListId === 'unassigned' ? null : newListId;
                }

                updateTaskMutation.mutate({
                    id: activeId.toString(),
                    data: updateData
                }, {
                    onSuccess: () => {
                        onTaskUpdate();
                    }
                });
            }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        setActiveList(null);
        const { active, over } = event;
        if (!over) return;

        if (active.id === over.id) return;

        // Handle List reordering (only in normal mode, not in grouped mode)
        if (active.data.current?.type === "List" && over.data.current?.type === "List" && groupBy === 'none') {
            const oldIndex = lists.findIndex(l => l.id === active.id);
            const newIndex = lists.findIndex(l => l.id === over.id);
            
            if (oldIndex !== newIndex) {
                const newLists = [...lists];
                const [movedList] = newLists.splice(oldIndex, 1);
                newLists.splice(newIndex, 0, movedList);
                
                // Update positions via API
                const listIds = newLists.map(l => l.id.toString());
                const boardId = lists[0].boardId;
                
                reorderListsMutation.mutate({
                    boardId: boardId.toString(),
                    listIds
                }, {
                    onSuccess: () => {
                        onTaskUpdate();
                    }
                });
            }
        }
    };

    const onDragCancel = () => {
        setActiveTask(null);
        setActiveList(null);
    };

    return (
        <DndContext
            sensors={activeSensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
        >
            {lists.length === 0 ? (
                <EmptyBoardState 
                    onCreateList={() => {
                        // TODO: Implement list creation modal
                        console.log("Create list clicked");
                    }}
                />
            ) : (
                <div className="flex gap-3 h-full items-start overflow-x-auto pb-6 px-3 md:px-4 pt-4 custom-scrollbar board-scroll snap-x snap-mandatory md:snap-none">
                    <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                        {lists.map((list) => (
                            <div key={list.id} className="board-column snap-start md:snap-align-none flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-80 lg:w-80">
                                <ListColumn
                                    list={list}
                                    tasks={tasks.filter(t => t.listId === list.id)}
                                    onTaskClick={onTaskClick}
                                    projectId={projectId}
                                    workspaceId={workspaceId}
                                    readOnly={readOnly}
                                    onUpdate={onTaskUpdate}
                                    groupBy={groupBy}
                                />
                            </div>
                        ))}
                    </SortableContext>

                    {/* Add Column button — only in normal (non-grouped) mode */}
                    {!readOnly && groupBy === 'none' && (
                        <div className="flex-shrink-0 w-[260px] pt-1">
                            {isAddingColumn ? (
                                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Column name..."
                                        value={newColumnName}
                                        onChange={e => setNewColumnName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") { e.preventDefault(); handleAddColumn(); }
                                            if (e.key === "Escape") { setIsAddingColumn(false); setNewColumnName(""); }
                                        }}
                                        className="w-full text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddColumn}
                                            disabled={createListMutation.isPending}
                                            className="flex-1 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {createListMutation.isPending ? "Adding..." : "Add column"}
                                        </button>
                                        <button
                                            onClick={() => { setIsAddingColumn(false); setNewColumnName(""); }}
                                            className="flex-1 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingColumn(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-semibold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add column
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <DragOverlay dropAnimation={null}>
                {activeTask && (
                    <div className="rotate-2 shadow-2xl cursor-grabbing">
                        <TaskCard task={activeTask} />
                    </div>
                )}
                {activeList && (
                    <div className="opacity-50">
                        <ListColumn
                            list={activeList}
                            tasks={tasks.filter(t => t.listId === activeList.id)}
                            onTaskClick={() => { }}
                            projectId={projectId}
                            workspaceId={workspaceId}
                        />
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
