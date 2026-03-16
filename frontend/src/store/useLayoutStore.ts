import { create } from 'zustand';

const SIDEBAR_STORAGE_KEY = 'dashboard-sidebar-open';

// Read initial state synchronously before any render
function getInitialSidebarState(): boolean {
    if (typeof window === 'undefined') {
        return true; // SSR default
    }
    
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored !== null) {
        return stored === 'true';
    }
    
    // Default to open regardless of screen size
    // User can manually close it if they want
    return true;
}

interface LayoutState {
    isSidebarOpen: boolean;
    isHydrated: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setHydrated: (hydrated: boolean) => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
    isSidebarOpen: getInitialSidebarState(),
    isHydrated: false,
    
    toggleSidebar: () => set((state) => {
        const newValue = !state.isSidebarOpen;
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newValue));
        }
        return { isSidebarOpen: newValue };
    }),
    
    setSidebarOpen: (open: boolean) => set(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
        }
        return { isSidebarOpen: open };
    }),
    
    setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
}));
