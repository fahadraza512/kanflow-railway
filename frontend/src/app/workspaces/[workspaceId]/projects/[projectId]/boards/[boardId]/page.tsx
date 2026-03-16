"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBoard, useTasks, useProject } from "@/hooks/api";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useVisibilityPolling } from "@/hooks/useRealtimeUpdates";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BoardView from "@/components/board/BoardView";
import BoardToolbar from "@/components/board/BoardToolbar";
import BoardStatsBar from "@/components/board/BoardStatsBar";
import CreateTaskModal from "@/components/task/CreateTaskModal";
import TaskDetailPanel from "@/components/task/TaskDetailPanel";
import AdvancedFilters, { FilterOptions, applyFilters } from "@/components/board/AdvancedFilters";
import { Task } from "@/types/api.types";
import { BoardColumnSkeleton } from "@/components/ui/LoadingSkeleton";
import { useWorkspaceRole } from "@/hooks/useWorkspaceRole";

export default function BoardPage() {
    const { workspaceId, projectId, boardId } = useParams();
    const router = useRouter();
    const { isViewer, canCreateTask } = useWorkspaceRole();
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [groupBy, setGroupBy] = useState<string>("none");
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});

    // Fetch board and tasks data
    const { 
        data: board, 
        isLoading: isLoadingBoard, 
        error: boardError,
        dataUpdatedAt: boardUpdatedAt,
        refetch: refetchBoard
    } = useBoard(boardId as string);
    
    const { 
        data: project,
        isLoading: isLoadingProject
    } = useProject(projectId as string);
    
    const { 
        data: tasks = [], 
        isLoading: isLoadingTasks,
        refetch: refetchTasks
    } = useTasks(boardId as string);

    const isLoading = isLoadingBoard || isLoadingTasks || isLoadingProject;
    const lastSync = new Date(boardUpdatedAt);

    // Real-time updates using visibility-based polling
    useVisibilityPolling({
        enabled: !isLoading && !!boardId,
        interval: 30000, // Poll every 30 seconds
        queryKeys: [
            ['board', boardId as string],
            ['tasks', boardId as string]
        ]
    });

    // Extract lists from board (assuming board has lists array)
    const lists = useMemo(() => board?.lists || [], [board]);

    // Get available assignees and labels for filters
    const availableAssignees = useMemo(() => {
        const assigneeMap = new Map<string, { id: string; name: string }>();
        tasks.forEach(task => {
            if (task.assigneeId && task.assignee) {
                assigneeMap.set(task.assigneeId, {
                    id: task.assigneeId,
                    name: `${task.assignee.firstName} ${task.assignee.lastName}`
                });
            }
        });
        return Array.from(assigneeMap.values());
    }, [tasks]);

    const availableLabels = useMemo(() => {
        const labelSet = new Set<string>();
        tasks.forEach(task => {
            if (task.labels && Array.isArray(task.labels)) {
                task.labels.forEach(label => labelSet.add(label));
            }
        });
        return Array.from(labelSet);
    }, [tasks]);

    // Filter tasks based on search term (must come before groupedTasks)
    const filteredTasks = useMemo(() => {
        let result = tasks;

        // Apply search filter
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            result = result.filter(task => 
                task.title?.toLowerCase().includes(search) ||
                task.description?.toLowerCase().includes(search)
            );
        }

        // Apply advanced filters
        result = applyFilters(result, filters);

        return result;
    }, [tasks, searchTerm, filters]);

    // Create virtual lists based on grouping
    const groupedLists = useMemo(() => {
        if (!board) return lists;
        
        if (groupBy === 'none') {
            return lists; // Use actual lists from database
        }
        
        if (groupBy === 'priority') {
            return [
                { id: 'urgent', name: 'Urgent', boardId: board.id, position: 0, color: '#EF4444' },
                { id: 'high', name: 'High', boardId: board.id, position: 1, color: '#F59E0B' },
                { id: 'medium', name: 'Medium', boardId: board.id, position: 2, color: '#3B82F6' },
                { id: 'low', name: 'Low', boardId: board.id, position: 3, color: '#10B981' },
            ];
        }
        
        if (groupBy === 'status') {
            return [
                { id: 'todo', name: 'To Do', boardId: board.id, position: 0, color: '#6B7280' },
                { id: 'inProgress', name: 'In Progress', boardId: board.id, position: 1, color: '#3B82F6' },
                { id: 'inReview', name: 'In Review', boardId: board.id, position: 2, color: '#F59E0B' },
                { id: 'done', name: 'Done', boardId: board.id, position: 3, color: '#10B981' },
            ];
        }
        
        if (groupBy === 'assignee') {
            // Get unique assignees from tasks
            const assigneeMap = new Map();
            tasks.forEach(task => {
                if (task.assigneeId && !assigneeMap.has(task.assigneeId)) {
                    assigneeMap.set(task.assigneeId, {
                        id: task.assigneeId,
                        name: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unknown',
                        boardId: board.id,
                        position: assigneeMap.size,
                        color: '#8B5CF6'
                    });
                }
            });
            
            // Add unassigned column
            const assigneeColumns = Array.from(assigneeMap.values());
            assigneeColumns.push({
                id: 'unassigned',
                name: 'Unassigned',
                boardId: board.id,
                position: assigneeColumns.length,
                color: '#6B7280'
            });
            
            return assigneeColumns;
        }
        
        return lists;
    }, [groupBy, lists, tasks, board]);

    // Map tasks to virtual lists based on grouping
    const groupedTasks = useMemo(() => {
        if (groupBy === 'none') {
            return filteredTasks; // Use tasks as-is with their actual listId
        }
        
        // Map tasks to virtual lists based on grouping field
        return filteredTasks.map(task => {
            let virtualListId = task.listId;
            
            if (groupBy === 'priority') {
                virtualListId = task.priority || 'low';
            } else if (groupBy === 'status') {
                virtualListId = task.status || 'todo';
            } else if (groupBy === 'assignee') {
                virtualListId = task.assigneeId || 'unassigned';
            }
            
            return {
                ...task,
                listId: virtualListId,
                originalListId: task.listId // Store original for reference
            };
        });
    }, [groupBy, filteredTasks]);

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailPanelOpen(true);
    };

    const handleRefresh = async () => {
        try {
            await Promise.all([refetchBoard(), refetchTasks()]);
        } catch (error) {
            console.error('Failed to refresh board:', error);
        }
    };

    // Task navigation handlers
    const handleNextTask = () => {
        if (!selectedTask) return;
        const currentIndex = groupedTasks.findIndex(t => t.id === selectedTask.id);
        if (currentIndex < groupedTasks.length - 1) {
            setSelectedTask(groupedTasks[currentIndex + 1]);
        }
    };

    const handlePreviousTask = () => {
        if (!selectedTask) return;
        const currentIndex = groupedTasks.findIndex(t => t.id === selectedTask.id);
        if (currentIndex > 0) {
            setSelectedTask(groupedTasks[currentIndex - 1]);
        }
    };

    // Check if navigation is available
    const canNavigateNext = selectedTask ? groupedTasks.findIndex(t => t.id === selectedTask.id) < groupedTasks.length - 1 : false;
    const canNavigatePrevious = selectedTask ? groupedTasks.findIndex(t => t.id === selectedTask.id) > 0 : false;

    // Update selectedTask when tasks data changes (to reflect updates)
    useEffect(() => {
        if (selectedTask && tasks.length > 0) {
            const updatedTask = tasks.find(t => t.id === selectedTask.id);
            if (updatedTask) {
                setSelectedTask(updatedTask);
            }
        }
    }, [tasks, selectedTask]);

    const handleTaskUpdate = () => {
        // Force refetch tasks to update the UI
        refetchTasks();
    };

    // Keyboard shortcuts
    useKeyboardShortcuts([
        {
            key: 'Escape',
            callback: () => {
                if (isDetailPanelOpen) {
                    setIsDetailPanelOpen(false);
                    setSelectedTask(null);
                }
            },
            description: 'Close task detail panel'
        },
        {
            key: 'c',
            callback: () => {
                if (!isDetailPanelOpen && lists.length > 0) {
                    setIsCreateModalOpen(true);
                }
            },
            description: 'Create new task'
        },
        {
            key: '/',
            callback: () => {
                const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                }
            },
            description: 'Focus search'
        },
        {
            key: 'ArrowRight',
            shift: true,
            callback: () => {
                if (isDetailPanelOpen && canNavigateNext) {
                    handleNextTask();
                }
            },
            description: 'Next task'
        },
        {
            key: 'ArrowLeft',
            shift: true,
            callback: () => {
                if (isDetailPanelOpen && canNavigatePrevious) {
                    handlePreviousTask();
                }
            },
            description: 'Previous task'
        }
    ], !isCreateModalOpen); // Disable when modal is open

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] flex flex-col bg-[#F9FAFB]">
                    <div className="px-4 pt-3">
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-4" />
                    </div>
                    <div className="px-4 py-3 border-b border-gray-200">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="flex-1 overflow-hidden p-4">
                        <div className="flex gap-4 h-full overflow-x-auto">
                            {[1, 2, 3].map((i) => (
                                <BoardColumnSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Error state
    if (boardError || !board) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <ErrorState 
                        type="404"
                        title="Board not found"
                        message="The board you're looking for doesn't exist or has been removed."
                        onRetry={() => router.back()}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] flex flex-col bg-[#F9FAFB]">
                <div className="px-4 pt-3">
                    <Breadcrumbs
                        items={[
                            { label: "Dashboard", href: "/dashboard" },
                            { 
                                label: project?.name || "Project", 
                                href: `/workspaces/${workspaceId}/projects/${projectId}` 
                            },
                            { label: board.name }
                        ]}
                    />
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <BoardToolbar
                        boardId={board.id}
                        boardName={board.name}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onUpdateBoard={handleTaskUpdate}
                        readOnly={false}
                        groupBy={groupBy}
                        onGroupByChange={setGroupBy}
                        onOpenFilters={() => setIsFiltersOpen(true)}
                        activeFiltersCount={Object.keys(filters).length}
                    />
                    
                    <main className="flex-1 overflow-hidden">
                        <BoardView
                            lists={groupedLists}
                            tasks={groupedTasks}
                            onTaskUpdate={handleTaskUpdate}
                            onTaskClick={handleTaskClick}
                            projectId={projectId as string}
                            workspaceId={workspaceId as string}
                            readOnly={false}
                            groupBy={groupBy}
                        />
                    </main>

                    {/* Bottom Stats Bar - Hidden on mobile, visible on desktop */}
                    <div className="hidden lg:block">
                        <BoardStatsBar
                            tasks={tasks}
                            lastSync={lastSync}
                            onRefresh={handleRefresh}
                        />
                    </div>
                </div>

                {lists.length > 0 && (
                    <CreateTaskModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        boardId={boardId as string}
                        projectId={projectId as string}
                        workspaceId={workspaceId as string}
                        listId={lists[0].id.toString()}
                        onSuccess={handleTaskUpdate}
                    />
                )}

                {selectedTask && (
                    <TaskDetailPanel
                        task={selectedTask}
                        isOpen={isDetailPanelOpen}
                        onClose={() => {
                            setIsDetailPanelOpen(false);
                            setSelectedTask(null);
                        }}
                        onUpdate={handleTaskUpdate}
                        readOnly={isViewer}
                        onNext={canNavigateNext ? handleNextTask : undefined}
                        onPrevious={canNavigatePrevious ? handlePreviousTask : undefined}
                        lists={lists}
                    />
                )}

                <AdvancedFilters
                    isOpen={isFiltersOpen}
                    onClose={() => setIsFiltersOpen(false)}
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableAssignees={availableAssignees}
                    availableLabels={availableLabels}
                />
            </div>
        </DashboardLayout>
    );
}
