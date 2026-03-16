import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  user: { 
    id: string; 
    name: string; 
    email: string; 
    avatar?: string; 
    title?: string; 
    bio?: string;
    onboardingCompleted?: boolean;
    activeWorkspaceId?: string;
    hasPendingInvitation?: boolean;
    pendingInviteToken?: string | null;
  } | null;
  token: string | null;
  role: string | null;
  setAuth: (user: { 
    id: string; 
    name: string; 
    email: string; 
    avatar?: string; 
    title?: string; 
    bio?: string;
    onboardingCompleted?: boolean;
    activeWorkspaceId?: string;
    hasPendingInvitation?: boolean;
    pendingInviteToken?: string | null;
  }, token: string, role: string) => void;
  setUser: (user: { 
    id: string; 
    name: string; 
    email: string; 
    avatar?: string; 
    title?: string; 
    bio?: string;
    onboardingCompleted?: boolean;
    activeWorkspaceId?: string;
    hasPendingInvitation?: boolean;
    pendingInviteToken?: string | null;
  }) => void;
  updateAvatar: (avatar: string | null) => void;
  updateProfile: (data: { name?: string; title?: string; bio?: string; avatar?: string | null }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      setAuth: (user, token, role) => {
        set({ user, token, role });
      },
      setUser: (user) => {
        set({ user });
      },
      updateAvatar: (avatar) => set((state) => ({
        user: state.user ? { ...state.user, avatar: avatar || undefined } : null
      })),
      updateProfile: (data) => set((state) => ({
        user: state.user ? { 
          ...state.user, 
          ...(data.name !== undefined && { name: data.name }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.avatar !== undefined && { avatar: data.avatar || undefined })
        } : null
      })),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
    }
  )
);
