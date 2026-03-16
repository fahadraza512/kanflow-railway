"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Project } from "@/types/api.types";
import { useUpdateProject, useProjects } from "@/hooks/api";
import { validateProjectName, isDuplicateName } from "@/lib/validation";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    project: Project;
}

const COVER_COLORS = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#A855F7" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Red", value: "#EF4444" },
    { name: "Orange", value: "#F97316" },
    { name: "Pink", value: "#EC4899" },
];

export default function EditProjectModal({ isOpen, onClose, onSuccess, project }: EditProjectModalProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [coverColor, setCoverColor] = useState(project.color || COVER_COLORS[0].value);
    const [nameError, setNameError] = useState("");
    
    const updateProjectMutation = useUpdateProject();
    const { data: projects = [] } = useProjects(project.workspaceId);

    useEffect(() => {
        if (isOpen) {
            setName(project.name);
            setDescription(project.description || "");
            setCoverColor(project.color || COVER_COLORS[0].value);
            setNameError("");
        }
    }, [isOpen, project]);

    if (!isOpen) return null;

    const validateName = (projectName: string, checkDuplicates: boolean = false) => {
        if (!projectName.trim()) {
            setNameError("");
            return false;
        }

        // Always check for special characters
        const charValidation = validateProjectName(projectName);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid project name");
            return false;
        }

        // Only check for duplicates when explicitly requested (on submit)
        if (checkDuplicates) {
            // Check for duplicates (excluding current project)
            if (isDuplicateName(projectName, projects, project.id)) {
                setNameError("A project with this name already exists in this workspace.");
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
            await updateProjectMutation.mutateAsync({
                id: project.id,
                data: {
                    name: name.trim(),
                    description: description.trim(),
                    color: coverColor
                }
            });
            
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating project:', error);
            
            // Check if it's a duplicate name error (409 Conflict)
            if (error?.response?.status === 409 || error?.statusCode === 409) {
                setNameError(error?.response?.data?.message || error?.message || 'A project with this name already exists in this workspace');
            } else if (error?.response?.status === 400 || error?.statusCode === 400) {
                // Validation error from backend
                const errorMessage = error?.response?.data?.message;
                if (Array.isArray(errorMessage)) {
                    setNameError(errorMessage[0]);
                } else {
                    setNameError(errorMessage || 'Invalid project name');
                }
            }
            // Toast error is already shown by the mutation's onError
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-md border border-gray-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Edit Project</h3>
                            <p className="text-xs text-gray-500 mt-0.5">Update project details</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Q1 Marketing Campaign"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-xs text-gray-900 placeholder-gray-400 ${
                                nameError 
                                    ? "border-red-300 focus:ring-red-500" 
                                    : "border-gray-200 focus:ring-blue-500"
                            }`}
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            autoFocus
                        />
                        {nameError && (
                            <p className="mt-1 text-xs text-red-600 font-medium">
                                {nameError}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            placeholder="What is this project about?"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-16 resize-none transition-colors text-xs text-gray-900 placeholder-gray-400"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-900 mb-2">
                            Cover Color
                        </label>
                        <div className="flex gap-2">
                            {COVER_COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => setCoverColor(color.value)}
                                    className={`w-8 h-8 rounded-md transition-all ${
                                        coverColor === color.value
                                            ? "ring-2 ring-offset-1 ring-blue-500"
                                            : "hover:ring-2 hover:ring-offset-1 hover:ring-gray-300"
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="pt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-3 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updateProjectMutation.isPending || !name.trim() || !!nameError}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-xs"
                        >
                            {updateProjectMutation.isPending ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
