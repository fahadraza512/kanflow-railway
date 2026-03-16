"use client";

import { useEffect, useCallback } from 'react';
import { useLayoutStore } from '@/store/useLayoutStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

// Custom event for localStorage changes
const STORAGE_EVENT = 'local-storage-change';

export function HydrationProvider({ children }: { children: React.ReactNode }) {
    const setLayoutHydrated = useLayoutStore((state) => state.setHydrated);
    const setWorkspaceHydrated = useWorkspaceStore((state) => state.setHydrated);

    const handleStorageChange = useCallback((e: Event) => {
        const customEvent = e as CustomEvent;
        const key = customEvent.detail?.key;
        
        // Workspace data is now managed by React Query
        // No need to manually refresh on storage changes
    }, []);

    useEffect(() => {
        // Mark as hydrated
        setLayoutHydrated(true);
        setWorkspaceHydrated(true);
        
        // Workspace data is now fetched by React Query hooks in components
        // No need to manually refresh here
        
        // Handle resize for sidebar
        const handleResize = () => {
            const isDesktop = window.innerWidth >= 1024;
            const isSidebarOpen = useLayoutStore.getState().isSidebarOpen;
            
            // Only auto-close on mobile
            if (!isDesktop && isSidebarOpen) {
                useLayoutStore.getState().setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        
        // Listen for storage events
        window.addEventListener(STORAGE_EVENT, handleStorageChange);
        
        // Listen for storage events from other tabs
        const handleCrossTabStorage = (e: StorageEvent) => {
            // Handle cross-tab storage changes
        };
        
        window.addEventListener('storage', handleCrossTabStorage);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener(STORAGE_EVENT, handleStorageChange);
            window.removeEventListener('storage', handleCrossTabStorage);
        };
    }, [setLayoutHydrated, setWorkspaceHydrated, handleStorageChange]);

    return <>{children}</>;
}
