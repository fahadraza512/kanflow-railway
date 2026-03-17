"use client";

import { Menu, X, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";
import ProfileDropdown from "./ProfileDropdown";
import { useState, memo } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/layout/navbar/Logo";

interface DashboardHeaderProps {
    isSidebarOpen: boolean;
    onToggleSidebar: () => void;
}

function DashboardHeader({ isSidebarOpen, onToggleSidebar }: DashboardHeaderProps) {
    const router = useRouter();
    const { workspaces, activeWorkspace, switchWorkspace, isHydrated } = useWorkspaceStore();
    const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

    const handleWorkspaceSelect = (workspaceId: string | number) => {
        switchWorkspace(workspaceId);
        setIsWorkspaceDropdownOpen(false);
        router.push("/dashboard");
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
            <div className="h-full px-3 md:px-4 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3 min-w-[200px]">
                    {/* Toggle button - Visible on all screen sizes */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleSidebar();
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Toggle sidebar"
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    {/* App Logo/Brand */}
                    <AppLogo href="/dashboard" size="sm" />

                    {!isHydrated ? (
                        <Skeleton width={150} height={32} />
                    ) : activeWorkspace ? (
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen);
                                }}
                                className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                            >
                                {activeWorkspace.icon ? (
                                    <img 
                                        src={activeWorkspace.icon} 
                                        alt={activeWorkspace.name}
                                        className="w-5 h-5 rounded object-cover"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600">
                                        {activeWorkspace.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-xs font-bold text-gray-900 truncate max-w-[120px]">
                                    {activeWorkspace.name}
                                </span>
                                <ChevronDown className={cn(
                                    "w-3 h-3 text-gray-400 transition-transform",
                                    isWorkspaceDropdownOpen && "rotate-180"
                                )} />
                            </button>

                            {isWorkspaceDropdownOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsWorkspaceDropdownOpen(false);
                                        }} 
                                    />
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
                                        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Switch Workspace
                                        </div>
                                        {workspaces.map((workspace) => (
                                            <button
                                                key={workspace.id}
                                                onClick={() => handleWorkspaceSelect(workspace.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors",
                                                    activeWorkspace.id === workspace.id && "bg-blue-50"
                                                )}
                                            >
                                                {workspace.icon ? (
                                                    <img 
                                                        src={workspace.icon} 
                                                        alt={workspace.name}
                                                        className="w-7 h-7 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-semibold text-[10px]">
                                                        {workspace.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 text-left">
                                                    <div className="text-xs font-semibold text-gray-900 truncate">
                                                        {workspace.name}
                                                    </div>
                                                    {workspace.plan === "pro" && workspace.subscriptionStatus === "active" && (
                                                        <div className="text-[9px] text-blue-600 font-bold uppercase">
                                                            Pro Plan
                                                        </div>
                                                    )}
                                                </div>
                                                {activeWorkspace.id === workspace.id && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    {!isHydrated ? (
                        <>
                            <Skeleton variant="circular" width={32} height={32} />
                            <Skeleton variant="circular" width={32} height={32} />
                        </>
                    ) : (
                        <>
                            <NotificationBell />
                            <ProfileDropdown />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default memo(DashboardHeader);
