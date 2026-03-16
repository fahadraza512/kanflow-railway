"use client";

import { useState } from "react";
import { X, Check, FolderKanban } from "lucide-react";
import { useCreateBoard } from "@/hooks/api";
import { validateBoardName as validateBoardNameCharacters } from "@/lib/validation";

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | number;
    workspaceId: string | number;
    projectName?: string;
    existingBoards?: any[];
    onSuccess: (boardId: string | number) => void;
}

const BOARD_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Yellow", value: "#EAB308" },
    { name: "Green", value: "#10B981" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Cyan", value: "#06B6D4" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Gray", value: "#6B7280" },
    { name: "Slate", value: "#475569" },
];

export default function CreateBoardModal({ 
    isOpen, 
    onClose, 
    projectId, 
    workspaceId, 
    projectName, 
    existingBoards = [],
    onSuccess 
}: CreateBoardModalProps) {
    const createBoardMutation = useCreateBoard();
    const [name, setName] = useState("");
    const [coverColor, setCoverColor] = useState(BOARD_COLORS[0].value);
    const [nameError, setNameError] = useState("");

    if (!isOpen) return null;

    const validateBoardName = (boardName: string, checkDuplicates: boolean = false) => {
        if (!boardName.trim()) {
            setNameError("");
            return false;
        }

        // Always check for special characters
        const charValidation = validateBoardNameCharacters(boardName);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid board name");
            return false;
        }

        // Only check for duplicates when explicitly requested (on submit)
        if (checkDuplicates) {
            const isDuplicate = existingBoards.some(b => b.name.toLowerCase() === boardName.trim().toLowerCase());
            if (isDuplicate) {
                setNameError("A board with this name already exists in this project.");
                return false;
            }
        }

        setNameError("");
        return true;
    };

    const handleNameChange = (value: string) => {
        setName(value);
        // Validate characters while typing, but don't check duplicates
        if (value.trim()) {
            validateBoardName(value, false);
        } else {
            setNameError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with duplicate check on submit
        if (!validateBoardName(name, true)) {
            return;
        }

        try {
            const board = await createBoardMutation.mutateAsync({
                projectId: String(projectId),
                name: name.trim(),
                color: coverColor,
            });
            
            // Reset form
            setName("");
            setCoverColor(BOARD_COLORS[0].value);
            setNameError("");
            
            onSuccess(board.id);
            onClose();
        } catch (error: any) {
            console.error('Error creating board:', error);
            
            // Check if it's a duplicate name error (409 Conflict)
            if (error?.response?.status === 409 || error?.statusCode === 409) {
                setNameError(error?.response?.data?.message || error?.message || 'A board with this name already exists in this project');
            } else if (error?.response?.status === 400 || error?.statusCode === 400) {
                // Validation error from backend
                const errorMessage = error?.response?.data?.message;
                if (Array.isArray(errorMessage)) {
                    setNameError(errorMessage[0]);
                } else {
                    setNameError(errorMessage || 'Invalid board name');
                }
            }
            // Toast error is already shown by the mutation's onError
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-sm shadow-md border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Create New Board</h3>
                            {projectName && (
                                <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 border border-purple-200 rounded-md">
                                    <FolderKanban className="w-3 h-3 text-purple-600" />
                                    <span className="text-[10px] font-semibold text-purple-900">
                                        Project: <span className="text-purple-600">{projectName}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                            <X className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-3 space-y-2">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Board Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Q1 Roadmap"
                            className={`w-full px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-xs ${
                                nameError 
                                    ? "border-red-300 focus:ring-red-500" 
                                    : "border-gray-200 focus:ring-blue-500"
                            }`}
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                        />
                        {nameError ? (
                            <p className="mt-0.5 text-[10px] text-red-600 font-medium">
                                {nameError}
                            </p>
                        ) : (
                            <p className="mt-0.5 text-[10px] text-gray-500">
                                We&apos;ll add Backlog, In Progress, In Review, and Done columns.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Board Color</label>
                        <div className="grid grid-cols-6 gap-1">
                            {BOARD_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setCoverColor(color.value)}
                                    className="relative w-full aspect-square rounded transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {coverColor === color.value && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white drop-shadow-lg" strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-1 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-2 py-1.5 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-[10px]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createBoardMutation.isPending || !name.trim() || !!nameError}
                            className="flex-1 px-2 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-[10px]"
                        >
                            {createBoardMutation.isPending ? "Creating..." : "Create Board"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
