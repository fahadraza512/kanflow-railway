import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getWorkspaces } from "@/lib/storage";
import { validateWorkspaceName as validateWorkspaceNameChars } from "@/lib/validation";

export function useDashboardWorkspace() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [workspaceName, setWorkspaceName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameError, setNameError] = useState("");

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const validateWorkspaceName = (name: string) => {
        if (!name.trim()) {
            setNameError("");
            return false;
        }

        if (!user) {
            setNameError("");
            return true;
        }

        const charValidation = validateWorkspaceNameChars(name);
        if (!charValidation.isValid) {
            setNameError(charValidation.error || "Invalid workspace name");
            return false;
        }

        const existingWorkspaces = getWorkspaces();
        const userWorkspaces = existingWorkspaces.filter(w => String(w.createdBy) === String(user.id));
        const isDuplicate = userWorkspaces.some(w => w.name.toLowerCase() === name.trim().toLowerCase());

        if (isDuplicate) {
            setNameError("You have already created a workspace with this name. Please choose a different name.");
            return false;
        }

        setNameError("");
        return true;
    };

    const handleWorkspaceNameChange = (value: string) => {
        setWorkspaceName(value);
        if (value.trim()) {
            validateWorkspaceName(value);
        } else {
            setNameError("");
        }
    };

    const handleSubmit = () => {
        if (!workspaceName.trim() || !user) return;

        if (!validateWorkspaceName(workspaceName)) {
            return;
        }

        setIsSubmitting(true);

        const workspaceFlowData = {
            workspaceId: Date.now().toString(),
            workspaceName: workspaceName.trim(),
            avatarPreview: avatarPreview,
            currentStep: 1,
            lastUpdated: new Date().toISOString()
        };

        console.log("Saving dashboard workspace flow data:", workspaceFlowData);
        localStorage.setItem("dashboardWorkspaceFlow", JSON.stringify(workspaceFlowData));

        router.push("/dashboard/plan");
    };

    const handleCancel = () => {
        router.push("/dashboard");
    };

    return {
        workspaceName,
        avatarPreview,
        isSubmitting,
        nameError,
        handleAvatarUpload,
        handleWorkspaceNameChange,
        handleSubmit,
        handleCancel
    };
}
