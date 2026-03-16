import { useState } from "react";
import { MoreVertical, UserCog, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import Badge from "@/components/ui/Badge";
import { Member, MemberRole } from "@/hooks/useMembers";

interface MembersTableProps {
    members: Member[];
    onChangeRole: (member: Member) => void;
    onRemoveMember: (memberId: string, memberName: string) => void;
}

export default function MembersTable({ members, onChangeRole, onRemoveMember }: MembersTableProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const getRoleBadgeVariant = (role: MemberRole) => {
        switch (role) {
            case "Admin": return "primary";
            case "Project Manager": return "info";
            case "Member": return "default";
            case "Viewer": return "default";
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-3 py-2 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">Member</th>
                                <th className="px-3 py-2 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">Email</th>
                                <th className="px-3 py-2 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">Role</th>
                                <th className="px-3 py-2 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 whitespace-nowrap">Status</th>
                                <th className="px-3 py-2 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.map((member, index) => (
                                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-lg shrink-0" />
                                            <span className="text-xs font-semibold text-gray-900">{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-[10px] text-gray-600 whitespace-nowrap">{member.email}</td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                                            {member.role}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <Badge 
                                            variant={member.status === "Active" ? "success" : "danger"} 
                                            size="sm"
                                        >
                                            {member.status}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-2 text-right whitespace-nowrap">
                                        <div className="relative inline-block">
                                            <button 
                                                onClick={() => setOpenMenuId(openMenuId === member.id ? null : member.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                                            >
                                                <MoreVertical className="w-3 h-3" />
                                            </button>
                                            
                                            {openMenuId === member.id && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-10" 
                                                        onClick={() => setOpenMenuId(null)}
                                                    />
                                                    <div className={clsx(
                                                        "absolute right-0 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20",
                                                        index >= members.length - 2 ? "bottom-full mb-2" : "mt-2"
                                                    )}>
                                                        <button
                                                            onClick={() => {
                                                                onChangeRole(member);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg"
                                                        >
                                                            <UserCog className="w-3 h-3" />
                                                            Change Role
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                onRemoveMember(member.id, member.name);
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 rounded-b-lg"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Remove Member
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
