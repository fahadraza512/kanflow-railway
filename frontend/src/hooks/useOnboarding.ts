import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { completeUserOnboarding } from "@/lib/auth";
import { markOnboardingComplete, markOnboardingStarted } from "@/components/auth/AuthGuard";
import { validateWorkspaceName } from "@/lib/validation";

export type Role = "ADMIN" | "PROJECT_MANAGER" | "MEMBER" | "VIEWER";

interface OnboardingState {
    currentStep: number;
    workspaceName: string;
    avatarPreview: string | null;
    workspaceId: string | null;
    selectedPlan: string | null;
    workspaceNameError: string;
    isCreatingWorkspace: boolean;
}

export function useOnboarding() {
    const router = useRouter();
    const { setActiveWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();

    const [state, setState] = useState<OnboardingState>({
        currentStep: 0,
        workspaceName: "",
        avatarPreview: null,
        workspaceId: null,
        selectedPlan: null,
        workspaceNameError: "",
        isCreatingWorkspace: false
    });

    // Load saved state on mount
    useEffect(() => {
        markOnboardingStarted();
        
        if (typeof window === "undefined") return;
        
        const saved = localStorage.getItem("onboardingState");
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                setState(prev => ({ ...prev, ...savedState }));
                
                if (savedState.workspaceId) {
                    setActiveWorkspace({ 
                        id: savedState.workspaceId, 
                        name: savedState.workspaceName || "Workspace" 
                    });
                }
            } catch (error) {
                console.error("Error loading onboarding state:", error);
            }
        }
    }, [setActiveWorkspace]);

    // Save state whenever it changes
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        const stateToSave = {
            currentStep: state.currentStep,
            workspaceName: state.workspaceName,
            avatarPreview: state.avatarPreview,
            workspaceId: state.workspaceId,
            selectedPlan: state.selectedPlan,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem("onboardingState", JSON.stringify(stateToSave));
    }, [state.currentStep, state.workspaceName, state.avatarPreview, state.workspaceId, state.selectedPlan]);

    const clearOnboardingState = () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("onboardingState");
    };

    const setWorkspaceName = (name: string) => {
        setState(prev => ({ ...prev, workspaceName: name, workspaceNameError: "" }));
    };

    const setAvatarPreview = (preview: string | null) => {
        setState(prev => ({ ...prev, avatarPreview: preview }));
    };

    const validateStep = (step: number): boolean => {
        if (step === 0) {
            if (!state.workspaceName.trim()) {
                setState(prev => ({ ...prev, workspaceNameError: "Workspace name is required" }));
                return false;
            }
            
            const validation = validateWorkspaceName(state.workspaceName);
            if (!validation.isValid) {
                setState(prev => ({ ...prev, workspaceNameError: validation.error || "Invalid workspace name" }));
                return false;
            }
            
            if (!state.workspaceId) {
                const tempWorkspaceId = Date.now().toString();
                setState(prev => ({ ...prev, workspaceId: tempWorkspaceId }));
            }
        }
        
        return true;
    };

    const nextStep = () => {
        if (validateStep(state.currentStep)) {
            setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
        }
    };

    const prevStep = () => {
        setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
    };

    const skipStep = () => {
        if (state.currentStep === 0 && !state.workspaceId && state.workspaceName.trim()) {
            const tempWorkspaceId = Date.now().toString();
            setState(prev => ({ ...prev, workspaceId: tempWorkspaceId }));
        }
        
        setState(prev => ({ 
            ...prev, 
            currentStep: prev.currentStep + 1
        }));
    };

    const createWorkspaceAndComplete = async (plan: "free" | "pro") => {
        if (state.isCreatingWorkspace) return;
        
        setState(prev => ({ ...prev, isCreatingWorkspace: true }));
        
        try {
            const storage = await import("@/lib/storage");
            const existingWorkspaces = storage.getWorkspaces();
            const workspaceExists = existingWorkspaces.some(w => w.id === state.workspaceId);
            
            if (workspaceExists) {
                if (user?.email) completeUserOnboarding(user.email);
                markOnboardingComplete();
                clearOnboardingState();
                setState(prev => ({ ...prev, isCreatingWorkspace: false }));
                return;
            }
            
            const now = new Date();
            const newWorkspace: any = {
                id: state.workspaceId!,
                name: state.workspaceName.trim(),
                icon: state.avatarPreview || undefined,
                createdBy: user?.id || "1",
                plan: plan,
                members: [user?.id || "1"],
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

            storage.saveWorkspace(newWorkspace);
            storage.setActiveWorkspace(newWorkspace.id);
            setActiveWorkspace({ id: newWorkspace.id, name: state.workspaceName.trim() });

            if (user?.email) completeUserOnboarding(user.email);
            markOnboardingComplete();
            clearOnboardingState();
            
            window.dispatchEvent(new Event('local-storage-change'));
        } catch (error) {
            console.error("Error creating workspace:", error);
        } finally {
            setState(prev => ({ ...prev, isCreatingWorkspace: false }));
        }
    };

    const handleFinish = async (planName: string) => {
        if (!state.workspaceId || state.isCreatingWorkspace) return;
        
        setState(prev => ({ ...prev, selectedPlan: planName }));
        
        if (planName === "Free") {
            await createWorkspaceAndComplete("free");
            setTimeout(() => router.push("/dashboard"), 100);
        } else if (planName === "Pro") {
            // Create workspace with Free plan first, then open upgrade modal
            await createWorkspaceAndComplete("free");
        }
        
        return planName;
    };

    const handleUpgradeSuccess = async () => {
        // Workspace already created in handleFinish, just complete onboarding
        if (user?.email) completeUserOnboarding(user.email);
        markOnboardingComplete();
        clearOnboardingState();
        setTimeout(() => router.push("/dashboard"), 100);
    };

    const handleContactSalesSuccess = async () => {
        await createWorkspaceAndComplete("free");
        router.push("/dashboard");
    };

    return {
        ...state,
        setWorkspaceName,
        setAvatarPreview,
        nextStep,
        prevStep,
        skipStep,
        handleFinish,
        handleUpgradeSuccess,
        handleContactSalesSuccess,
        user
    };
}
