import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';

export type WorkspaceRole = 'viewer' | 'member' | 'pm' | 'admin' | 'owner';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  viewer: 1,
  member: 2,
  pm: 3,
  admin: 4,
  owner: 5,
};

/**
 * Returns the current user's role in the active workspace,
 * plus convenience booleans for each role level.
 */
export function useWorkspaceRole() {
  const { activeWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();

  // Determine role: owner check first (ownerId match), then workspace.role
  let role: WorkspaceRole = 'viewer';

  if (activeWorkspace && user) {
    if (String(activeWorkspace.ownerId) === String(user.id)) {
      role = 'owner';
    } else if (activeWorkspace.role) {
      role = activeWorkspace.role as WorkspaceRole;
    }
  }

  const level = ROLE_HIERARCHY[role] ?? 1;

  return {
    role,
    isOwner: role === 'owner',
    isAdmin: level >= ROLE_HIERARCHY.admin,   // admin or owner
    isPM: level >= ROLE_HIERARCHY.pm,         // pm, admin, or owner
    isMember: level >= ROLE_HIERARCHY.member, // member, pm, admin, or owner
    isViewer: role === 'viewer',
    canCreateTask: level >= ROLE_HIERARCHY.member,
    canEditAnyTask: level >= ROLE_HIERARCHY.pm,
    canDeleteTask: level >= ROLE_HIERARCHY.member,
    canArchiveTask: level >= ROLE_HIERARCHY.pm,
    canAssignTask: level >= ROLE_HIERARCHY.pm,
    canCreateBoard: level >= ROLE_HIERARCHY.pm,
    canEditBoard: level >= ROLE_HIERARCHY.pm,
    canDeleteBoard: level >= ROLE_HIERARCHY.pm,
    canCreateProject: level >= ROLE_HIERARCHY.pm,
    canEditProject: level >= ROLE_HIERARCHY.pm,
    canDeleteProject: level >= ROLE_HIERARCHY.pm,
    canInviteMembers: level >= ROLE_HIERARCHY.admin,
    canRemoveMembers: level >= ROLE_HIERARCHY.admin,
    canChangeRoles: role === 'owner',
    canEditWorkspace: level >= ROLE_HIERARCHY.admin,
    canDeleteWorkspace: role === 'owner',
    canComment: true, // all roles can comment
    canLeaveWorkspace: role !== 'owner',
  };
}
