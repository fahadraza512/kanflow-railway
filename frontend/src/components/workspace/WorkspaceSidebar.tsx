"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Home, FolderKanban, BarChart3, Archive } from "lucide-react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaces, useProjects } from "@/hooks/api";
import { useWorkspacePolling } from "@/hooks/useWorkspacePolling";
import { useWorkspaceHeartbeat } from "@/hooks/useWorkspaceHeartbeat";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CreateProjectModal from "@/components/project/CreateProjectModal";
import { WorkspaceSwitcher } from "@/components/workspace/WorkspaceSwitcher";
import { Tooltip } from "@/components/ui/Tooltip";

interface WorkspaceSidebarProps {
    onWorkspaceSelect?: (workspaceId: string | number) => void;
}

function WorkspaceSidebar({ onWorkspaceSelect }: WorkspaceSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    
    const { user } = useAuthStore();
    const { workspaces, activeWorkspace, switchWorkspace, mergeWorkspaces, removeWorkspace, setActiveWorkspace } = useWorkspaceStore();
    const { data: apiWorkspaces, isLoading: isLoadingWorkspaces, refetch: refetchWorkspaces } = useWorkspaces();
    const { data: apiProjects = [] } = useProjects(activeWorkspace?.id || null);
    
    // Enable real-time sync polling for shared workspaces
    useWorkspacePolling(activeWorkspace?.id || null, !!activeWorkspace);
    
    // Send heartbeat to update user's active status
    useWorkspaceHeartbeat(activeWorkspace?.id || null);
    
    // Refetch workspaces when component mounts or when workspaces array changes
    useEffect(() => {
        refetchWorkspaces();
    }, [refetchWorkspaces]);
    
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    // Update store when workspaces are fetched from API
    useEffect(() => {
        if (apiWorkspaces && apiWorkspaces.length > 0) {
            // Transform API workspaces to match store format
            const transformedWorkspaces = apiWorkspaces.map(ws => {
                const subscriptionValue = ws.subscription;
                const planValue = (subscriptionValue || 'free') as 'free' | 'pro';
                
                // CRITICAL: Preserve userRole from backend for badge logic
                // If userRole is missing, determine it from ownerId
                let role = ws.userRole;
                if (!role && user?.id) {
                    // Fallback: If no userRole, check if user is owner
                    role = String(ws.ownerId) === String(user.id) ? 'owner' : undefined;
                }
                
                const transformed = {
                    id: ws.id,
                    name: ws.name,
                    description: ws.description,
                    createdBy: ws.ownerId,
                    ownerId: ws.ownerId,
                    role: role, // Use determined role
                    plan: planValue,
                    subscriptionStatus: ws.stripeSubscriptionId ? 'active' as const : undefined,
                    members: [],
                    icon: ws.logo,
                    createdAt: ws.createdAt
                };
                
                return transformed;
            });
            
            console.log('📥 API RAW workspaces:', apiWorkspaces.map(w => ({ 
                id: w.id, 
                name: w.name, 
                ownerId: w.ownerId,
                userRole: w.userRole,
                rawData: w
            })));
            
            console.log('📥 TRANSFORMED workspaces:', transformedWorkspaces.map(w => ({ 
                id: w.id, 
                name: w.name, 
                ownerId: w.ownerId,
                role: w.role
            })));
            
            // CRITICAL: Always merge with existing workspaces, never replace
            // This ensures invited workspaces are preserved when user creates new workspace
            mergeWorkspaces(transformedWorkspaces);

            // Bug fix: detect workspaces that were removed server-side (deleted or member removed)
            // Any workspace currently in the store that is NOT in the API response should be removed
            const apiIds = new Set(transformedWorkspaces.map(w => String(w.id)));
            workspaces.forEach(storeWs => {
                if (!apiIds.has(String(storeWs.id))) {
                    console.log('🗑️ Workspace no longer accessible, removing from store:', storeWs.name);
                    removeWorkspace(storeWs.id);
                }
            });
            
            // CRITICAL: Never override user's manually selected workspace
            // Only set active workspace on initial load when there's no selection
            if (activeWorkspace) {
                // Check if the active workspace still exists in the API response
                if (!apiIds.has(String(activeWorkspace.id))) {
                    // Active workspace was deleted or user was removed — switch to first available
                    console.log('⚠️ Active workspace no longer accessible, switching to another');
                    const remaining = transformedWorkspaces;
                    setActiveWorkspace(remaining.length > 0 ? remaining[0] : null);
                } else {
                    // Update the active workspace data (e.g. role may have changed)
                    const updated = transformedWorkspaces.find(w => String(w.id) === String(activeWorkspace.id));
                    if (updated) setActiveWorkspace(updated);
                }
                return;
            }
            
            // Only reach here if NO active workspace is set (initial load only)
            console.log('ℹ️ No active workspace set, selecting one for initial load');
            
            // Priority 1: Check localStorage for activeWorkspaceId (from previous session)
            const persistedId = typeof window !== 'undefined' 
                ? localStorage.getItem('activeWorkspaceId') 
                : null;
            
            if (persistedId) {
                const targetWorkspace = transformedWorkspaces.find(
                    ws => String(ws.id) === String(persistedId)
                );
                
                if (targetWorkspace) {
                    console.log('📂 Restoring workspace from localStorage:', targetWorkspace.name);
                    setActiveWorkspace(targetWorkspace);
                    return;
                }
            }
            
            // Priority 2: Use first workspace as fallback
            console.log('🆕 No saved workspace, using first available:', transformedWorkspaces[0].name);
            setActiveWorkspace(transformedWorkspaces[0]);
            
        } else if (apiWorkspaces && apiWorkspaces.length === 0) {
            console.log('⚠️ API returned empty workspace list');
            
            // API confirmed no workspaces — clear the store
            console.log('🔄 No workspaces returned from API, clearing store');
            const { setWorkspaces } = useWorkspaceStore.getState();
            setWorkspaces([]);
            setActiveWorkspace(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiWorkspaces]);

    const handleWorkspaceClick = (workspaceId: string | number) => {
        switchWorkspace(workspaceId);
        if (onWorkspaceSelect) {
            onWorkspaceSelect(workspaceId);
        }
        // Don't redirect - stay on current page to show new workspace's data
        // The page will automatically update when activeWorkspace changes
    };

    const handleProjectCreated = () => {
        setIsProjectModalOpen(false);
    };

    // Memoize the navigation links to prevent re-renders
    const navigationLinks = useMemo(() => (
        <div className="px-4 pt-4 pb-3 space-y-1.5">
            <Tooltip content="Dashboard" side="right">
                <Link
                    href="/dashboard"
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-xs",
                        pathname === "/dashboard"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <span className="inline md:hidden lg:inline">Dashboard</span>
                </Link>
            </Tooltip>
            <Tooltip content="Analytics" side="right">
                <Link
                    href="/analytics"
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-xs",
                        pathname === "/analytics"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <BarChart3 className="w-4 h-4 flex-shrink-0" />
                    <span className="inline md:hidden lg:inline">Analytics</span>
                </Link>
            </Tooltip>
            <Tooltip content="Archived Tasks" side="right">
                <Link
                    href="/archived-tasks"
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-semibold text-xs",
                        pathname === "/archived-tasks"
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <Archive className="w-4 h-4 flex-shrink-0" />
                    <span className="inline md:hidden lg:inline">Archived Tasks</span>
                </Link>
            </Tooltip>
        </div>
    ), [pathname]);

    return (
        <>
            <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                {/* Dashboard Link */}
                {navigationLinks}

                {/* Workspace Switcher Section */}
                <div className="px-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider block md:hidden lg:block truncate">
                            Workspace
                        </h2>
                    </div>
                    {/* Show full switcher on mobile and desktop, hide on tablet icon-only mode */}
                    <div className="block md:hidden lg:block">
                        <WorkspaceSwitcher />
                    </div>
                    {/* On tablet, show just the workspace initial as icon */}
                    <div className="hidden md:flex lg:hidden justify-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                            {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="px-4 py-4 flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider block md:hidden lg:block truncate">
                            Projects
                        </h2>
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="p-1.5 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Create new project"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {apiProjects.map((project) => {
                            const isActive = pathname.includes(`/projects/${project.id}`);
                            return (
                                <Tooltip key={project.id} content={project.name} side="right">
                                    <Link
                                        href={`/workspaces/${activeWorkspace?.id}/projects/${project.id}`}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <div 
                                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                                            style={{ backgroundColor: project.color || '#6B7280' }}
                                        >
                                            {project.name.charAt(0)}
                                        </div>
                                        <span className="truncate flex-1 inline md:hidden lg:inline">{project.name}</span>
                                    </Link>
                                </Tooltip>
                            );
                        })}
                        {apiProjects.length === 0 && (
                            <div className="px-3 py-6 text-center block md:hidden lg:block">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <FolderKanban className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-400 mb-3 font-medium">No projects yet</p>
                                <button
                                    onClick={() => setIsProjectModalOpen(true)}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                >
                                    Create your first project
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSuccess={handleProjectCreated}
            />
        </>
    );
}

// Export without memo to ensure proper re-renders on store changes
export default WorkspaceSidebar;
