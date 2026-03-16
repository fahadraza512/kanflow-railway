"use client";

import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";
import DashboardHeader from "./DashboardHeader";
import { useLayoutStore } from "@/store/useLayoutStore";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { HydrationProvider } from "@/providers/HydrationProvider";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
    const { isSidebarOpen, toggleSidebar, isHydrated } = useLayoutStore();
    const pathname = usePathname();

    // Close sidebar on mobile when route changes (navigation only)
    // useRef tracks the previous path so we skip the initial mount
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        if (!isHydrated) return;
        // Skip on initial mount — only close when path actually changes
        if (prevPathRef.current === pathname) return;
        prevPathRef.current = pathname;

        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            useLayoutStore.getState().setSidebarOpen(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, isHydrated]);

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            {/* Fixed Header - Reserve space to prevent layout shift */}
            <div className="h-14 safe-top" />
            <DashboardHeader 
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={toggleSidebar}
            />

            {/* Sidebar - Toggleable on all screen sizes */}
            <div
                className={cn(
                    "fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 z-40",
                    // Disable transition until hydrated to prevent flash
                    isHydrated && "transition-all duration-300 ease-in-out",
                    // Mobile: slide in as 72-wide drawer, hidden when closed
                    "w-72",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                    // Tablet: icon-only sidebar always visible
                    "md:w-16 md:translate-x-0",
                    // Desktop: full sidebar when open, hidden when closed
                    isSidebarOpen ? "lg:w-64 lg:translate-x-0" : "lg:w-0 lg:-translate-x-full lg:overflow-hidden"
                )}
                style={{ willChange: 'transform, width' }}
            >
                <WorkspaceSidebar />
            </div>

            {/* Mobile Overlay - Only on phones, not tablets */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onPointerDown={(e) => {
                        e.preventDefault();
                        toggleSidebar();
                    }}
                    style={{ top: '3.5rem' }}
                />
            )}

            {/* Main Content - Dynamic margin based on sidebar state and screen size */}
            <main
                className={cn(
                    "pt-0 pb-20 lg:pb-4 min-h-screen px-0",
                    // Disable transition until hydrated to prevent flash
                    isHydrated && "transition-all duration-300",
                    // Mobile: no margin when sidebar closed
                    isSidebarOpen ? "" : "",
                    // Tablet: margin for icon-only sidebar
                    "md:ml-16",
                    // Desktop: margin for full sidebar when open, no margin when closed
                    isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
                )}
                style={{ 
                    minHeight: 'calc(100vh - 3.5rem)',
                    willChange: 'auto' 
                }}
            >
                {children}
            </main>

            {/* Mobile Bottom Padding Spacer */}
            <div className="h-20 lg:hidden safe-bottom" />
        </div>
    );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <HydrationProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </HydrationProvider>
    );
}
