"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Check, Loader2 } from "lucide-react";
import { Project } from "@/types/api.types";
import { useWorkspaceMembers } from "@/hooks/api/useWorkspaceMembers";
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember } from "@/hooks/api/useProjectMembers";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/lib/toast";
import { clsx } from "clsx";

interface AssignMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: Project;
}

export default function AssignMembersModal({ isOpen, onClose, onSuccess, project }: AssignMembersModalProps) {
    const { activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch workspace members (only invited members, not pending)
    const { data: workspaceMembers = [], isLoading: isLoadingWorkspace } = useWorkspaceMembers(
        activeWorkspace?.id || null,
        { enabled: isOpen && !!activeWorkspace?.id }
    );

    // Fetch current project members
    const { data: projectMembers = [], isLoading: isLoadingProject } = useProjectMembers(
        isOpen ? project.id.toString() : null
    );

    const addMemberMutation = useAddProjectMember();
    const removeMemberMutation = useRemoveProjectMember();

    // Check if current user can assign members (Owner, Admin, or PM)
    const canAssignMembers = activeWorkspace && user ? (
        String(activeWorkspace.ownerId) === String(user.id) || // Owner
        activeWorkspace.role === 'admin' || // Admin
        activeWorkspace.role === 'pm' // Project Manager
    ) : false;

    // Initialize selected members when project members load
    useEffect(() => {
        if (projectMembers.length > 0) {
            setSelectedMembers(projectMembers.map((pm: any) => pm.userId));
        }
    }, [projectMembers]);

    if (!isOpen) return null;

    if (!canAssignMembers) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-lg w-full max-w-md shadow-md border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Only workspace Owners, Admins, and Project Managers can assign members to projects.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const toggleMember = (userId: string) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const currentMemberIds = projectMembers.map((pm: any) => pm.userId);
            
            // Find members to add (selected but not currently in project)
            const membersToAdd = selectedMembers.filter(id => !currentMemberIds.includes(id));
            
            // Find members to remove (currently in project but not selected)
            const membersToRemove = currentMemberIds.filter((id: string) => !selectedMembers.includes(id));

            // Add new members
            for (const userId of membersToAdd) {
                await addMemberMutation.mutateAsync({
                    projectId: project.id.toString(),
                    userId,
                    role: 'member'
                });
            }

            // Remove unselected members
            for (const userId of membersToRemove) {
                await removeMemberMutation.mutateAsync({
                    projectId: project.id.toString(),
                    userId
                });
            }

            showToast.success('Project members updated successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating project members:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update project members';
            showToast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = isLoadingWorkspace || isLoadingProject;

    // Filter out workspace owner, admins, and PMs - they have full access by default
    const availableMembers = workspaceMembers.filter((member: any) => {
        // Exclude workspace owner
        if (activeWorkspace && String(member.id) === String(activeWorkspace.ownerId)) {
            return false;
        }
        // Exclude admins and PMs - they have full access to all projects
        const role = member.role?.toLowerCase();
        if (role === 'admin' || role === 'pm') {
            return false;
        }
        return true;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-md border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Assign Members</h2>
                                <p className="text-sm text-gray-500">{project.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : availableMembers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-sm text-gray-500">No workspace members available to assign.</p>
                            <p className="text-xs text-gray-400 mt-2">Invite members to the workspace first.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                                {availableMembers.map((member: any) => {
                                    const isSelected = selectedMembers.includes(member.id);
                                    return (
                                        <button
                                            key={member.id}
                                            onClick={() => toggleMember(member.id)}
                                            className={clsx(
                                                "w-full p-4 rounded-lg border text-left transition-colors flex items-center gap-3",
                                                isSelected
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="text-sm font-semibold text-gray-900">{member.name || 'Unknown'}</div>
                                                    {member.role && (
                                                        <span className={clsx(
                                                            "px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase",
                                                            member.role === 'admin' && "bg-blue-100 text-blue-700",
                                                            member.role === 'pm' && "bg-indigo-100 text-indigo-700",
                                                            member.role === 'member' && "bg-green-100 text-green-700",
                                                            member.role === 'viewer' && "bg-gray-100 text-gray-700"
                                                        )}>
                                                            {member.role === 'pm' ? 'PM' : member.role}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">{member.email}</div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between mb-4 text-sm">
                                <span className="text-gray-600 font-medium">Selected:</span>
                                <span className="text-blue-600 font-semibold">{selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''}</span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
