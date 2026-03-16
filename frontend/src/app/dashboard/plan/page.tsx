"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/lib/toast";
import { markOnboardingComplete } from "@/components/auth/AuthGuard";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UpgradeModal from "@/components/workspace/UpgradeModal";
import { PlanSelectionStep } from "@/components/onboarding";

const PLANS = [
    {
        name: "Free",
        price: "0",
        description: "Perfect for individuals and small side projects.",
        features: ["Up to 3 boards", "5 members per board", "Basic task tracking"],
        popular: false,
    },
    {
        name: "Pro",
        price: "12",
        description: "For growing teams that need more control.",
        features: [
            "Unlimited boards",
            "Advanced analytics",
            "Premium integrations",
            "Priority support",
        ],
        popular: true,
    },
];

export default function DashboardPlanPage() {
    const router = useRouter();
    const { setActiveWorkspace } = useWorkspaceStore();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    const [workspaceLogo, setWorkspaceLogo] = useState<string | undefined>(undefined);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    const createWorkspaceMutation = useCreateWorkspace();

    // Cleanup old pending workspaces and load current one
    useEffect(() => {
        // Get pending workspace details from previous step
        const pendingWorkspace = localStorage.getItem("pendingWorkspace");
        if (pendingWorkspace) {
            try {
                const data = JSON.parse(pendingWorkspace);
                
                // Check if it's expired (older than 1 hour)
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                if (data.timestamp && data.timestamp < oneHourAgo) {
                    localStorage.removeItem("pendingWorkspace");
                    showToast.error("Workspace session expired. Please start over.");
                    router.replace("/dashboard/workspace");
                    return;
                }
                
                setWorkspaceName(data.name || "Your Workspace");
                setWorkspaceLogo(data.logo);
            } catch (error) {
                console.error("Error parsing pending workspace:", error);
                localStorage.removeItem("pendingWorkspace");
                showToast.error("Invalid workspace data. Please start over.");
                router.replace("/dashboard/workspace");
            }
        } else {
            // Redirect back if no pending workspace
            showToast.error("No workspace details found. Please start over.");
            router.replace("/dashboard/workspace");
        }
    }, []);

    // Prevent leaving during workspace creation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (createWorkspaceMutation.isPending || isProcessing) {
                e.preventDefault();
                e.returnValue = 'Workspace creation in progress. Are you sure you want to leave?';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [createWorkspaceMutation.isPending, isProcessing]);

    const handlePlanSelect = async (planName: string) => {
        // Prevent duplicate clicks
        if (isProcessing || createWorkspaceMutation.isPending) {
            console.log('Already processing, ignoring click');
            return;
        }
        
        setSelectedPlan(planName);
        setIsProcessing(true);
        
        try {
            // For Pro plan: Don't create workspace yet, open payment modal first
            if (planName === "Pro") {
                console.log('Pro plan selected - opening payment modal');
                setIsUpgradeModalOpen(true);
                setIsProcessing(false);
                return;
            }
            
            // For Free plan: Create workspace immediately
            console.log('=== Creating Free Workspace ===');
            
            const pendingWorkspace = localStorage.getItem("pendingWorkspace");
            if (!pendingWorkspace) {
                showToast.error("No workspace details found. Please start over.");
                router.push("/dashboard/workspace");
                setIsProcessing(false);
                return;
            }

            const data = JSON.parse(pendingWorkspace);
            
            const workspace = await createWorkspaceMutation.mutateAsync({
                name: data.name,
                logo: data.logo,
                description: `Free plan workspace`,
                subscription: "free",
            });

            console.log('Workspace created:', workspace);
            
            // Set active workspace in store
            const activeWs = { 
                id: workspace.id, 
                name: workspace.name,
                icon: workspace.logo,
                plan: "free",
                createdBy: workspace.ownerId,
                ownerId: workspace.ownerId,
                role: 'owner', // User is the owner of their created workspace
                createdAt: workspace.createdAt,
            };
            
            setActiveWorkspace(activeWs);
            
            // Save workspace to localStorage
            if (typeof window !== "undefined") {
                const workspaces = JSON.parse(localStorage.getItem("workspaces") || "[]");
                const workspaceToSave = {
                    id: workspace.id,
                    name: workspace.name,
                    description: workspace.description,
                    createdBy: workspace.ownerId,
                    ownerId: workspace.ownerId,
                    role: 'owner',
                    plan: "free",
                    icon: workspace.logo,
                    createdAt: workspace.createdAt,
                };
                workspaces.push(workspaceToSave);
                localStorage.setItem("workspaces", JSON.stringify(workspaces));
                localStorage.setItem("activeWorkspace", String(workspace.id));
            }
            
            markOnboardingComplete();
            showToast.success("Workspace created successfully!");
            localStorage.removeItem("pendingWorkspace");
            
            // Redirect to dashboard
            router.replace("/dashboard");
        } catch (error: any) {
            console.error('Error creating workspace:', error);
            showToast.error(error?.message || "Failed to create workspace");
            setSelectedPlan(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpgradeConfirm = async () => {
        // User confirmed they want Pro plan
        // DON'T create workspace yet - just redirect to payment
        // Workspace will be created AFTER successful payment
        console.log('New Pro workspace - redirecting to payment WITHOUT creating workspace');
        
        const pendingWorkspace = localStorage.getItem("pendingWorkspace");
        if (!pendingWorkspace) {
            showToast.error("No workspace details found. Please start over.");
            router.push("/dashboard/workspace");
            return;
        }

        const data = JSON.parse(pendingWorkspace);
        
        // Store workspace details in localStorage (not sessionStorage) for creation after payment
        // This persists even if user opens payment in new tab
        if (typeof window !== "undefined") {
            const pendingProWorkspace = {
                name: data.name,
                logo: data.logo,
                plan: 'pro',
                timestamp: Date.now(),
            };
            localStorage.setItem('pendingProWorkspace', JSON.stringify(pendingProWorkspace));
        }
        
        setIsUpgradeModalOpen(false);
        
        // Redirect to payment without workspace ID
        await redirectToStripeWithoutWorkspace();
    };
    
    const redirectToStripeWithoutWorkspace = async () => {
        try {
            setIsRedirecting(true);
            console.log('=== Redirecting to Payment (No Workspace Yet) ===');
            
            // Get token from auth store
            const token = useAuthStore.getState().token;
            if (!token) {
                console.error('No authentication token found');
                throw new Error('You are not logged in. Please log in and try again.');
            }
            
            const response = await fetch(`/api/v1/stripe/create-checkout-session-pending`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workspaceName: workspaceName,
                    workspaceLogo: workspaceLogo || undefined,
                    plan: 'pro',
                    billingCycle: 'annual',
                    returnUrl: '/dashboard',
                }),
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Response error:', errorData);
                
                if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }
                
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('=== Checkout Session Response ===');
            console.log('Full response:', JSON.stringify(data, null, 2));
            
            if (data.success && data.data && data.data.url) {
                console.log('✅ Valid response - Redirecting to:', data.data.url);
                localStorage.removeItem("pendingWorkspace");
                window.location.href = data.data.url;
            } else {
                console.error('❌ Invalid response format');
                throw new Error('No checkout URL received from server');
            }
        } catch (error: any) {
            console.error('Error creating Stripe checkout:', error);
            showToast.error(error?.message || 'Payment system error. Please try again.');
            setIsUpgradeModalOpen(true); // Reopen modal
            setIsRedirecting(false);
            setSelectedPlan(null); // Allow user to select again
        }
    };

    const handleUpgradeClose = () => {
        // User closed payment modal without completing payment
        setIsUpgradeModalOpen(false);
        setSelectedPlan(null); // Clear selected plan so user can choose again
        setIsProcessing(false); // Reset processing state
        showToast.info('Payment cancelled. Please select a plan to continue.');
    };

    const handleBack = () => {
        if (isProcessing || createWorkspaceMutation.isPending) {
            showToast.warning('Please wait for workspace creation to complete');
            return;
        }
        router.replace("/dashboard/workspace");
    };

    if (!workspaceName) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
                <div className="w-full max-w-5xl">
                    <PlanSelectionStep
                        workspaceName={workspaceName}
                        selectedPlan={selectedPlan}
                        isCreatingWorkspace={createWorkspaceMutation.isPending || isProcessing}
                        plans={PLANS}
                        onSelectPlan={handlePlanSelect}
                        onBack={handleBack}
                    />
                </div>
            </div>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={handleUpgradeClose}
                onSuccess={() => {
                    // This is called after modal closes successfully
                    // For new workspaces, we don't need to do anything here
                    // The payment flow will handle everything
                    setIsUpgradeModalOpen(false);
                }}
                onUpgrade={handleUpgradeConfirm}
                isOnboarding={false}
                workspaceName={workspaceName}
            />

            {/* Loading Overlay for Workspace Creation */}
            {(createWorkspaceMutation.isPending || isProcessing || isRedirecting) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-900 text-center">
                            {isRedirecting 
                                ? 'Redirecting to payment...' 
                                : 'Creating your workspace...'}
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Please don't close this window
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
