import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Workspace {
    id: string | number;
    name: string;
    description?: string;
    createdBy: string | number;
    ownerId?: string | number; // Added to match backend API response
    role?: string; // User's role in this workspace: 'owner', 'admin', 'pm', 'member', 'viewer'
    plan?: "free" | "pro";
    subscriptionStatus?: "active" | "cancelled" | "expired";
    subscriptionCancelledAt?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
    billingCycle?: "annual" | "monthly";
    members?: (string | number)[];
    icon?: string;
    createdAt: string;
}

interface WorkspaceState {
    workspaces: Workspace[];
    activeWorkspace: Workspace | null;
    isHydrated: boolean;
    
    setWorkspaces: (workspaces: Workspace[]) => void;
    addWorkspace: (workspace: Workspace) => void;
    mergeWorkspaces: (workspaces: Workspace[]) => void;
    removeWorkspace: (workspaceId: string | number) => void;
    setActiveWorkspace: (workspace: Workspace | null) => void;
    switchWorkspace: (workspaceId: string | number) => void;
    setHydrated: (hydrated: boolean) => void;
}

/**
 * Workspace Store with Persistence
 * 
 * This store persists workspaces and active workspace to localStorage.
 * Data flow:
 * 1. useWorkspaces hook fetches data from API
 * 2. Components call setWorkspaces() to update this store
 * 3. Components call setActiveWorkspace() to set active workspace
 * 4. Store persists to localStorage automatically
 * 5. On page reload, store rehydrates from localStorage
 */
export const useWorkspaceStore = create<WorkspaceState>()(
    persist(
        (set, get) => ({
            workspaces: [],
            activeWorkspace: null,
            isHydrated: false,
            
            setWorkspaces: (workspaces) => set({ workspaces }),
            
            /**
             * Remove a single workspace by ID
             * Used when a workspace is deleted or user is removed from it
             */
            removeWorkspace: (workspaceId) => {
                const { workspaces, activeWorkspace } = get();
                const updated = workspaces.filter(w => String(w.id) !== String(workspaceId));
                const newState: Partial<WorkspaceState> = { workspaces: updated };
                // If the removed workspace was active, switch to another or null
                if (activeWorkspace && String(activeWorkspace.id) === String(workspaceId)) {
                    newState.activeWorkspace = updated.length > 0 ? updated[0] : null;
                    if (typeof window !== 'undefined') {
                        if (newState.activeWorkspace) {
                            localStorage.setItem('activeWorkspaceId', String(newState.activeWorkspace.id));
                        } else {
                            localStorage.removeItem('activeWorkspaceId');
                        }
                    }
                }
                set(newState);
            },
            
            /**
             * Add a single workspace to the list without replacing existing ones
             * Used when creating a new workspace
             */
            addWorkspace: (workspace) => {
                const { workspaces } = get();
                // Check if workspace already exists
                const exists = workspaces.some(w => String(w.id) === String(workspace.id));
                if (!exists) {
                    set({ workspaces: [...workspaces, workspace] });
                }
            },
            
            /**
             * Merge new workspaces with existing ones, avoiding duplicates
             * Used when refetching all workspaces to preserve invited workspaces
             */
            mergeWorkspaces: (newWorkspaces) => {
                const { workspaces: existingWorkspaces, activeWorkspace } = get();
                const workspaceMap = new Map<string, Workspace>();
                
                // Add existing workspaces first
                existingWorkspaces.forEach(ws => {
                    workspaceMap.set(String(ws.id), ws);
                });
                
                // Merge with new workspaces (new ones override existing)
                newWorkspaces.forEach(ws => {
                    workspaceMap.set(String(ws.id), ws);
                });
                
                const mergedWorkspaces = Array.from(workspaceMap.values());
                set({ workspaces: mergedWorkspaces });
                
                // CRITICAL: Update activeWorkspace reference if it exists in the merged list
                // This prevents the activeWorkspace from becoming stale after merge
                if (activeWorkspace) {
                    const updatedActiveWorkspace = mergedWorkspaces.find(
                        ws => String(ws.id) === String(activeWorkspace.id)
                    );
                    if (updatedActiveWorkspace) {
                        set({ activeWorkspace: updatedActiveWorkspace });
                    }
                }
            },
            
            setActiveWorkspace: (workspace) => {
                set({ activeWorkspace: workspace });
                
                // Also persist active workspace ID to separate localStorage key for quick access
                if (typeof window !== 'undefined') {
                    if (workspace) {
                        localStorage.setItem('activeWorkspaceId', String(workspace.id));
                    } else {
                        localStorage.removeItem('activeWorkspaceId');
                    }
                }
            },
            
            switchWorkspace: (workspaceId) => {
                const { workspaces } = get();
                const workspace = workspaces.find(w => String(w.id) === String(workspaceId));
                
                if (workspace) {
                    console.log('🔄 Switching workspace to:', workspace.name, 'ID:', workspaceId);
                    set({ activeWorkspace: workspace });
                    
                    // Persist to localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('activeWorkspaceId', String(workspaceId));
                        console.log('💾 Saved to localStorage:', workspaceId);
                    }
                } else {
                    console.error('❌ Workspace not found for ID:', workspaceId);
                }
            },
            
            setHydrated: (hydrated) => set({ isHydrated: hydrated }),
        }),
        {
            name: 'workspace-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: false,
            partialize: (state) => ({
                workspaces: state.workspaces,
                activeWorkspace: state.activeWorkspace,
            }),
        }
    )
);

/**
 * Get the persisted active workspace ID from localStorage
 * This is used to restore the active workspace on page load
 */
export function getPersistedActiveWorkspaceId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('activeWorkspaceId');
}
