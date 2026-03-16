import { useState, useRef, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";
import { useWorkspaceMembers } from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

interface ImprovedAssigneeProps {
    currentAssigneeId?: string | null;
    currentAssigneeName?: string | null;
    onChange: (userId: string, userName: string) => void;
    readOnly?: boolean;
}

export default function ImprovedAssignee({
    currentAssigneeId,
    currentAssigneeName,
    onChange,
    readOnly
}: ImprovedAssigneeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { activeWorkspace } = useWorkspaceStore();
    const { data: allMembers = [] } = useWorkspaceMembers(activeWorkspace?.id || null);
    
    // Track the last assignee ID to prevent duplicate onChange calls
    const lastAssigneeIdRef = useRef<string | null | undefined>(currentAssigneeId);
    
    // Filter out workspace owner, admins, and PMs - they have full access by default
    const members = allMembers.filter(member => {
        const isOwner = String(member.id) === String(activeWorkspace?.ownerId);
        const isAdminOrPM = member.role?.toLowerCase() === 'admin' || member.role?.toLowerCase() === 'pm';
        return !isOwner && !isAdminOrPM;
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);
    
    // Update the ref when currentAssigneeId changes from external source
    useEffect(() => {
        lastAssigneeIdRef.current = currentAssigneeId;
    }, [currentAssigneeId]);

    const currentAssignee = members.find(m => m.id === currentAssigneeId);
    // Only show assigned if we have a valid assigneeId (not null, not empty, not undefined)
    const hasValidAssigneeId = currentAssigneeId && currentAssigneeId !== '' && currentAssigneeId !== 'null' && currentAssigneeId !== 'undefined';
    // Only use currentAssigneeName if we have a valid ID but can't find the member (e.g., filtered out owner/admin/pm)
    const assigneeName = hasValidAssigneeId ? (currentAssignee?.name || currentAssigneeName || null) : null;
    const initials = assigneeName
        ? assigneeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    
    // Debug logging
    console.log('[ImprovedAssignee] currentAssigneeId:', currentAssigneeId, 'hasValidAssigneeId:', hasValidAssigneeId, 'assigneeName:', assigneeName);
    
    const handleSelect = (userId: string | null, userName: string) => {
        // Guard: Only call onChange if the value actually changed
        if (userId === lastAssigneeIdRef.current) {
            console.log('[ImprovedAssignee] SKIPPED onChange - same value:', userId);
            setIsOpen(false);
            return;
        }
        
        console.log('[ImprovedAssignee] Calling onChange with userId:', userId, 'userName:', userName);
        lastAssigneeIdRef.current = userId;
        onChange(userId as any, userName);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => !readOnly && setIsOpen(!isOpen)}
                disabled={readOnly}
                className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex items-center gap-2">
                    {assigneeName ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
                                {initials}
                            </div>
                            <span className="text-xs font-medium text-gray-900">{assigneeName}</span>
                        </>
                    ) : (
                        <>
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500">Unassigned</span>
                        </>
                    )}
                </div>
                {!readOnly && <ChevronDown className="w-3 h-3 text-gray-400" />}
            </button>

            {isOpen && !readOnly && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    <button
                        onClick={() => handleSelect(null, 'Unassigned')}
                        className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-500">Unassigned</span>
                    </button>
                    {members.map((member) => {
                        const name = member.name || 'Unknown';
                        const memberInitials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        
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
                                key={member.id}
                                onClick={() => handleSelect(member.id, name)}
                                className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-semibold">
                                    {memberInitials}
                                </div>
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-900">{name}</span>
                                    <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${getRoleBadgeClasses(member.role)}`}>
                                        {formatRole(member.role)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
