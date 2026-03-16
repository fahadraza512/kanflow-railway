import { useState, useEffect } from "react";
import { saveProject, Project, getCurrentUser, getProjectsByWorkspace } from "@/lib/storage";
import { useAuthStore } from "@/store/useAuthStore";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { validateProjectName as validateProjectNameCharacters } from "@/lib/validation";

export function useCreateProject(isOpen: boolean) {
    const { user: authUser } = useAuthStore();
    const { activeWorkspace } = useWorkspaceStore();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [coverColor, setCoverColor] = useState("#3B82F6");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeWorkspaceId = activeWorkspace?.id || null;
    const workspaceName = activeWorkspace?.name || "";

    const validateProjectName = (projectName: string) => {
        if (!projectName.trim() || !activeWorkspaceId) {
            setNameError("");
            return false;
        }

        const charValidation = validateProjectNameCharacters(projectName);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid project name");
            return false;
        }

        const existingProjects = getProjectsByWorkspace(activeWorkspaceId);
        const isDuplicate = existingProjects.some(p => p.name.toLowerCase() === projectName.trim().toLowerCase());

        if (isDuplicate) {
            setNameError("This name already exists. Please choose a different name.");
            return false;
        }

        setNameError("");
        return true;
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (value.trim() && activeWorkspaceId) {
            validateProjectName(value);
        } else {
            setNameError("");
        }
    };

    const handleSubmit = (onSuccess: (projectId: string | number) => void, onClose: () => void) => {
        if (!activeWorkspaceId) {
            alert("No active workspace found. Please select a workspace first.");
            return;
        }

        if (!validateProjectName(name)) {
            return;
        }

        let currentUser = getCurrentUser();
        if (!currentUser && authUser) {
            currentUser = {
                id: authUser.id,
                name: authUser.name,
                email: authUser.email,
                role: "ADMIN"
            };
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }

        if (!currentUser) {
            alert("User not found. Please log in again.");
            return;
        }

        setIsSubmitting(true);
        
        const newProject: Project = {
            id: Date.now().toString(),
            workspaceId: activeWorkspaceId,
            name: name.trim(),
            description: description.trim(),
            coverColor: coverColor,
            archived: false,
            members: [currentUser.id],
            createdBy: currentUser.id,
            createdAt: new Date().toISOString()
        };
        
        saveProject(newProject);

        setIsSubmitting(false);
        setName("");
        setDescription("");
        setNameError("");
        onSuccess(newProject.id);
        onClose();
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setNameError("");
    };

    return {
        mounted,
        activeWorkspaceId,
        workspaceName,
        name,
        description,
        coverColor,
        isSubmitting,
        nameError,
        handleNameChange,
        setDescription,
        setCoverColor,
        handleSubmit,
        resetForm
    };
}
