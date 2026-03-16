import { useMemo } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getPermissions, type PermissionCheck } from '@/lib/permissions';

/**
 * Hook to get current user's permissions in the active workspace
 */
export function usePermissions(): PermissionCheck {
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();

  return useMemo(() => {
    if (!activeWorkspace || !user) {
      // No permissions if no workspace or user
      return getPermissions(undefined, false);
    }

    const isOwner = String(activeWorkspace.ownerId) === String(user.id);
    const role = activeWorkspace.role;

    return getPermissions(role, isOwner);
  }, [activeWorkspace, user]);
}
