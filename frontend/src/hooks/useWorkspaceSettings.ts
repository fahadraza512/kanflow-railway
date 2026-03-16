import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from "@/hooks/api";
import { validateWorkspaceName as validateWorkspaceNameChars } from "@/lib/validation";
import { exportWorkspaceToPDF } from "@/lib/pdfExport";
import { showToast } from "@/lib/toast";

export function useWorkspaceSettings() {
    const router = useRouter();
    const { activeWorkspace } = useWorkspaceStore();
    const { data: currentWorkspace } = useWorkspace(activeWorkspace?.id || null);
    const updateWorkspaceMutation = useUpdateWorkspace();
    const deleteWorkspaceMutation = useDeleteWorkspace();
    
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        website: "",
    });
    const [workspaceIcon, setWorkspaceIcon] = useState<string | null>(null);
    const [nameError, setNameError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [isExportingJSON, setIsExportingJSON] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (currentWorkspace) {
            setFormData({
                name: currentWorkspace.name || "",
                description: currentWorkspace.description || "",
                location: "",
                website: "",
            });
            setWorkspaceIcon(currentWorkspace.logo || null);
        }
    }, [currentWorkspace]);

    const validateWorkspaceName = (name: string) => {
        if (!name.trim() || !currentWorkspace) {
            setNameError("");
            return false;
        }

        const charValidation = validateWorkspaceNameChars(name);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid workspace name");
            return false;
        }

        // TODO: Fetch all workspaces and check for duplicates
        // For now, skip duplicate check since we need API call
        
        setNameError("");
        return true;
    };

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const updateName = (name: string) => {
        updateFormData({ name });
        if (name.trim()) {
            validateWorkspaceName(name);
        } else {
            setNameError("");
        }
    };

    const uploadIcon = async (file: File) => {
        if (!currentWorkspace) return;
        
        if (file.size > 2 * 1024 * 1024) {
            showToast.error("Image size should be less than 2MB");
            return;
        }

        if (!file.type.startsWith('image/')) {
            showToast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result as string;
            setWorkspaceIcon(base64String);
            
            try {
                await updateWorkspaceMutation.mutateAsync({
                    id: currentWorkspace.id,
                    data: { logo: base64String }
                });
            } catch (error) {
                console.error('Error uploading icon:', error);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeIcon = async () => {
        if (!currentWorkspace) return;
        
        if (confirm("Are you sure you want to remove the workspace icon?")) {
            setWorkspaceIcon(null);
            try {
                await updateWorkspaceMutation.mutateAsync({
                    id: currentWorkspace.id,
                    data: { logo: null }
                });
            } catch (error) {
                console.error('Error removing icon:', error);
            }
        }
    };

    const saveWorkspace = async () => {
        if (!currentWorkspace) return;
        
        if (!validateWorkspaceName(formData.name)) {
            return;
        }
        
        setIsSaving(true);
        try {
            await updateWorkspaceMutation.mutateAsync({
                id: currentWorkspace.id,
                data: {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                }
            });
        } catch (error) {
            console.error('Error saving workspace:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const exportData = () => {
        setIsExportingJSON(true);
        
        setTimeout(() => {
            const workspaceData = {
                workspace: formData,
                exportDate: new Date().toISOString(),
                projects: [],
                boards: [],
                tasks: [],
                members: [],
                comments: [],
                activityLogs: []
            };
            
            const dataStr = JSON.stringify(workspaceData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `workspace-export-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setIsExportingJSON(false);
        }, 1500);
    };

    const exportDataAsPDF = () => {
        if (!currentWorkspace) return;
        
        setIsExportingPDF(true);
        
        setTimeout(() => {
            try {
                exportWorkspaceToPDF(currentWorkspace);
            } catch (error) {
                console.error("PDF export failed:", error);
                alert("Failed to export PDF. Please try again.");
            }
            setIsExportingPDF(false);
        }, 500);
    };

    const deleteCurrentWorkspace = async () => {
        if (!currentWorkspace) return;

        const confirmMessage = `Are you sure you want to delete "${currentWorkspace.name}"?\n\nThis will permanently delete:\n• All projects in this workspace\n• All boards and lists\n• All tasks and comments\n• All activity logs\n\nThis action CANNOT be undone!`;
        
        if (!confirm(confirmMessage)) return;

        const doubleConfirm = prompt(`Type "${currentWorkspace.name}" to confirm deletion:`);
        if (doubleConfirm !== currentWorkspace.name) {
            showToast.error("Workspace name doesn't match. Deletion cancelled.");
            return;
        }

        setIsDeleting(true);
        
        try {
            await deleteWorkspaceMutation.mutateAsync(currentWorkspace.id);
            router.push("/dashboard");
        } catch (error) {
            console.error('Error deleting workspace:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        currentWorkspace,
        formData,
        workspaceIcon,
        nameError,
        isSaving,
        isExportingPDF,
        isExportingJSON,
        isDeleting,
        updateName,
        updateFormData,
        uploadIcon,
        removeIcon,
        saveWorkspace,
        exportData,
        exportDataAsPDF,
        deleteCurrentWorkspace
    };
}
