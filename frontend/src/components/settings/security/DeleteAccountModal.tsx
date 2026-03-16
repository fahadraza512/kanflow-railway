import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (confirmation: string) => void;
}

export default function DeleteAccountModal({ isOpen, onClose, onConfirm }: DeleteAccountModalProps) {
    const [deleteConfirmation, setDeleteConfirmation] = useState("");

    const handleConfirm = () => {
        onConfirm(deleteConfirmation);
        setDeleteConfirmation("");
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalHeader onClose={onClose}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                </div>
                <p className="text-xs text-gray-500">
                    This action cannot be undone. All your data, workspaces, projects, and tasks will be permanently deleted.
                </p>
            </ModalHeader>

            <ModalBody>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Type "DELETE" to confirm
                    </label>
                    <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </ModalBody>

            <ModalFooter>
                <button
                    onClick={() => {
                        onClose();
                        setDeleteConfirmation("");
                    }}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={deleteConfirmation !== "DELETE"}
                    className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Delete Forever
                </button>
            </ModalFooter>
        </Modal>
    );
}
