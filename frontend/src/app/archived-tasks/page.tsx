"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useArchivedTasksByWorkspace, useRestoreTask, useDeleteTask } from "@/hooks/api";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingState from "@/components/ui/LoadingState";
import TaskDetailPanel from "@/components/task/TaskDetailPanel";
import ArchivedHeader from "@/components/archived/ArchivedHeader";
import ArchivedStats from "@/components/archived/ArchivedStats";
import ArchivedTaskList from "@/components/archived/ArchivedTaskList";
import ArchivedInfoBox from "@/components/archived/ArchivedInfoBox";
import { Task } from "@/types/api.types";

export default function ArchivedTasksPage() {
    const { activeWorkspace } = useWorkspaceStore();
    // Query will automatically refetch when activeWorkspace.id changes
    const { data: archivedTasks = [], isLoading } = useArchivedTasksByWorkspace(activeWorkspace?.id || null);
    
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
    const [filterProject, setFilterProject] = useState<string>("all");

    const restoreTaskMutation = useRestoreTask();
    const deleteTaskMutation = useDeleteTask();

    // Extract unique projects from tasks (via board relation)
    const projectsMap = new Map();
    archivedTasks.forEach(task => {
        const board = (task as any).board;
        if (board && board.projectId) {
            if (!projectsMap.has(board.projectId)) {
                projectsMap.set(board.projectId, {
                    id: board.projectId,
                    name: board.project?.name || `Project ${board.projectId.substring(0, 8)}...`
                });
            }
        }
    });
    const projects = Array.from(projectsMap.values());

    // Filter tasks by project
    const filteredTasks = filterProject === "all" 
        ? archivedTasks 
        : archivedTasks.filter(t => {
            const board = (t as any).board;
            return board && board.projectId === filterProject;
        });

    const handleRestore = (taskId: string) => {
        restoreTaskMutation.mutate(
            taskId,
            {
                onSuccess: () => showToast.success("Task restored successfully!"),
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to restore task";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    const handleDelete = (taskId: string) => {
        if (confirm("Permanently delete this task? This action cannot be undone.")) {
            // Find the task to get boardId and listId
            const task = archivedTasks.find(t => t.id === taskId);
            if (!task) return;
            
            deleteTaskMutation.mutate(
                { 
                    id: taskId,
                    boardId: task.boardId as string,
                    listId: task.listId as string
                },
                {
                    onSuccess: () => showToast.success("Task deleted permanently"),
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Failed to delete task";
                        showToast.error(errorMessage);
                    }
                }
            );
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailPanelOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailPanelOpen(false);
        setSelectedTask(null);
    };

    const handleTaskUpdate = () => {
        // React Query will automatically refetch
    };

    // Show no workspace state
    if (!activeWorkspace?.id) {
        return (
            <DashboardLayout>
                <main className="max-w-7xl mx-auto px-4 py-3">
                    <div className="mb-4">
                        <h1 className="text-base font-bold text-gray-900">Archived Tasks</h1>
                        <p className="text-gray-500 mt-0.5 text-[10px]">View and manage archived tasks</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <p className="text-yellow-800 font-medium mb-4">No workspace selected</p>
                        <a href="/dashboard/workspace" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                            Create Workspace
                        </a>
                    </div>
                </main>
            </DashboardLayout>
        );
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <main className="max-w-7xl mx-auto px-4 py-3">
                    <div className="mb-4">
                        <h1 className="text-base font-bold text-gray-900">Archived Tasks</h1>
                        <p className="text-gray-500 mt-0.5 text-[10px]">{activeWorkspace.name} • View and manage archived tasks</p>
                    </div>
                    <LoadingState message="Loading archived tasks..." />
                </main>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <main className="max-w-7xl mx-auto px-4 py-3">
                <div className="mb-4">
                    <h1 className="text-base font-bold text-gray-900">Archived Tasks</h1>
                    <p className="text-gray-500 mt-0.5 text-[10px]">{activeWorkspace.name} • View and manage archived tasks</p>
                </div>
                <ArchivedHeader 
                    projects={projects}
                    filterProject={filterProject}
                    onFilterChange={setFilterProject}
                />
                <ArchivedStats 
                    totalArchived={archivedTasks.length}
                    filteredCount={filteredTasks.length}
                    projectsCount={projects.length}
                />
                <ArchivedTaskList 
                    tasks={filteredTasks}
                    filterProject={filterProject}
                    onRestore={handleRestore}
                    onDelete={handleDelete}
                    onTaskClick={handleTaskClick}
                />
                <ArchivedInfoBox />
            </main>

            {selectedTask && (
                <TaskDetailPanel
                    task={selectedTask}
                    isOpen={isDetailPanelOpen}
                    onClose={handleCloseDetail}
                    onUpdate={handleTaskUpdate}
                />
            )}
        </DashboardLayout>
    );
}
