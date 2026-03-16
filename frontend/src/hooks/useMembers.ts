import { useState, useEffect } from "react";
import { getActiveWorkspace, getWorkspaceById } from "@/lib/storage";
import { useHydration } from "./useHydration";

export type MemberRole = "Admin" | "Project Manager" | "Member" | "Viewer";
export type MemberStatus = "Active" | "Inactive";

export interface Member {
    id: string;
    name: string;
    email: string;
    role: MemberRole;
    status: MemberStatus;
    avatar: string;
}

const INITIAL_MEMBERS: Member[] = [
    { id: "1", name: "Dianne Russell", email: "dianne.r@kanbanflow.com", role: "Admin", status: "Active", avatar: "https://i.pravatar.cc/150?u=dianne" },
    { id: "2", name: "Guy Hawkins", email: "guy.h@kanbanflow.com", role: "Project Manager", status: "Active", avatar: "https://i.pravatar.cc/150?u=guy" },
    { id: "3", name: "Esther Howard", email: "esther.h@kanbanflow.com", role: "Member", status: "Inactive", avatar: "https://i.pravatar.cc/150?u=esther" },
    { id: "4", name: "Robert Fox", email: "robert.f@kanbanflow.com", role: "Viewer", status: "Active", avatar: "https://i.pravatar.cc/150?u=robert" },
    { id: "5", name: "Jane Cooper", email: "jane.c@kanbanflow.com", role: "Admin", status: "Active", avatar: "https://i.pravatar.cc/150?u=jane" },
];

export function useMembers() {
    const isHydrated = useHydration();
    const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
    const [searchQuery, setSearchQuery] = useState("");
    const [workspaceName, setWorkspaceName] = useState<string>("");

    useEffect(() => {
        if (!isHydrated) return;
        
        const activeWsId = getActiveWorkspace();
        if (activeWsId) {
            const workspace = getWorkspaceById(activeWsId);
            if (workspace) {
                setWorkspaceName(workspace.name);
            }
        }
    }, [isHydrated]);

    const filteredMembers = members.filter(
        (m) =>
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const addMember = (email: string, role: string) => {
        const newMember: Member = {
            id: Date.now().toString(),
            name: email.split('@')[0].replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            email: email,
            role: role === "ADMIN" ? "Admin" :
                  role === "PROJECT_MANAGER" ? "Project Manager" :
                  role === "MEMBER" ? "Member" : "Viewer",
            status: "Active",
            avatar: `https://i.pravatar.cc/150?u=${email}`
        };
        setMembers(prev => [...prev, newMember]);
    };

    const updateMemberRole = (memberId: string, newRole: MemberRole) => {
        setMembers(prev =>
            prev.map(m =>
                m.id === memberId ? { ...m, role: newRole } : m
            )
        );
    };

    const removeMember = (memberId: string, memberName: string) => {
        if (confirm(`Are you sure you want to remove ${memberName} from the workspace?`)) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
            return true;
        }
        return false;
    };

    return {
        members: filteredMembers,
        searchQuery,
        workspaceName,
        setSearchQuery,
        addMember,
        updateMemberRole,
        removeMember
    };
}
