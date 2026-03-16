import { useState, useEffect, useCallback } from "react";
import { checkDueDateReminders } from "@/lib/notifications";

const SIDEBAR_STORAGE_KEY = 'dashboard-sidebar-open';

// Read initial state synchronously to prevent flash
function getInitialSidebarState(): boolean {
    if (typeof window === 'undefined') {
        return true; // SSR default: assume open for desktop
    }
    
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
        return stored === 'true';
    }
    
    // Default: open on desktop, closed on mobile
    return window.innerWidth >= 1024;
}

export function useDashboardLayout() {
    // Read from localStorage immediately to prevent flash
    const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Mark as hydrated
        setIsHydrated(true);

        // Save initial state if not already stored
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
            if (stored === null) {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen));
            }
        }

        // Handle resize - only auto-close on mobile, don't auto-open
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                const isDesktop = window.innerWidth >= 1024;
                // Only auto-close on mobile, preserve user preference on desktop
                if (!isDesktop && isSidebarOpen) {
                    setIsSidebarOpen(false);
                    localStorage.setItem(SIDEBAR_STORAGE_KEY, 'false');
                }
            }
        };

        window.addEventListener('resize', handleResize);

        // Notification check
        checkDueDateReminders();
        const interval = setInterval(() => {
            checkDueDateReminders();
        }, 60 * 60 * 1000);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => {
            const newValue = !prev;
            if (typeof window !== 'undefined') {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue));
            }
            return newValue;
        });
    }, []);

    return {
        isSidebarOpen,
        toggleSidebar,
        isHydrated
    };
}
