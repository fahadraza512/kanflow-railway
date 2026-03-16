"use client";

import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useCreateProject as useCreateProjectAPI } from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { validateProjectName as validateProjectNameCharacters } from "@/lib/validation";
import ProjectModalHeader from "./ProjectModalHeader";
import ProjectNameInput from "./ProjectNameInput";
import ProjectDescriptionInput from "./ProjectDescriptionInput";
import ProjectColorPicker from "./ProjectColorPicker";
import ProjectModalActions from "./ProjectModalActions";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (projectId: string | number) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
    const { activeWorkspace } = useWorkspaceStore();
    const createProjectMutation = useCreateProjectAPI();
    
    const [mounted, setMounted] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coverColor, setCoverColor] = useState("#3B82F6");
    const [nameError, setNameError] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeWorkspaceId = activeWorkspace?.id || null;
    const workspaceName = activeWorkspace?.name || "";

    const validateProjectName = (projectName: string, checkDuplicates: boolean = false) => {
        if (!projectName.trim()) {
            setNameError("");
            return false;
        }

        // Always check for invalid characters while typing
        const charValidation = validateProjectNameCharacters(projectName);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid project name");
            return false;
        }

        // Only check for duplicates when explicitly requested (on submit)
        if (checkDuplicates) {
            // Duplicate check will be done by backend on submit
            // Frontend doesn't have all projects loaded, so we skip this check
        }

        setNameError("");
        return true;
    };

    const handleNameChange = (value: string) => {
        setName(value);
        // Validate characters while typing, but don't check duplicates
        if (value.trim()) {
            validateProjectName(value, false);
        } else {
            setNameError("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!activeWorkspaceId) {
            alert("No active workspace found. Please select a workspace first.");
            return;
        }

        // Validate with duplicate check on submit
        if (!validateProjectName(name, true)) {
            return;
        }

        try {
            const project = await createProjectMutation.mutateAsync({
                workspaceId: activeWorkspaceId,
                name: name.trim(),
                description: description.trim(),
                color: coverColor,
            });
            
            resetForm();
            onSuccess(project.id);
            onClose();
        } catch (error: any) {
            console.error('Error creating project:', error);
            
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

    const resetForm = () => {
        setName("");
        setDescription("");
        setCoverColor("#3B82F6");
        setNameError("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen || !mounted) return null;

    const isDisabled = createProjectMutation.isPending || !name.trim() || !activeWorkspaceId || !!nameError;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md shadow-md">
                <ProjectModalHeader workspaceName={workspaceName} onClose={handleClose} />

                <form onSubmit={handleSubmit} className="px-4 py-3">
                    <div className="space-y-3">
                        <ProjectNameInput 
                            value={name}
                            error={nameError}
                            onChange={handleNameChange}
                        />
                        <ProjectDescriptionInput 
                            value={description}
                            onChange={setDescription}
                        />
                        <ProjectColorPicker 
                            selectedColor={coverColor}
                            onColorChange={setCoverColor}
                        />
                    </div>

                    <ProjectModalActions 
                        isSubmitting={createProjectMutation.isPending}
                        isDisabled={isDisabled}
                        onCancel={handleClose}
                    />
                </form>
            </div>
        </div>,
        document.body
    );
}
