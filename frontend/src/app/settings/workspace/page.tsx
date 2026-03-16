"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/api";
import { createWorkspaceSchema, validateData } from "@/lib/validation.schemas";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingState from "@/components/ui/LoadingState";
import WorkspaceInfoCard from "@/components/settings/workspace/WorkspaceInfoCard";
import ExportDataCard from "@/components/settings/workspace/ExportDataCard";
import DeleteWorkspaceCard from "@/components/settings/workspace/DeleteWorkspaceCard";

export default function WorkspaceSettingsPage() {
    return <WorkspaceSettingsContent />;
}

function WorkspaceSettingsContent() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();
    // Only fetch if we don't have workspace data in store
    const { data: workspace, isLoading } = useWorkspace(activeWorkspace?.id || null);
    
    // Check if current user is the workspace owner
    const isOwner = activeWorkspace && user && 
        (String(activeWorkspace.ownerId) === String(user.id) || 
         String(activeWorkspace.createdBy) === String(user.id));
    
    const [formData, setFormData] = useState({
        name: activeWorkspace?.name || "",
        description: ""
    });
    const [workspaceIcon, setWorkspaceIcon] = useState<string | null>(activeWorkspace?.icon || null);
    const [nameError, setNameError] = useState("");
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    const updateWorkspaceMutation = useUpdateWorkspace();
    const deleteWorkspaceMutation = useDeleteWorkspace();

    // Update form data when workspace loads
    React.useEffect(() => {
        if (workspace) {
            setFormData({
                name: workspace.name || "",
                description: workspace.description || ""
            });
            setWorkspaceIcon(workspace.logo || null);
        } else if (activeWorkspace) {
            // Use data from store if API hasn't loaded yet
            setFormData(prev => ({
                ...prev,
                name: activeWorkspace.name || prev.name
            }));
            setWorkspaceIcon(activeWorkspace.icon || workspaceIcon);
        }
    }, [workspace, activeWorkspace]);

    const updateName = (name: string) => {
        setFormData(prev => ({ ...prev, name }));
        if (name.length < 2) {
            setNameError("Workspace name must be at least 2 characters");
        } else {
            setNameError("");
        }
    };

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const uploadIcon = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => setWorkspaceIcon(reader.result as string);
        reader.readAsDataURL(file);
    };

    const removeIcon = () => {
        setWorkspaceIcon(null);
    };

    const saveWorkspace = async () => {
        if (!activeWorkspace?.id) return;

        const validation = validateData(createWorkspaceSchema, {
            name: formData.name,
            description: formData.description,
            logo: workspaceIcon || undefined
        });

        if (!validation.success) {
            const firstError = Object.values(validation.errors || {})[0];
            showToast.error(firstError);
            return;
        }

        updateWorkspaceMutation.mutate(
            { id: activeWorkspace.id, data: validation.data },
            {
                onSuccess: () => {
                    showToast.success("Workspace updated successfully!");
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to update workspace";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    const exportDataAsPDF = async () => {
        if (!activeWorkspace?.id) {
            showToast.error("No active workspace selected");
            return;
        }

        setIsExportingPDF(true);
        
        try {
            // Dynamically import jsPDF and autoTable
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            // Fetch all workspace data
            const token = localStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
            
            const [projectsRes, analyticsRes, boardsRes, tasksRes] = await Promise.all([
                fetch(`${apiUrl}/projects?workspaceId=${activeWorkspace.id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
                fetch(`${apiUrl}/analytics/workspace/${activeWorkspace.id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
                fetch(`${apiUrl}/boards?workspaceId=${activeWorkspace.id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
                fetch(`${apiUrl}/tasks?workspaceId=${activeWorkspace.id}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                }),
            ]);

            const projects = await projectsRes.json();
            const analytics = await analyticsRes.json();
            const boards = await boardsRes.json();
            const tasks = await tasksRes.json();

            const projectsData = projects.data || [];
            const analyticsData = analytics.data || {};
            const boardsData = boards.data || [];
            const tasksData = tasks.data || [];

            // Create PDF
            const doc = new jsPDF() as any;
            let yPosition = 20;

            // Title
            doc.setFontSize(22);
            doc.setTextColor(0, 0, 0);
            doc.text(`${activeWorkspace.name}`, 105, yPosition, { align: 'center' });
            yPosition += 8;
            doc.setFontSize(16);
            doc.setTextColor(100, 100, 100);
            doc.text('Workspace Report', 105, yPosition, { align: 'center' });
            yPosition += 10;
            doc.setFontSize(10);
            doc.text(`Generated on ${new Date().toLocaleString()}`, 105, yPosition, { align: 'center' });
            yPosition += 15;

            // Workspace Information Section
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text('Workspace Information', 20, yPosition);
            yPosition += 8;

            const workspaceInfo = [
                ['Property', 'Value'],
                ['Name', activeWorkspace.name],
                ['Description', workspace?.description || 'No description'],
                ['Plan', (activeWorkspace.subscription || 'Free').toUpperCase()],
                ['Created', new Date(activeWorkspace.createdAt).toLocaleString()],
                ['Total Members', String(activeWorkspace.memberCount || 1)],
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [workspaceInfo[0]],
                body: workspaceInfo.slice(1),
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 10 },
                columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // Analytics Summary Section
            doc.setFontSize(16);
            doc.text('Analytics Summary', 20, yPosition);
            yPosition += 8;

            const analyticsTable = [
                ['Metric', 'Count', 'Details'],
                ['Total Projects', String(analyticsData.projects?.total || projectsData.length), `${analyticsData.projects?.active || 0} active`],
                ['Total Boards', String(analyticsData.boards?.total || boardsData.length), `${boardsData.filter((b: any) => !b.isArchived).length} active`],
                ['Total Tasks', String(analyticsData.tasks?.total || tasksData.length), `${analyticsData.tasks?.completed || 0} completed`],
                ['Tasks In Progress', String(analyticsData.tasks?.inProgress || 0), `${((analyticsData.tasks?.inProgress || 0) / (analyticsData.tasks?.total || 1) * 100).toFixed(1)}% of total`],
                ['Tasks Todo', String(analyticsData.tasks?.todo || 0), `${((analyticsData.tasks?.todo || 0) / (analyticsData.tasks?.total || 1) * 100).toFixed(1)}% of total`],
                ['Overdue Tasks', String(analyticsData.tasks?.overdue || 0), 'Requires attention'],
                ['Completion Rate', `${analyticsData.tasks?.completionRate || 0}%`, analyticsData.tasks?.completionRate >= 70 ? 'Good' : 'Needs improvement'],
            ];

            autoTable(doc, {
                startY: yPosition,
                head: [analyticsTable[0]],
                body: analyticsTable.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                bodyStyles: { fontSize: 9 },
                columnStyles: { 
                    0: { cellWidth: 50, fontStyle: 'bold' },
                    1: { cellWidth: 30, halign: 'center' },
                    2: { cellWidth: 'auto' }
                },
            });

            yPosition = doc.lastAutoTable.finalY + 15;

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Projects Section
            if (projectsData.length > 0) {
                doc.setFontSize(16);
                doc.text('Projects', 20, yPosition);
                yPosition += 8;

                const projectsTable = [
                    ['Project Name', 'Status', 'Boards', 'Created Date'],
                    ...projectsData.map((p: any) => [
                        p.name || 'Unnamed',
                        p.isArchived ? 'Archived' : 'Active',
                        String(boardsData.filter((b: any) => b.projectId === p.id).length),
                        p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A',
                    ]),
                ];

                autoTable(doc, {
                    startY: yPosition,
                    head: [projectsTable[0]],
                    body: projectsTable.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    columnStyles: { 
                        0: { cellWidth: 70 },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 25, halign: 'center' },
                        3: { cellWidth: 'auto' }
                    },
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Boards Section
            if (boardsData.length > 0) {
                doc.setFontSize(16);
                doc.text('Boards', 20, yPosition);
                yPosition += 8;

                const boardsTable = [
                    ['Board Name', 'Project', 'Status', 'Tasks', 'Created'],
                    ...boardsData.slice(0, 20).map((b: any) => {
                        const project = projectsData.find((p: any) => p.id === b.projectId);
                        const boardTasks = tasksData.filter((t: any) => t.boardId === b.id);
                        return [
                            b.name || 'Unnamed',
                            project?.name || 'Unknown',
                            b.isArchived ? 'Archived' : 'Active',
                            String(boardTasks.length),
                            b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'N/A',
                        ];
                    }),
                ];

                if (boardsData.length > 20) {
                    boardsTable.push(['...', `${boardsData.length - 20} more boards`, '', '', '']);
                }

                autoTable(doc, {
                    startY: yPosition,
                    head: [boardsTable[0]],
                    body: boardsTable.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    columnStyles: { 
                        0: { cellWidth: 50 },
                        1: { cellWidth: 45 },
                        2: { cellWidth: 25, halign: 'center' },
                        3: { cellWidth: 20, halign: 'center' },
                        4: { cellWidth: 'auto' }
                    },
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Tasks by Priority Section
            if (analyticsData.tasks?.byPriority && analyticsData.tasks.byPriority.length > 0) {
                doc.setFontSize(16);
                doc.text('Tasks by Priority', 20, yPosition);
                yPosition += 8;

                const priorityTable = [
                    ['Priority', 'Count', 'Percentage'],
                    ...analyticsData.tasks.byPriority.map((p: any) => [
                        p.priority || 'None',
                        String(p.count),
                        `${((Number(p.count) / (analyticsData.tasks?.total || 1)) * 100).toFixed(1)}%`,
                    ]),
                ];

                autoTable(doc, {
                    startY: yPosition,
                    head: [priorityTable[0]],
                    body: priorityTable.slice(1),
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    columnStyles: { 
                        0: { cellWidth: 60, fontStyle: 'bold' },
                        1: { cellWidth: 40, halign: 'center' },
                        2: { cellWidth: 'auto', halign: 'center' }
                    },
                });

                yPosition = doc.lastAutoTable.finalY + 15;
            }

            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            // Recent Tasks Section (top 15)
            if (tasksData.length > 0) {
                doc.setFontSize(16);
                doc.text('Recent Tasks', 20, yPosition);
                yPosition += 8;

                const recentTasks = tasksData
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 15);

                const tasksTable = [
                    ['Task Title', 'Status', 'Priority', 'Created'],
                    ...recentTasks.map((t: any) => [
                        (t.title || 'Untitled').substring(0, 40) + ((t.title?.length || 0) > 40 ? '...' : ''),
                        t.status || 'todo',
                        t.priority || 'medium',
                        t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A',
                    ]),
                ];

                if (tasksData.length > 15) {
                    tasksTable.push(['...', `${tasksData.length - 15} more tasks`, '', '']);
                }

                autoTable(doc, {
                    startY: yPosition,
                    head: [tasksTable[0]],
                    body: tasksTable.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                    bodyStyles: { fontSize: 9 },
                    columnStyles: { 
                        0: { cellWidth: 80 },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 'auto' }
                    },
                });
            }

            // Footer on last page
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
                doc.text(`${activeWorkspace.name} - Workspace Report`, 20, 285);
            }

            // Save PDF
            const fileName = `${activeWorkspace.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            showToast.success("PDF exported successfully!");
        } catch (error: any) {
            console.error('PDF export error:', error);
            console.error('Error stack:', error?.stack);
            console.error('Error message:', error?.message);
            showToast.error(`Failed to export PDF: ${error?.message || 'Unknown error'}`);
        } finally {
            setIsExportingPDF(false);
        }
    };

    const deleteCurrentWorkspace = () => {
        if (!activeWorkspace?.id) return;

        const workspaceIdToDelete = activeWorkspace.id;

        deleteWorkspaceMutation.mutate(
            workspaceIdToDelete,
            {
                onSuccess: () => {
                    // Clear localStorage immediately
                    if (typeof window !== 'undefined') {
                        const activeWorkspaceId = localStorage.getItem('activeWorkspaceId');
                        if (activeWorkspaceId === String(workspaceIdToDelete)) {
                            localStorage.removeItem('activeWorkspaceId');
                        }
                        
                        // Clear any other workspace-related data from localStorage
                        localStorage.removeItem(`workspace_${workspaceIdToDelete}`);
                    }
                    
                    // Get current workspaces from store
                    const { workspaces, setWorkspaces, setActiveWorkspace } = useWorkspaceStore.getState();
                    
                    // Remove deleted workspace from store
                    const updatedWorkspaces = workspaces.filter(w => w.id !== workspaceIdToDelete);
                    
                    // Update store immediately
                    setWorkspaces(updatedWorkspaces);
                    
                    // Set new active workspace or null
                    if (updatedWorkspaces.length > 0) {
                        setActiveWorkspace(updatedWorkspaces[0]);
                    } else {
                        setActiveWorkspace(null);
                    }
                    
                    // Invalidate all workspace-related queries to force refetch
                    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
                    queryClient.invalidateQueries({ queryKey: ['projects'] });
                    queryClient.invalidateQueries({ queryKey: ['boards'] });
                    queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    queryClient.invalidateQueries({ queryKey: ['workspaceAnalytics'] });
                    
                    // Remove the deleted workspace from React Query cache
                    queryClient.removeQueries({ queryKey: ['workspaces', 'detail', workspaceIdToDelete] });
                    
                    showToast.success("Workspace deleted successfully");
                    
                    // Small delay to ensure state updates propagate
                    setTimeout(() => {
                        // Redirect to dashboard
                        router.push("/dashboard");
                    }, 100);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to delete workspace";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <main className="max-w-4xl mx-auto px-4 py-3">
                    <LoadingState message="Loading workspace settings..." />
                </main>
            </DashboardLayout>
        );
    }

    // Show no workspace state
    if (!activeWorkspace?.id) {
        return (
            <DashboardLayout>
                <main className="max-w-4xl mx-auto px-4 py-3">
                    <div className="mb-6 pb-4 border-b border-purple-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-gray-900">Workspace Settings</h1>
                                <p className="text-gray-500 text-[10px]">Workspace • Global settings and configuration</p>
                            </div>
                        </div>
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

    return (
        <DashboardLayout>
            <main className="max-w-4xl mx-auto px-4 py-3">
                <div className="mb-6 pb-4 border-b border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-gray-900">Workspace Settings</h1>
                            <p className="text-gray-500 text-[10px]">Workspace • {activeWorkspace.name}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {!isOwner && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800 font-medium">
                                You are a member of this workspace. Only the workspace owner can modify settings or delete the workspace.
                            </p>
                        </div>
                    )}
                    
                    <WorkspaceInfoCard
                        workspace={workspace}
                        formData={formData}
                        workspaceIcon={workspaceIcon}
                        nameError={nameError}
                        isSaving={updateWorkspaceMutation.isPending}
                        onNameChange={updateName}
                        onFormChange={updateFormData}
                        onIconUpload={uploadIcon}
                        onIconRemove={removeIcon}
                        onSave={saveWorkspace}
                        isOwner={isOwner}
                    />

                    <ExportDataCard
                        isExportingPDF={isExportingPDF}
                        onExportPDF={exportDataAsPDF}
                    />

                    {isOwner && (
                        <DeleteWorkspaceCard
                            isDeleting={deleteWorkspaceMutation.isPending}
                            workspaceName={activeWorkspace?.name || ""}
                            onDelete={deleteCurrentWorkspace}
                        />
                    )}
                </div>
            </main>
        </DashboardLayout>
    );
}
