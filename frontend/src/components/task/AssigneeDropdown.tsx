"use client";

import { useState } from "react";
import { useWorkspaceMembers } from "@/hooks/api/useWorkspaceMembers";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { clsx } from "clsx";

interface AssigneeDropdownProps {
    currentAssigneeId: string | number | null;
    onChange: (userId: string | number, userName: string) => void;
    readOnly?: boolean;
}

export default function AssigneeDropdown({ currentAssigneeId, onChange, readOnly }: AssigneeDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { activeWorkspace } = useWorkspaceStore();
    
    // Fetch real workspace members from API
    const { data: allMembers = [], isLoading } = useWorkspaceMembers(activeWorkspace?.id || null);
    
    // Filter out workspace owner, admins, and PMs - they have full access by default
    const members = allMembers.filter(member => {
        const isOwner = String(member.id) === String(activeWorkspace?.ownerId);
        const isAdminOrPM = member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'pm';
        return !isOwner && !isAdminOrPM;
    });

    const selectedUser = members.find(u => u.id === currentAssigneeId);

    return (
        <div className="relative">
            <button
                onClick={() => !readOnly && setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-1.5 p-1 rounded-lg transition-all border border-transparent w-full text-left",
                    !readOnly && "hover:bg-gray-50 hover:border-gray-100 group"
                )}
                disabled={readOnly || isLoading}
            >
                <div className="w-5 h-5 rounded-lg bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600 ring-1 ring-white shadow-sm shrink-0">
                    {selectedUser?.name.charAt(0) || "?"}
                </div>
                <div>
                    <p className="text-[9px] font-bold text-gray-900">
                        {isLoading ? "Loading..." : selectedUser?.name || "Unassigned"}
                    </p>
                    {!readOnly && !isLoading && (
                        <p className="text-[6px] text-gray-400 font-medium uppercase tracking-wide">Click to change</p>
                    )}
                </div>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-2 py-1 border-b border-gray-50 mb-0.5">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Select Assignee</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto custom-scrollbar">
                            {/* Unassigned option */}
                            <button
                                onClick={() => {
                                    onChange(null as any, 'Unassigned');
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 transition-all",
                                    !currentAssigneeId && "bg-blue-50/50"
                                )}
                            >
                                <div className="w-5 h-5 rounded-lg bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-400">
                                    ?
                                </div>
                                <p className="text-[9px] font-bold text-gray-500">Unassigned</p>
                            </button>
                            
                            {members.length === 0 && (
                                <div className="px-2 py-2 text-[9px] text-gray-400 text-center">
                                    No members found
                                </div>
                            )}
                            {members.map((user) => {
                                // Role badge colors - use complete class strings for Tailwind
                                const getRoleBadgeClasses = (role: string) => {
                                    switch (role.toLowerCase()) {
                                        case 'admin':
                                            return 'bg-blue-100 text-blue-700';
                                        case 'pm':
                                            return 'bg-indigo-100 text-indigo-700';
                                        case 'member':
                                            return 'bg-green-100 text-green-700';
                                        case 'viewer':
                                            return 'bg-gray-100 text-gray-700';
                                        default:
                                            return 'bg-gray-100 text-gray-700';
                                    }
                                };
                                
                                // Format role for display
                                const formatRole = (role: string) => {
                                    if (role.toLowerCase() === 'pm') return 'PM';
                                    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
                                };
                                
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            onChange(user.id, user.name);
                                            setIsOpen(false);
                                        }}
                                        className={clsx(
                                            "w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-50 transition-all",
                                            currentAssigneeId === user.id && "bg-blue-50/50"
                                        )}
                                    >
                                        <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-[8px] font-black text-blue-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between text-left">
                                            <p className="text-[9px] font-bold text-gray-900">{user.name}</p>
                                            <span className={`text-[7px] font-semibold px-1 py-0.5 rounded ${getRoleBadgeClasses(user.role)}`}>
                                                {formatRole(user.role)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
