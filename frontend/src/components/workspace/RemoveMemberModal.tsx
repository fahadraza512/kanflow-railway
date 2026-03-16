import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WorkspaceMember } from '@/services/api/workspace-member.service';

interface RemoveMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    member: WorkspaceMember | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function RemoveMemberModal({ isOpen, onClose, member, onConfirm, isLoading }: RemoveMemberModalProps) {
    if (!isOpen || !member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Remove Member</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">This action cannot be undone</p>
                            <p>The member will lose access to this workspace and all its projects.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                            Are you sure you want to remove <span className="font-semibold">{member.name}</span> from this workspace?
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="text-sm font-medium text-gray-900">{member.email}</div>
                        </div>
                    </div>
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
                        onClick={onConfirm}
                        variant="danger"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Removing...' : 'Remove Member'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
