"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DeleteWorkspaceCardProps {
    isDeleting: boolean;
    workspaceName: string;
    onDelete: () => void;
}

export default function DeleteWorkspaceCard({ isDeleting, workspaceName, onDelete }: DeleteWorkspaceCardProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState("");

    const handleDeleteClick = () => {
        setShowConfirmation(true);
        setConfirmationInput("");
    };

    const handleConfirmDelete = () => {
        if (confirmationInput === workspaceName) {
            setShowConfirmation(false);
            setConfirmationInput("");
            onDelete();
        }
    };

    const handleCancel = () => {
        setShowConfirmation(false);
        setConfirmationInput("");
    };

    if (showConfirmation) {
        return (
            <Card variant="bordered" className="border-red-200">
                <CardHeader divider>
                    <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Confirm Deletion
                    </h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-900 font-semibold mb-2">
                                This action cannot be undone. All workspace data will be permanently deleted.
                            </p>
                            <p className="text-[10px] text-red-700">
                                Type the workspace name <span className="font-bold">"{workspaceName}"</span> to confirm deletion.
                            </p>
                        </div>

                        <input
                            type="text"
                            value={confirmationInput}
                            onChange={(e) => setConfirmationInput(e.target.value)}
                            placeholder={`Type "${workspaceName}" to confirm`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                        />

                        <div className="flex gap-2">
                            <Button
                                onClick={handleCancel}
                                disabled={isDeleting}
                                variant="secondary"
                                size="sm"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting || confirmationInput !== workspaceName}
                                variant="danger"
                                size="sm"
                                isLoading={isDeleting}
                                className="flex-1"
                            >
                                {isDeleting ? "Deleting..." : "Delete Permanently"}
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card variant="bordered" className="border-red-200">
            <CardHeader divider>
                <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Danger Zone
                </h3>
            </CardHeader>
            <CardBody>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex-1">
                        <h4 className="text-xs font-semibold text-red-900 mb-0.5">Delete this Workspace</h4>
                        <p className="text-[10px] text-red-600">Permanently delete all data. Cannot be undone.</p>
                    </div>
                    <Button
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        variant="danger"
                        size="sm"
                        className="w-full sm:w-auto shrink-0"
                    >
                        Delete Workspace
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
}
