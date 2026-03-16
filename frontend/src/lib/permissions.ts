/**
 * Role-Based Access Control (RBAC) Utilities
 * 
 * Defines permissions for different workspace roles:
 * - Owner: Full access to everything
 * - Admin: Nearly full access, can manage most features
 * - PM (Project Manager): Can manage projects, boards, tasks, and assign members
 * - Member: Limited access, can only work in assigned projects
 * - Viewer: Read-only access to assigned projects
 */

export type WorkspaceRole = 'owner' | 'admin' | 'pm' | 'member' | 'viewer';

export interface PermissionCheck {
  canCreateProject: boolean;
  canEditProject: boolean;
  canDeleteProject: boolean;
  canArchiveProject: boolean;
  canAssignMembers: boolean;
  canInviteMembers: boolean;
  canManageInvitations: boolean;
  canEditWorkspace: boolean;
  canDeleteWorkspace: boolean;
  canViewActivityStatus: boolean;
  canCreateBoard: boolean;
  canEditBoard: boolean;
  canDeleteBoard: boolean;
  canCreateTask: boolean;
  canEditTask: boolean;
  canDeleteTask: boolean;
  canAssignTask: boolean;
  canSeeAllProjects: boolean;
}

/**
 * Get permissions for a user based on their workspace role
 */
export function getPermissions(role: WorkspaceRole | undefined, isOwner: boolean): PermissionCheck {
  // Owner has full access
  if (isOwner) {
    return {
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canArchiveProject: true,
      canAssignMembers: true,
      canInviteMembers: true,
      canManageInvitations: true,
      canEditWorkspace: true,
      canDeleteWorkspace: true,
      canViewActivityStatus: true,
      canCreateBoard: true,
      canEditBoard: true,
      canDeleteBoard: true,
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: true,
      canAssignTask: true,
      canSeeAllProjects: true,
    };
  }

  // Admin permissions
  if (role === 'admin') {
    return {
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canArchiveProject: true,
      canAssignMembers: true,
      canInviteMembers: true,
      canManageInvitations: true,
      canEditWorkspace: true,
      canDeleteWorkspace: false, // Only owner can delete workspace
      canViewActivityStatus: false, // Only owner can see activity status
      canCreateBoard: true,
      canEditBoard: true,
      canDeleteBoard: true,
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: true,
      canAssignTask: true,
      canSeeAllProjects: true,
    };
  }

  // Project Manager (PM) permissions
  if (role === 'pm') {
    return {
      canCreateProject: true,
      canEditProject: true,
      canDeleteProject: true,
      canArchiveProject: true,
      canAssignMembers: true,
      canInviteMembers: false, // Cannot invite to workspace
      canManageInvitations: false, // Cannot manage invitations
      canEditWorkspace: false,
      canDeleteWorkspace: false,
      canViewActivityStatus: false,
      canCreateBoard: true,
      canEditBoard: true,
      canDeleteBoard: true,
      canCreateTask: true,
      canEditTask: true,
      canDeleteTask: true,
      canAssignTask: true,
      canSeeAllProjects: true,
    };
  }

  // Member permissions (only in assigned projects)
  if (role === 'member') {
    return {
      canCreateProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canArchiveProject: false,
      canAssignMembers: false,
      canInviteMembers: false,
      canManageInvitations: false,
      canEditWorkspace: false,
      canDeleteWorkspace: false,
      canViewActivityStatus: false,
      canCreateBoard: true, // In assigned projects only
      canEditBoard: true, // In assigned projects only
      canDeleteBoard: true, // In assigned projects only
      canCreateTask: true, // In assigned projects only
      canEditTask: true, // In assigned projects only
      canDeleteTask: true, // In assigned projects only
      canAssignTask: true, // In assigned projects only
      canSeeAllProjects: false, // Only see assigned projects
    };
  }

  // Viewer permissions (read-only)
  if (role === 'viewer') {
    return {
      canCreateProject: false,
      canEditProject: false,
      canDeleteProject: false,
      canArchiveProject: false,
      canAssignMembers: false,
      canInviteMembers: false,
      canManageInvitations: false,
      canEditWorkspace: false,
      canDeleteWorkspace: false,
      canViewActivityStatus: false,
      canCreateBoard: false,
      canEditBoard: false,
      canDeleteBoard: false,
      canCreateTask: false,
      canEditTask: false,
      canDeleteTask: false,
      canAssignTask: false,
      canSeeAllProjects: false, // Only see assigned projects
    };
  }

  // Default: no permissions
  return {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canArchiveProject: false,
    canAssignMembers: false,
    canInviteMembers: false,
    canManageInvitations: false,
    canEditWorkspace: false,
    canDeleteWorkspace: false,
    canViewActivityStatus: false,
    canCreateBoard: false,
    canEditBoard: false,
    canDeleteBoard: false,
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignTask: false,
    canSeeAllProjects: false,
  };
}

/**
 * Check if user can perform project management actions
 */
export function canManageProjects(role: WorkspaceRole | undefined, isOwner: boolean): boolean {
  if (isOwner) return true;
  return role === 'admin' || role === 'pm';
}

/**
 * Check if user can see all projects in workspace
 */
export function canSeeAllProjects(role: WorkspaceRole | undefined, isOwner: boolean): boolean {
  if (isOwner) return true;
  return role === 'admin' || role === 'pm';
}

/**
 * Check if user can invite members to workspace
 */
export function canInviteMembers(role: WorkspaceRole | undefined, isOwner: boolean): boolean {
  if (isOwner) return true;
  return role === 'admin';
}

/**
 * Check if user can assign members to projects
 */
export function canAssignProjectMembers(role: WorkspaceRole | undefined, isOwner: boolean): boolean {
  if (isOwner) return true;
  return role === 'admin' || role === 'pm';
}

/**
 * Check if user has read-only access
 */
export function isReadOnly(role: WorkspaceRole | undefined): boolean {
  return role === 'viewer';
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: WorkspaceRole | undefined): string {
  if (!role) return 'Unknown';
  
  const roleNames: Record<WorkspaceRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    pm: 'Project Manager',
    member: 'Member',
    viewer: 'Viewer',
  };
  
  return roleNames[role] || 'Unknown';
}

/**
 * Get role badge color classes
 */
export function getRoleBadgeColor(role: WorkspaceRole | undefined): string {
  if (!role) return 'bg-gray-100 text-gray-700';
  
  const colors: Record<WorkspaceRole, string> = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    pm: 'bg-indigo-100 text-indigo-700',
    member: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-700';
}
