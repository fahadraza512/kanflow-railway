import { useState } from 'react';
import { X, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WorkspaceMember } from '@/services/api/workspace-member.service';

interface ChangeRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: WorkspaceMember | null;
    onConfirm: (newRole: string) => void;
    isLoading?: boolean;
}

const roles = [
    {
        value: 'admin',
        label: 'Admin',
        description: 'Full workspace access',
    },
    {
        value: 'pm',
        label: 'Project Manager',
        description: 'Create projects and boards',
    },
    {
        value: 'member',
        label: 'Member',
        description: 'Edit own tasks',
    },
    {
        value: 'viewer',
        label: 'Viewer',
        description: 'Read-only access',
    },
];

export function ChangeRoleModal({ isOpen, onClose, member, onConfirm, isLoading }: ChangeRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState(member?.role || 'member');

    if (!isOpen || !member) return null;

    const handleSubmit = () => {
        onConfirm(selectedRole);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCog className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Change Role</h2>
                            <p className="text-sm text-gray-500">{member.name}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-3">
                    {roles.map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setSelectedRole(role.value)}
                            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                selectedRole === role.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                        >
                            <div className="font-semibold text-gray-900">{role.label}</div>
                            <div className="text-sm text-gray-500 mt-1">{role.description}</div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="primary"
                        className="flex-1"
                        disabled={isLoading || selectedRole === member.role}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
