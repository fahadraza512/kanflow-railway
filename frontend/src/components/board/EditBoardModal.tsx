"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Board } from "@/types/api.types";
import { useUpdateBoard, useBoards } from "@/hooks/api";
import { validateBoardName, isDuplicateName } from "@/lib/validation";

interface EditBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    board: Board;
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

export default function EditBoardModal({ isOpen, onClose, onSuccess, board }: EditBoardModalProps) {
    const updateBoardMutation = useUpdateBoard();
    const { data: boards = [] } = useBoards(board.projectId);
    
    const [name, setName] = useState(board.name);
    const [color, setColor] = useState(board.color || BOARD_COLORS[0].value);
    const [nameError, setNameError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(board.name);
            setColor(board.color || BOARD_COLORS[0].value);
            setNameError("");
        }
    }, [isOpen, board]);

    if (!isOpen) return null;

    const validateName = (boardName: string, checkDuplicates: boolean = false) => {
        if (!boardName.trim()) {
            setNameError("");
            return false;
        }

        // Always check for special characters
        const charValidation = validateBoardName(boardName);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid board name");
            return false;
        }

        // Only check for duplicates when explicitly requested (on submit)
        if (checkDuplicates) {
            if (isDuplicateName(boardName, boards, board.id)) {
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
            validateName(value, false);
        } else {
            setNameError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate with duplicate check on submit
        if (!validateName(name, true)) {
            return;
        }
        
        try {
            await updateBoardMutation.mutateAsync({
                id: board.id,
                data: {
                    name: name.trim(),
                    color
                }
            });
            
            onSuccess();
        } catch (error: any) {
            console.error('Error updating board:', error);
            
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
            <div className="bg-white rounded-lg w-full max-w-sm shadow-sm border border-gray-200">
                <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-900">Edit Board</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
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
                            autoFocus
                        />
                        {nameError && (
                            <p className="mt-0.5 text-[10px] text-red-600 font-medium">
                                {nameError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-semibold text-gray-700 mb-1">Board Color</label>
                        <div className="grid grid-cols-6 gap-1">
                            {BOARD_COLORS.map((colorOption) => (
                                <button
                                    key={colorOption.value}
                                    type="button"
                                    onClick={() => setColor(colorOption.value)}
                                    className="relative w-full aspect-square rounded transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                                    style={{ backgroundColor: colorOption.value }}
                                    title={colorOption.name}
                                >
                                    {color === colorOption.value && (
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
                            disabled={updateBoardMutation.isPending || !name.trim() || !!nameError}
                            className="flex-1 px-2 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm text-[10px]"
                        >
                            {updateBoardMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
