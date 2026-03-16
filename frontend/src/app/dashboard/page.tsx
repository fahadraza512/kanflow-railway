"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useProjects, useArchivedProjects, useArchiveProject, useRestoreProject, useDeleteProject } from "@/hooks/api";
import { useWorkspaceAnalytics } from "@/hooks/api/useAnalyticsApi";
import { useVisibilityPolling } from "@/hooks/useRealtimeUpdates";
import { usePermissions } from "@/hooks/usePermissions";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import OverdueAlert from "@/components/dashboard/OverdueAlert";
import EmptyState from "@/components/dashboard/EmptyState";
import NoActiveProjects from "@/components/dashboard/NoActiveProjects";
import ProjectGrid from "@/components/dashboard/ProjectGrid";
import ArchivedProjects from "@/components/dashboard/ArchivedProjects";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import EditProjectModal from "@/components/project/EditProjectModal";
import AssignMembersModal from "@/components/project/AssignMembersModal";
import PaymentFailureModal from "@/components/payment/PaymentFailureModal";
import UpgradeModal from "@/components/workspace/UpgradeModal";
import LoadingState from "@/components/ui/LoadingState";
import { Project } from "@/types/api.types";
import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const permissions = usePermissions();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isPaymentFailureModalOpen, setIsPaymentFailureModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>("");
    
    // Load showArchived state from localStorage
    const [showArchived, setShowArchived] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('showArchivedProjects');
            return saved === 'true';
        }
        return false;
    });

    // Mark component as mounted
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Check if user has no workspace - show empty state immediately
    useEffect(() => {
        if (isMounted && !activeWorkspace?.id) {
            console.log('No active workspace found');
        }
    }, [isMounted, activeWorkspace]);
    
    // Handle payment status from URL params (Stripe redirect)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        
        const params = new URLSearchParams(window.location.search);
        const paymentStatus = params.get('payment');
        const errorMsg = params.get('error');
        
        if (paymentStatus === 'success') {
            showToast.success('🎉 Payment successful! You now have Pro features.');
            // Clean URL
            window.history.replaceState({}, '', '/dashboard');
        } else if (paymentStatus === 'cancelled') {
            showToast.info('Payment cancelled. Your workspace remains on the Free plan. You can upgrade anytime from Settings → Billing.');
            window.history.replaceState({}, '', '/dashboard');
        } else if (paymentStatus === 'failed') {
            // Show detailed failure modal
            setPaymentErrorMessage(errorMsg || 'Payment could not be processed. Please try again.');
            setIsPaymentFailureModalOpen(true);
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    // Save showArchived state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('showArchivedProjects', String(showArchived));
        }
    }, [showArchived]);

    // Fetch projects data - queries will automatically refetch when activeWorkspace.id changes
    const { 
        data: projects = [], 
        isLoading: isLoadingProjects,
        isFetching: isFetchingProjects,
        error: projectsError,
        isSuccess: isProjectsSuccess
    } = useProjects(activeWorkspace?.id || null);
    
    const { 
        data: archivedProjects = [],
        isLoading: isLoadingArchived,
        isFetching: isFetchingArchived,
        isSuccess: isArchivedSuccess
    } = useArchivedProjects(activeWorkspace?.id || null);

    // Fetch analytics data for stats (optional - don't block UI)
    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
        isSuccess: isAnalyticsSuccess,
        error: analyticsError
    } = useWorkspaceAnalytics(activeWorkspace?.id || undefined);

    // Mutations
    const archiveProjectMutation = useArchiveProject();
    const restoreProjectMutation = useRestoreProject();
    const deleteProjectMutation = useDeleteProject();

    // Show loading on initial load (not on background refetch)
    // Only wait for projects and archived projects - analytics is optional
    const isInitialLoading = (isLoadingProjects || isLoadingArchived) && 
                             (!isProjectsSuccess || !isArchivedSuccess);

    // Real-time updates for dashboard
    useVisibilityPolling({
        enabled: !isInitialLoading && !!activeWorkspace?.id,
        interval: 45000, // Poll every 45 seconds
        queryKeys: [
            ['projects', activeWorkspace?.id || ''],
            ['archivedProjects', activeWorkspace?.id || ''],
            ['workspaceAnalytics', activeWorkspace?.id || '']
        ]
    });

    // Calculate stats from analytics data
    const stats = useMemo(() => {
        if (!analyticsData) {
            return {
                totalProjects: projects.length,
                totalBoards: 0,
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                overdueTasks: 0
            };
        }

        return {
            totalProjects: analyticsData.projects?.total || projects.length,
            totalBoards: analyticsData.boards?.total || 0,
            totalTasks: analyticsData.tasks?.total || 0,
            completedTasks: analyticsData.tasks?.completed || 0,
            inProgressTasks: analyticsData.tasks?.inProgress || 0,
            overdueTasks: analyticsData.tasks?.overdue || 0
        };
    }, [analyticsData, projects]);

    const handleProjectCreated = () => {
        setIsModalOpen(false);
        showToast.success("Project created successfully!");
    };

    const handleEditProject = (project: Project) => {
        if (!permissions.canEditProject) {
            showToast.error('You do not have permission to edit projects');
            return;
        }
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleAssignMembers = (project: Project) => {
        if (!permissions.canAssignMembers) {
            showToast.error('You do not have permission to assign members');
            return;
        }
        setSelectedProject(project);
        setIsAssignModalOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        setIsAssignModalOpen(false);
        setSelectedProject(null);
        showToast.success("Project updated successfully!");
    };

    const handleArchiveProject = async (projectId: string) => {
        if (!permissions.canArchiveProject) {
            showToast.error('You do not have permission to archive projects');
            return;
        }
        try {
            await archiveProjectMutation.mutateAsync(projectId);
        } catch (error) {
            console.error('Error archiving project:', error);
        }
    };

    const handleRestoreProject = async (projectId: string) => {
        if (!permissions.canArchiveProject) {
            showToast.error('You do not have permission to restore projects');
            return;
        }
        try {
            await restoreProjectMutation.mutateAsync(projectId);
        } catch (error) {
            console.error('Error restoring project:', error);
        }
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (!permissions.canDeleteProject) {
            showToast.error('You do not have permission to delete projects');
            return;
        }
        
        console.log('Delete clicked - projectId:', projectId, 'projectName:', projectName, 'workspaceId:', activeWorkspace?.id);
        
        if (!activeWorkspace?.id) {
            console.error('No active workspace ID');
            return;
        }
        
        const confirmed = window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`);
        console.log('User confirmed:', confirmed);
        
        if (!confirmed) return;

        try {
            console.log('Calling delete mutation with:', { id: projectId, workspaceId: activeWorkspace.id });
            await deleteProjectMutation.mutateAsync({ 
                id: projectId, 
                workspaceId: activeWorkspace.id 
            });
            console.log('Project deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const toggleArchived = () => {
        setShowArchived(!showArchived);
    };

    const userName = user?.name?.split(' ')[0] || 'there';
    const workspaceName = activeWorkspace?.name || "Workspace";

    // Wait for component to mount (prevents hydration mismatch)
    if (!isMounted) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <LoadingState message="Loading your dashboard..." />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // If no active workspace, show empty state immediately (don't wait for API calls)
    if (!activeWorkspace?.id) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <DashboardHeader
                            userName={userName}
                            workspaceName="No Workspace"
                            onCreateProject={() => setIsModalOpen(true)}
                        />
                        <EmptyState onCreateProject={() => setIsModalOpen(true)} />
                    </div>
                </div>
                <CreateProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={handleProjectCreated}
                />
            </DashboardLayout>
        );
    }

    // Show loading state ONLY while fetching data (after workspace is confirmed)
    if (isInitialLoading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <LoadingState message="Loading your dashboard..." />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Only calculate these AFTER loading is complete
    const hasNoProjects = projects.length === 0 && archivedProjects.length === 0;
    const hasOnlyArchivedProjects = projects.length === 0 && archivedProjects.length > 0;

    // Show error state
    if (projectsError) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-[#F9FAFB]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-700 font-medium">
                                Failed to load dashboard data. Please try again.
                            </p>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-[#F9FAFB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <DashboardHeader
                        userName={userName}
                        workspaceName={workspaceName}
                        onCreateProject={() => setIsModalOpen(true)}
                        canCreateProject={permissions.canCreateProject}
                    />

                    {hasNoProjects ? (
                        <EmptyState 
                            onCreateProject={() => setIsModalOpen(true)} 
                            canCreateProject={permissions.canCreateProject}
                        />
                    ) : hasOnlyArchivedProjects ? (
                        <>
                            <NoActiveProjects
                                archivedCount={archivedProjects.length}
                                onCreateProject={() => setIsModalOpen(true)}
                                onShowArchived={toggleArchived}
                            />
                            {showArchived && (
                                <ArchivedProjects
                                    archivedProjects={archivedProjects}
                                    onRestoreProject={handleRestoreProject}
                                    onDeleteProject={handleDeleteProject}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <DashboardStats
                                totalProjects={stats.totalProjects}
                                totalBoards={stats.totalBoards}
                                totalTasks={stats.totalTasks}
                                inProgressTasks={stats.inProgressTasks}
                            />

                            <OverdueAlert overdueCount={stats.overdueTasks} />

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-gray-900 mb-0.5">Your Projects</h2>
                                        <p className="text-xs text-gray-500">
                                            {projects.length} active project{projects.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {archivedProjects.length > 0 && (
                                        <button
                                            onClick={toggleArchived}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <Archive className="w-3.5 h-3.5" />
                                            {showArchived ? "Hide" : "Show"} Archived ({archivedProjects.length})
                                        </button>
                                    )}
                                </div>

                                <ProjectGrid
                                    projects={projects}
                                    onEditProject={handleEditProject}
                                    onAssignMembers={handleAssignMembers}
                                    onArchiveProject={handleArchiveProject}
                                    onDeleteProject={handleDeleteProject}
                                    canManageProjects={permissions.canEditProject}
                                />

                                {showArchived && (
                                    <ArchivedProjects
                                        archivedProjects={archivedProjects}
                                        onRestoreProject={handleRestoreProject}
                                        onDeleteProject={handleDeleteProject}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleProjectCreated}
            />

            {selectedProject && (
                <>
                    <EditProjectModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setSelectedProject(null);
                        }}
                        onSuccess={handleEditSuccess}
                        project={selectedProject}
                    />

                    <AssignMembersModal
                        isOpen={isAssignModalOpen}
                        onClose={() => {
                            setIsAssignModalOpen(false);
                            setSelectedProject(null);
                        }}
                        onSuccess={handleEditSuccess}
                        project={selectedProject}
                    />
                </>
            )}
            
            {/* Payment Failure Modal */}
            <PaymentFailureModal
                isOpen={isPaymentFailureModalOpen}
                onClose={() => setIsPaymentFailureModalOpen(false)}
                onRetry={() => {
                    setIsPaymentFailureModalOpen(false);
                    setIsUpgradeModalOpen(true);
                }}
                errorMessage={paymentErrorMessage}
            />
            
            {/* Upgrade Modal for Retry */}
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSuccess={() => {
                    setIsUpgradeModalOpen(false);
                    router.push('/dashboard?payment=success');
                }}
            />
        </DashboardLayout>
    );
}
