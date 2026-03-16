import { useState, useEffect } from "react";
import { getActiveWorkspace, getWorkspaceById } from "@/lib/storage";

interface ContactSalesFormData {
    fullName: string;
    workEmail: string;
    companyName: string;
    teamSize: string;
    message: string;
}

interface UseContactSalesProps {
    isOpen: boolean;
    workspaceData?: {
        workspaceId: string;
        workspaceName: string;
    } | null;
    onSuccess: () => void;
}

export function useContactSales({ isOpen, workspaceData, onSuccess }: UseContactSalesProps) {
    const [formData, setFormData] = useState<ContactSalesFormData>({
        fullName: "",
        workEmail: "",
        companyName: "",
        teamSize: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [workspaceId, setWorkspaceId] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            if (workspaceData) {
                setWorkspaceName(workspaceData.workspaceName);
                setWorkspaceId(workspaceData.workspaceId);
            } else {
                const activeWsId = getActiveWorkspace();
                if (activeWsId) {
                    const workspace = getWorkspaceById(activeWsId);
                    if (workspace) {
                        setWorkspaceName(workspace.name);
                        setWorkspaceId(workspace.id.toString());
                    }
                }
            }
        } else {
            setWorkspaceName("");
            setWorkspaceId("");
        }
    }, [isOpen, workspaceData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        setTimeout(() => {
            console.log("Enterprise contact request:", {
                ...formData,
                workspaceName,
                workspaceId
            });
            
            setIsSubmitting(false);
            resetForm();
            onSuccess();
        }, 1500);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            workEmail: "",
            companyName: "",
            teamSize: "",
            message: ""
        });
    };

    const isFormValid = formData.fullName && formData.workEmail && formData.companyName && formData.teamSize;

    return {
        formData,
        isSubmitting,
        workspaceName,
        workspaceId,
        isFormValid,
        handleSubmit,
        handleChange
    };
}
