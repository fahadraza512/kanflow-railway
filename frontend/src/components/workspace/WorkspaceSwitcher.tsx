'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';

export function WorkspaceSwitcher() {
  const router = useRouter();
  const { workspaces, activeWorkspace, switchWorkspace } = useWorkspaceStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Temporary debug logging - will remove after fixing
  console.log('=== WORKSPACE SWITCHER DEBUG ===');
  console.log('User ID:', user?.id);
  console.log('Workspaces with FULL data:', workspaces.map(w => ({
    id: w.id,
    name: w.name,
    ownerId: w.ownerId,
    createdBy: w.createdBy,
    role: w.role,
    hasRole: !!w.role,
    roleValue: w.role
  })));
  console.log('Active Workspace FULL data:', activeWorkspace ? {
    id: activeWorkspace.id,
    name: activeWorkspace.name,
    ownerId: activeWorkspace.ownerId,
    createdBy: activeWorkspace.createdBy,
    role: activeWorkspace.role,
    hasRole: !!activeWorkspace.role
  } : null);
  console.log('================================');

  const handleWorkspaceSwitch = (workspaceId: string | number) => {
    switchWorkspace(workspaceId);
    setIsOpen(false);
    router.push('/dashboard');
  };

  // Check if workspace is invited (user is not the owner)
  const isInvitedWorkspace = (workspace: any) => {
    // Use userRole from backend - if it's not 'owner', user was invited
    if (workspace.role) {
      return workspace.role !== 'owner';
    }
    
    // Fallback: Compare owner ID with current user ID
    const workspaceOwnerId = String(workspace.ownerId || workspace.createdBy || '');
    const currentUserId = String(user?.id || '');
    const isInvited = workspaceOwnerId && currentUserId && workspaceOwnerId !== currentUserId;
    
    // Debug logging
    console.log(`🔍 BADGE CHECK for "${workspace.name}":`, {
      workspaceRole: workspace.role,
      workspaceOwnerId,
      currentUserId,
      isInvited: workspace.role ? workspace.role !== 'owner' : isInvited
    });
    
    return isInvited;
  };

  const formatRole = (workspace: any) => {
    // If workspace has a role property, format it
    if (workspace.role) {
      if (workspace.role === 'pm') return 'PM';
      if (workspace.role === 'owner') return 'Owner';
      return workspace.role.charAt(0).toUpperCase() + workspace.role.slice(1);
    }
    return null;
  };

  const formatPlan = (plan?: string) => {
    if (!plan) return 'Free';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getPlanBadgeColor = (plan?: string): "default" | "primary" | "success" | "warning" | "danger" | "info" => {
    if (plan === 'pro') return 'info'; // purple
    return 'default'; // gray
  };

  const getRoleBadgeColor = (role: string): "default" | "primary" | "success" | "warning" | "danger" | "info" | "purple" | "blue" | "indigo" | "green" | "gray" => {
    if (role === 'owner') return 'purple';   // Purple
    if (role === 'admin') return 'green';    // Green (you said Admin already has green)
    if (role === 'pm') return 'indigo';      // Indigo (Project Manager)
    if (role === 'member') return 'purple';  // Purple
    if (role === 'viewer') return 'gray';    // Gray
    return 'gray';
  };

  const getRoleDotColor = (role: string) => {
    if (role === 'owner') return { bg: 'bg-purple-500', ping: 'bg-purple-400' };
    if (role === 'admin') return { bg: 'bg-green-500', ping: 'bg-green-400' };
    if (role === 'pm') return { bg: 'bg-indigo-500', ping: 'bg-indigo-400' };
    if (role === 'member') return { bg: 'bg-purple-500', ping: 'bg-purple-400' };
    if (role === 'viewer') return { bg: 'bg-gray-500', ping: 'bg-gray-400' };
    return { bg: 'bg-gray-500', ping: 'bg-gray-400' };
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm font-medium text-gray-900 truncate">
            {activeWorkspace?.name || 'Select Workspace'}
          </span>
          {activeWorkspace && isInvitedWorkspace(activeWorkspace) && (
            <>
              {/* Role-based pulsing dot for invited workspace */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getRoleDotColor(activeWorkspace.role || '').ping} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${getRoleDotColor(activeWorkspace.role || '').bg}`}></span>
              </span>
              {/* Role badge for invited workspace */}
              {formatRole(activeWorkspace) && (
                <Badge 
                  variant={getRoleBadgeColor(formatRole(activeWorkspace)?.toLowerCase() || '')} 
                  size="sm"
                >
                  {formatRole(activeWorkspace)}
                </Badge>
              )}
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {workspaces.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No workspaces found
              </div>
            ) : (
              <div className="py-2">
                {workspaces.map((workspace) => {
                  const role = formatRole(workspace);
                  const plan = formatPlan(workspace.plan);
                  const planColor = getPlanBadgeColor(workspace.plan);
                  const isInvited = isInvitedWorkspace(workspace);
                  
                  return (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSwitch(workspace.id)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                      title={isInvited ? `You were invited to ${workspace.name}` : undefined}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {workspace.name}
                        </span>
                        {isInvited && (
                          <>
                            {/* Role-based pulsing dot for invited workspaces */}
                            <span className="relative flex h-2 w-2 shrink-0">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getRoleDotColor(workspace.role || '').ping} opacity-75`}></span>
                              <span className={`relative inline-flex rounded-full h-2 w-2 ${getRoleDotColor(workspace.role || '').bg}`}></span>
                            </span>
                            {/* Role badge for invited workspaces */}
                            {role && (
                              <Badge variant={getRoleBadgeColor(role.toLowerCase())} size="sm">
                                {role}
                              </Badge>
                            )}
                          </>
                        )}
                        <Badge variant={planColor} size="sm">
                          {plan}
                        </Badge>
                      </div>
                      {activeWorkspace?.id === workspace.id && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="border-t border-gray-200 p-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsOpen(false);
                  router.push('/dashboard/workspace');
                }}
                variant="outline"
                size="sm"
                className="w-full justify-center"
                type="button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Workspace
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
