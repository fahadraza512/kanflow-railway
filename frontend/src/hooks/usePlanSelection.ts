import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function usePlanSelection() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [workspaceData, setWorkspaceData] = useState<any>(null);
    const [workspaceCreated, setWorkspaceCreated] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("dashboardWorkspaceFlow");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setWorkspaceData(data);
            } catch (error) {
                console.error("Error loading dashboard workspace flow:", error);
                router.push("/dashboard/workspace");
            }
        } else {
            router.push("/dashboard/workspace");
        }
    }, [router]);

    const clearWorkspaceFlow = () => {
        localStorage.removeItem("dashboardWorkspaceFlow");
    };

    const createWorkspaceAndComplete = async (plan: "free" | "pro") => {
        if (!workspaceData || !user || isCreatingWorkspace || workspaceCreated) return;

        setIsCreatingWorkspace(true);

        try {
            const now = new Date();
            const newWorkspace: any = {
                id: workspaceData.workspaceId,
                name: workspaceData.workspaceName,
                icon: workspaceData.avatarPreview || undefined,
                createdBy: user.id,
                plan: plan,
                members: [user.id],
                createdAt: now.toISOString()
            };

            if (plan === "pro") {
                const endDate = new Date(now);
                endDate.setMonth(endDate.getMonth() + 1);
                
                newWorkspace.subscriptionStatus = "active";
                newWorkspace.subscriptionStartDate = now.toISOString();
                newWorkspace.subscriptionEndDate = endDate.toISOString();
                newWorkspace.billingCycle = "monthly";
            }

            const storage = await import("@/lib/storage");
            storage.saveWorkspace(newWorkspace);
            storage.setActiveWorkspace(newWorkspace.id);
            
            setWorkspaceCreated(true);
            clearWorkspaceFlow();
            window.dispatchEvent(new Event('local-storage-change'));
        } catch (error) {
            console.error("Error creating workspace:", error);
        } finally {
            setIsCreatingWorkspace(false);
        }
    };

    const handleFinish = async (planName: string) => {
        if (!workspaceData || isCreatingWorkspace) return;

        try {
            if (planName === "Free") {
                await createWorkspaceAndComplete("free");
                setTimeout(() => router.push("/dashboard"), 100);
            } else if (planName === "Pro") {
                await createWorkspaceAndComplete("free");
                setSelectedPlan(planName);
                setIsUpgradeModalOpen(true);
            } else if (planName === "Enterprise") {
                // Do NOT create workspace yet - only open the modal
                // Workspace will be created when user submits the Contact Sales form
                setSelectedPlan(planName);
                setIsContactSalesModalOpen(true);
            }
        } catch (error) {
            console.error("Error in handleFinish:", error);
        }
    };

    const handleUpgradeSuccess = () => {
        setIsUpgradeModalOpen(false);
        setTimeout(() => router.push("/dashboard"), 100);
    };

    const handleContactSalesSuccess = () => {
        // Create workspace with Free plan when form is submitted
        // Only if not already created
        if (!workspaceCreated) {
            createWorkspaceAndComplete("free").then(() => {
                setIsContactSalesModalOpen(false);
                setTimeout(() => router.push("/dashboard"), 100);
            });
        } else {
            setIsContactSalesModalOpen(false);
            setTimeout(() => router.push("/dashboard"), 100);
        }
    };

    const handleBack = () => {
        router.push("/dashboard/workspace");
    };

    return {
        selectedPlan,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isContactSalesModalOpen,
        setIsContactSalesModalOpen,
        isCreatingWorkspace,
        workspaceData,
        handleFinish,
        handleUpgradeSuccess,
        handleContactSalesSuccess,
        handleBack
    };
}
