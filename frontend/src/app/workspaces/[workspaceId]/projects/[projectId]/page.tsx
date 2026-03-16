"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject, useBoards, useArchivedBoards, useArchiveBoard, useRestoreBoard, useDeleteBoard, useReorderBoards } from "@/hooks/api";
import { useWorkspace } from "@/hooks/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useVisibilityPolling } from "@/hooks/useRealtimeUpdates";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ProjectHeader from "@/components/project/ProjectHeader";
import PlanLimitWarning from "@/components/project/PlanLimitWarning";
import ArchivedBoardsSection from "@/components/project/ArchivedBoardsSection";
import EmptyBoardsState from "@/components/project/EmptyBoardsState";
import BoardsGrid from "@/components/project/BoardsGrid";
import CreateBoardModal from "@/components/board/CreateBoardModal";
import EditBoardModal from "@/components/board/EditBoardModal";
import { Board } from "@/types/api.types";
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const projectId = params.projectId as string;
    const workspaceId = params.workspaceId as string;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [showArchived, setShowArchived] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);

    // Fetch data - always fetch archived boards to show count
    const { data: project, isLoading: isLoadingProject, error: projectError } = useProject(projectId);
    const { data: boards = [], isLoading: isLoadingBoards } = useBoards(projectId);
    const { data: archivedBoards = [], isLoading: isLoadingArchived } = useArchivedBoards(projectId);
    const { data: workspace } = useWorkspace(workspaceId);

    // Check access control
    useEffect(() => {
        if (!project || !workspace || !user?.id) {
            return;
        }

        // Owner always has access
        if (workspace.ownerId === user.id) {
            setHasAccess(true);
            return;
        }

        // For members, access is granted by the API (membership check happens server-side)
        // If we got the project data, user has access
        setHasAccess(true);
    }, [project, workspace, user?.id]);

    // Redirect if no access
    useEffect(() => {
        if (!isLoadingProject && !hasAccess) {
            showToast.error("You don't have access to this project");
            router.push("/dashboard");
        }
    }, [hasAccess, isLoadingProject, router]);

    // Mutations
    const archiveBoardMutation = useArchiveBoard();
    const restoreBoardMutation = useRestoreBoard();
    const deleteBoardMutation = useDeleteBoard();
    const reorderBoardsMutation = useReorderBoards();

    const isLoading = isLoadingProject || isLoadingBoards;

    // Real-time updates for project page
    useVisibilityPolling({
        enabled: !isLoading && !!projectId,
        interval: 40000, // Poll every 40 seconds
        queryKeys: [
            ['project', projectId],
            ['boards', projectId],
            ['archivedBoards', projectId]
        ]
    });

    // Calculate plan limit
    const planLimit = workspace?.plan === "pro" ? 999 : 3;
    const isAtLimit = boards.length >= planLimit && workspace?.plan === "free";

    const handleBoardCreated = () => {
        setIsCreateModalOpen(false);
        showToast.success("Board created successfully!");
    };

    const handleEditBoard = (board: Board) => {
        setSelectedBoard(board);
        setIsEditModalOpen(true);
    };

    const handleArchiveBoard = (board: Board) => {
        if (confirm(`Archive "${board.name}"? You can restore it later.`)) {
            archiveBoardMutation.mutate(
                { id: board.id, projectId },
                {
                    onSuccess: () => {
                        showToast.success(`Board "${board.name}" archived`);
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Failed to archive board";
                        showToast.error(errorMessage);
                    }
                }
            );
        }
    };

    const handleRestoreBoard = (board: Board) => {
        restoreBoardMutation.mutate(
            { id: board.id, projectId },
            {
                onSuccess: () => {
                    showToast.success(`Board "${board.name}" restored`);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to restore board";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    const handleDeleteBoard = (board: Board) => {
        if (confirm(`Permanently delete "${board.name}"? This will delete all lists and tasks. This action cannot be undone.`)) {
            deleteBoardMutation.mutate(
                { id: board.id, projectId },
                {
                    onSuccess: () => {
                        showToast.success(`Board "${board.name}" deleted`);
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Failed to delete board";
                        showToast.error(errorMessage);
                    }
                }
            );
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = boards.findIndex((item) => item.id.toString() === active.id);
            const newIndex = boards.findIndex((item) => item.id.toString() === over.id);
            
            const newOrder = arrayMove(boards, oldIndex, newIndex);
            const boardIds = newOrder.map(b => b.id);

            // Optimistic update would go here
            reorderBoardsMutation.mutate(
                { projectId, boardIds },
                {
                    onSuccess: () => {
                        showToast.success("Boards reordered");
                    },
                    onError: (error: any) => {
                        const errorMessage = error?.response?.data?.message || "Failed to reorder boards";
                        showToast.error(errorMessage);
                    }
                }
            );
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="mb-4">
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                        </div>
                        <div className="mb-6">
                            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3" />
                                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Error state
    if (projectError || !project) {
        return (
            <DashboardLayout>
                <div className="p-8">
                    <ErrorState 
                        type="404"
                        title="Project not found"
                        message="The project you're looking for doesn't exist or has been removed."
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F9FAFB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <Breadcrumbs
                        items={[
                            { label: workspace?.name || "Workspace", href: "/dashboard" },
                            { label: project?.name || "Project" }
                        ]}
                    />
                    
                    <ProjectHeader
                        project={project}
                        boardsCount={boards.length}
                        archivedCount={archivedBoards.length}
                        showArchived={showArchived}
                        isAtLimit={isAtLimit}
                        onCreateBoard={() => setIsCreateModalOpen(true)}
                        onToggleArchived={() => setShowArchived(!showArchived)}
                    />

                    {isAtLimit && (
                        <PlanLimitWarning
                            onUpgrade={() => router.push("/settings/billing")}
                        />
                    )}

                    {showArchived && (
                        <ArchivedBoardsSection
                            archivedBoards={archivedBoards}
                            onRestore={handleRestoreBoard}
                            onDelete={handleDeleteBoard}
                        />
                    )}

                    {boards.length === 0 ? (
                        <EmptyBoardsState onCreateBoard={() => setIsCreateModalOpen(true)} />
                    ) : (
                        <BoardsGrid
                            boards={boards}
                            workspaceId={workspaceId}
                            projectId={projectId}
                            onEdit={handleEditBoard}
                            onArchive={handleArchiveBoard}
                            onDelete={handleDeleteBoard}
                            onDragEnd={handleDragEnd}
                        />
                    )}
                </div>
            </div>

            <CreateBoardModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleBoardCreated}
                projectId={projectId}
                workspaceId={workspaceId}
                projectName={project?.name}
                existingBoards={boards}
            />

            {selectedBoard && (
                <EditBoardModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedBoard(null);
                    }}
                    onSuccess={() => {
                        setIsEditModalOpen(false);
                        setSelectedBoard(null);
                        showToast.success("Board updated successfully!");
                    }}
                    board={selectedBoard}
                />
            )}
        </DashboardLayout>
    );
}
