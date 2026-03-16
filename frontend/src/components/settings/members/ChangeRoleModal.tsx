import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Member, MemberRole } from "@/hooks/useMembers";

interface ChangeRoleModalProps {
    isOpen: boolean;
    member: Member | null;
    onClose: () => void;
    onSave: (memberId: string, newRole: MemberRole) => void;
}

const ROLES: { role: MemberRole; description: string }[] = [
    { role: "Admin", description: "Full workspace access" },
    { role: "Project Manager", description: "Create projects and boards" },
    { role: "Member", description: "Edit own tasks" },
    { role: "Viewer", description: "Read-only access" }
];

export default function ChangeRoleModal({ isOpen, member, onClose, onSave }: ChangeRoleModalProps) {
    const [newRole, setNewRole] = useState<MemberRole>("Member");

    // Update newRole when member changes
    useEffect(() => {
        if (member) {
            setNewRole(member.role);
        }
    }, [member]);

    if (!isOpen || !member) return null;

    const handleSave = () => {
        onSave(member.id, newRole);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalHeader onClose={onClose}>
                <h2 className="text-sm font-bold text-gray-900">Change Role</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">{member.name}</p>
            </ModalHeader>

            <ModalBody>
                <div className="space-y-1.5">
                    {ROLES.map(({ role, description }) => (
                        <button
                            key={role}
                            onClick={() => setNewRole(role)}
                            className={clsx(
                                "w-full p-2 rounded-lg border text-left transition-colors",
                                newRole === role
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                            )}
                        >
                            <div className="text-xs font-semibold text-gray-900">{role}</div>
                            <div className="text-[9px] text-gray-500 mt-0.5">{description}</div>
                        </button>
                    ))}
                </div>
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" onClick={onClose} fullWidth>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSave} fullWidth>
                    Save Changes
                </Button>
            </ModalFooter>
        </Modal>
    );
}
