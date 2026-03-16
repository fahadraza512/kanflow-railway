"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceMembers } from "@/hooks/api/useWorkspaceMembers";
import { useUpdateMemberRole, useRemoveWorkspaceMember } from "@/hooks/api/useWorkspaces";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { showToast } from "@/lib/toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, X, Mail, Search, MoreVertical } from "lucide-react";
import { InviteMemberModal } from "@/components/workspace/InviteMemberModal";
import { InvitationList } from "@/components/workspace/InvitationList";
import { ChangeRoleModal } from "@/components/workspace/ChangeRoleModal";
import { RemoveMemberModal } from "@/components/workspace/RemoveMemberModal";
import { Button } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { FEATURES } from "@/config/features";
import { WorkspaceMember } from "@/services/api/workspace-member.service";

export default function MembersPage() {
    return <MembersPageContent />;
}

function MembersPageContent() {
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();
    const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
    const [invitationRefreshKey, setInvitationRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);
    const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
    const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
    const updateRoleMutation = useUpdateMemberRole();
    const removeMemberMutation = useRemoveWorkspaceMember();

    // Fetch workspace members with polling for real-time status updates
    const { data: members = [], isLoading: isLoadingMembers, error } = useWorkspaceMembers(
        activeWorkspace?.id || null,
        {
            refetchInterval: 5000, // Poll every 5 seconds for status updates
            enabled: !!activeWorkspace?.id,
            onError: (error: any) => {
                // Display error toast if all retries fail
                const errorMessage = error?.response?.data?.message || "Failed to load workspace members";
                showToast.error(errorMessage);
            },
        }
    );

    // Send heartbeat to track user activity on members page
    useHeartbeat(activeWorkspace?.id || null, !!activeWorkspace?.id);

    // Check if user is workspace owner
    const isWorkspaceOwner = activeWorkspace && user 
        ? String(activeWorkspace.ownerId) === String(user.id)
        : false;

    const formatRole = (role: string) => {
        if (role === 'pm') return 'Project Manager';
        if (role === 'owner') return 'Owner';
        return role.charAt(0).toUpperCase() + role.slice(1);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role.toLowerCase()) {
            case 'owner': return 'info';      // Purple
            case 'admin': return 'primary';   // Blue
            case 'pm': return 'info';         // Purple (Project Manager)
            case 'member': return 'default';  // Gray
            case 'viewer': return 'default';  // Gray
            default: return 'default';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        return status === 'active' ? 'success' : 'default';  // Green for active, Gray for inactive
    };

    const handleOpenDropdown = (memberId: string, event: React.MouseEvent<HTMLButtonElement>) => {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        
        setDropdownPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right
        });
        setOpenDropdownId(openDropdownId === memberId ? null : memberId);
    };

    const handleChangeRole = (member: WorkspaceMember) => {
        setSelectedMember(member);
        setIsChangeRoleModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleRemoveMember = (member: WorkspaceMember) => {
        setSelectedMember(member);
        setIsRemoveMemberModalOpen(true);
        setOpenDropdownId(null);
    };

    // Close dropdown when clicking outside
    const handleClickOutside = () => {
        if (openDropdownId) {
            setOpenDropdownId(null);
            setDropdownPosition(null);
        }
    };

    const handleConfirmChangeRole = (newRole: string) => {
        if (!activeWorkspace?.id || !selectedMember) return;

        updateRoleMutation.mutate(
            {
                workspaceId: activeWorkspace.id,
                userId: selectedMember.id,
                role: newRole as any,
            },
            {
                onSuccess: () => {
                    showToast.success(`Role updated to ${newRole}`);
                    setIsChangeRoleModalOpen(false);
                    setSelectedMember(null);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to update role";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    const handleConfirmRemoveMember = () => {
        if (!activeWorkspace?.id || !selectedMember) return;

        removeMemberMutation.mutate(
            {
                workspaceId: activeWorkspace.id,
                userId: selectedMember.id,
            },
            {
                onSuccess: () => {
                    showToast.success(`${selectedMember.name} removed from workspace`);
                    setIsRemoveMemberModalOpen(false);
                    setSelectedMember(null);
                },
                onError: (error: any) => {
                    const errorMessage = error?.response?.data?.message || "Failed to remove member";
                    showToast.error(errorMessage);
                }
            }
        );
    };

    // Filter members based on search and exclude workspace owner
    const filteredMembers = members.filter(member => {
        // Exclude workspace owner from the list
        if (activeWorkspace && String(member.id) === String(activeWorkspace.ownerId)) {
            return false;
        }
        
        // Apply search filter
        if (searchQuery) {
            return member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   member.email?.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        return true;
    });

    const hasWorkspace = !!activeWorkspace;

    return (
        <DashboardLayout>
            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Workspace Banner */}
                {hasWorkspace && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-900">
                            Workspace: <span className="font-bold">{activeWorkspace.name}</span>
                            {activeWorkspace.role && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                                    {activeWorkspace.role === 'pm' ? 'PM' : 
                                     activeWorkspace.role === 'owner' ? 'Owner' :
                                     activeWorkspace.role.charAt(0).toUpperCase() + activeWorkspace.role.slice(1)}
                                </span>
                            )}
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Workspace Members</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {hasWorkspace 
                            ? `Manage team members and roles for ${activeWorkspace.name}`
                            : "Select a workspace to manage members"
                        }
                    </p>
                </div>

                {!hasWorkspace && (
                    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workspace Selected</h3>
                        <p className="text-sm text-gray-500">Create or select a workspace to manage members.</p>
                    </div>
                )}

                {hasWorkspace && (
                    <>
                        {/* Search and Actions */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="relative flex-1 w-full sm:max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    {FEATURES.invitations && (
                                        <Button
                                            onClick={() => setIsInviteMemberModalOpen(true)}
                                            variant="primary"
                                            size="sm"
                                            disabled={!isWorkspaceOwner}
                                            title={!isWorkspaceOwner ? "Only workspace owners can invite members" : "Invite member via email"}
                                            className="flex-1 sm:flex-initial"
                                        >
                                            <Mail className="w-4 h-4 mr-2" />
                                            Invite Member
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Member
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Role
                                            </th>
                                            {isWorkspaceOwner && (
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            )}
                                            <th className="text-right py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoadingMembers ? (
                                            <tr>
                                                <td colSpan={isWorkspaceOwner ? 5 : 4} className="py-12 text-center text-sm text-gray-500">
                                                    Loading members...
                                                </td>
                                            </tr>
                                        ) : filteredMembers.length === 0 ? (
                                            <tr>
                                                <td colSpan={isWorkspaceOwner ? 5 : 4} className="py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                                            {searchQuery ? 'No members found' : 'No other members yet'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {searchQuery ? 'Try a different search term' : 'Invite members to collaborate on this workspace'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredMembers.map((member) => (
                                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm text-gray-900">
                                                                    {member.name || 'Unknown'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm text-gray-600">
                                                        {member.email}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <Badge variant={getRoleBadgeColor(member.role) as any}>
                                                            {formatRole(member.role)}
                                                        </Badge>
                                                    </td>
                                                    {isWorkspaceOwner && (
                                                        <td className="py-4 px-6">
                                                            <Badge 
                                                                variant={getStatusBadgeColor(member.status || 'inactive') as any}
                                                                dot
                                                            >
                                                                {member.status === 'active' ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                    )}
                                                    <td className="py-4 px-6 text-right">
                                                        <button
                                                            onClick={(e) => handleOpenDropdown(member.id, e)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="More actions"
                                                        >
                                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        
                                                        {openDropdownId === member.id && dropdownPosition && (
                                                            <>
                                                                <div 
                                                                    className="fixed inset-0 z-10" 
                                                                    onClick={handleClickOutside}
                                                                />
                                                                <div 
                                                                    className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-48"
                                                                    style={{
                                                                        top: `${dropdownPosition.top}px`,
                                                                        right: `${dropdownPosition.right}px`
                                                                    }}
                                                                >
                                                                    <button
                                                                        onClick={() => handleChangeRole(member)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                        Change Role
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleRemoveMember(member)}
                                                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                        Remove Member
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Invitation List */}
                        {FEATURES.invitations && isWorkspaceOwner && (
                            <div className="mt-8">
                                <div className="mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Pending Invitations</h2>
                                    <p className="text-sm text-gray-600">
                                        Track invitations you've sent. Invitations expire after 7 days and can be resent or cancelled.
                                    </p>
                                </div>
                                
                                <InvitationList 
                                    key={invitationRefreshKey}
                                    workspaceId={String(activeWorkspace.id)}
                                />
                            </div>
                        )}
                    </>
                )}
            </main>

            {FEATURES.invitations && (
                <InviteMemberModal
                    isOpen={isInviteMemberModalOpen}
                    onClose={() => setIsInviteMemberModalOpen(false)}
                    workspaceId={activeWorkspace?.id || ''}
                    onSuccess={() => {
                        showToast.success('Invitation sent successfully');
                        setInvitationRefreshKey(prev => prev + 1);
                    }}
                />
            )}

            <ChangeRoleModal
                isOpen={isChangeRoleModalOpen}
                onClose={() => {
                    setIsChangeRoleModalOpen(false);
                    setSelectedMember(null);
                }}
                member={selectedMember}
                onConfirm={handleConfirmChangeRole}
                isLoading={updateRoleMutation.isPending}
            />

            <RemoveMemberModal
                isOpen={isRemoveMemberModalOpen}
                onClose={() => {
                    setIsRemoveMemberModalOpen(false);
                    setSelectedMember(null);
                }}
                member={selectedMember}
                onConfirm={handleConfirmRemoveMember}
                isLoading={removeMemberMutation.isPending}
            />
        </DashboardLayout>
    );
}
