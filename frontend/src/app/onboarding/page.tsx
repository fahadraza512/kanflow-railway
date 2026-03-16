"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Layout, CreditCard, Rocket, Loader2 } from "lucide-react";
import {
    StepIndicator,
    WorkspaceStep,
    PlanSelectionStep,
    GetStartedStep
} from "@/components/onboarding";
import UpgradeModal from "@/components/workspace/UpgradeModal";
import { useCreateWorkspace, useUpdateWorkspace } from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useAuthStore } from "@/store/useAuthStore";
import { showToast } from "@/lib/toast";
import { validateWorkspaceName } from "@/lib/validation";
import { markOnboardingComplete } from "@/components/auth/AuthGuard";
import { cn } from "@/lib/utils";

const STEPS = [
    { label: "Workspace", icon: Layout },
    { label: "Choose Plan", icon: CreditCard },
    { label: "Get Started", icon: Rocket },
];

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

function OnboardingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { setActiveWorkspace, activeWorkspace } = useWorkspaceStore();
    const { user } = useAuthStore();

    // State
    const [currentStep, setCurrentStep] = useState(0);
    const [workspaceName, setWorkspaceName] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [workspaceNameError, setWorkspaceNameError] = useState("");
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);

    // Mutations
    const createWorkspaceMutation = useCreateWorkspace();
    const updateWorkspaceMutation = useUpdateWorkspace();

    // Check if user has pending invitation - redirect to invitation acceptance instead of onboarding
    // Uses pendingInviteToken as the single source of truth (hasPendingInvitation is not required)
    useEffect(() => {
        if (user?.pendingInviteToken) {
            console.log('User has pending invitation, redirecting to invitation acceptance page');
            router.replace(`/invite/accept?token=${user.pendingInviteToken}`);
        }
    }, [user?.pendingInviteToken, router]);

    // Check if user has already completed onboarding
    useEffect(() => {
        if (user?.onboardingCompleted) {
            console.log('User has completed onboarding, redirecting to dashboard');
            router.push('/dashboard');
        }
    }, [user?.onboardingCompleted, router]);

    // Handle payment cancellation from Stripe/Dummy checkout
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');

        if (paymentStatus === 'cancelled') {
            // Clear the query parameter
            router.replace('/onboarding', { scroll: false });

            // ALWAYS stay on plan selection during onboarding (even if workspace exists)
            // This allows user to try payment again or choose Free plan
            setCurrentStep(1); // Go to plan selection step
            setSelectedPlan(null); // Clear selected plan
            showToast.info('Payment cancelled. Please select a plan to continue.');

        } else if (paymentStatus === 'success') {
            showToast.success('Payment successful! Your workspace has been upgraded to Pro.');

            // Clear the query parameter
            router.replace('/onboarding', { scroll: false });

            // Load workspace data from localStorage if available
            const pendingWorkspaceData = localStorage.getItem('pendingWorkspaceData');
            if (pendingWorkspaceData) {
                try {
                    const workspaceData = JSON.parse(pendingWorkspaceData);
                    
                    // Set active workspace in store
                    setActiveWorkspace({
                        id: workspaceData.id,
                        name: workspaceData.name,
                        description: '',
                        icon: workspaceData.logo,
                        plan: 'pro',
                        createdBy: user?.id || '',
                        ownerId: user?.id || '',
                        role: 'owner',
                        members: [],
                        createdAt: new Date().toISOString(),
                    });
                    
                    // Update workspace name in state
                    setWorkspaceName(workspaceData.name);
                    
                    // Clear the pending data
                    localStorage.removeItem('pendingWorkspaceData');
                } catch (error) {
                    console.error('Failed to load pending workspace data:', error);
                }
            }

            // Set selected plan to Pro and move to Get Started step
            setSelectedPlan('Pro');
            setCurrentStep(2);
        }
    }, [searchParams, router]);

    // Load saved state on mount and cleanup old data
    useEffect(() => {
        if (typeof window === "undefined") return;

        const saved = localStorage.getItem("onboardingState");
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                
                // Check if state is expired (older than 1 hour)
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                if (savedState.timestamp && savedState.timestamp < oneHourAgo) {
                    console.log('Onboarding state expired, cleaning up');
                    localStorage.removeItem("onboardingState");
                    return;
                }
                
                // Load valid state (but NOT workspace ID - that will be validated separately)
                setCurrentStep(savedState.currentStep || 0);
                setWorkspaceName(savedState.workspaceName || "");
                setAvatarPreview(savedState.avatarPreview || null);
                setSelectedPlan(savedState.selectedPlan || null);
                
                // Don't restore workspace from saved state - it might be stale
                // User will need to create a new workspace if they refresh during onboarding
            } catch (error) {
                console.error("Error loading onboarding state:", error);
                localStorage.removeItem("onboardingState");
            }
        }
    }, []);

    // Save state whenever it changes
    useEffect(() => {
        if (typeof window === "undefined") return;

        const stateToSave = {
            currentStep,
            workspaceName,
            avatarPreview,
            selectedPlan,
            timestamp: Date.now(), // Add timestamp for expiry check
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem("onboardingState", JSON.stringify(stateToSave));
    }, [currentStep, workspaceName, avatarPreview, selectedPlan]);

    // Prevent leaving during workspace creation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending || isProcessing) {
                e.preventDefault();
                e.returnValue = 'Workspace creation in progress. Are you sure you want to leave?';
            }
        };
        
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [createWorkspaceMutation.isPending, updateWorkspaceMutation.isPending, isProcessing]);

    const clearOnboardingState = () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("onboardingState");
    };

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 200;
                    const MAX_HEIGHT = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    } else {
                        reject(new Error('Failed to get canvas context'));
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target?.result as string;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast.error('Image is too large. Please use an image smaller than 5MB.');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showToast.error('Please upload an image file.');
                return;
            }

            try {
                setIsCompressing(true);
                const compressedImage = await compressImage(file);
                setAvatarPreview(compressedImage);
                showToast.success('Image uploaded and compressed successfully');
            } catch (error) {
                console.error('Error compressing image:', error);
                showToast.error('Failed to process image. Please try another image.');
            } finally {
                setIsCompressing(false);
            }
        }
    };

    const validateStep = (step: number): boolean => {
        if (step === 0) {
            if (!workspaceName.trim()) {
                setWorkspaceNameError("Workspace name is required");
                return false;
            }

            const validation = validateWorkspaceName(workspaceName);
            if (!validation.isValid) {
                setWorkspaceNameError(validation.error || "Invalid workspace name");
                return false;
            }
        }
        return true;
    };

    const nextStep = async () => {
        if (!validateStep(currentStep)) return;

        if (currentStep === 0) {
            const trimmedName = workspaceName.trim();

            // If a workspace already exists in DB (user went back after plan selection),
            // update its name via API before proceeding
            if (activeWorkspace?.id && trimmedName !== activeWorkspace.name) {
                try {
                    console.log('Updating existing workspace name in DB:', trimmedName);
                    const updatedWorkspace = await updateWorkspaceMutation.mutateAsync({
                        id: activeWorkspace.id,
                        data: { name: trimmedName },
                    });
                    setActiveWorkspace({ ...activeWorkspace, name: updatedWorkspace.name });
                    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
                    showToast.success('Workspace name updated!');
                } catch (error: any) {
                    if (error?.status === 404) {
                        // Workspace was deleted externally - clear stale data and let user continue
                        console.log('Workspace not found in DB, clearing stale data');
                        setActiveWorkspace(null);
                        showToast.info('Previous workspace not found. A new one will be created when you select a plan.');
                    } else {
                        showToast.error(error?.message || 'Failed to update workspace name');
                        return;
                    }
                }
            }

            // No workspace yet — just move forward, name is already in local state
            setCurrentStep(1);
            return;
        }

        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        // When going back to Step 0, load the current workspace name into the input
        if (currentStep === 1 || currentStep === 2) {
            if (activeWorkspace?.name) {
                setWorkspaceName(activeWorkspace.name);
            }
        }
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handlePlanSelect = async (planName: string) => {
        // Prevent duplicate clicks
        if (isProcessing || createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending) {
            console.log('Already processing, ignoring click');
            return;
        }

        setSelectedPlan(planName);
        setIsProcessing(true);

        try {
            // Check if workspace already exists (user went back from Get Started and is changing plan)
            if (activeWorkspace?.id) {
                console.log('Workspace already exists, user is changing plan');
                
                // If user wants to upgrade from Free to Pro
                if (planName === "Pro" && activeWorkspace.plan === "free") {
                    setIsUpgradeModalOpen(true);
                    setIsProcessing(false);
                    return;
                }

                // If user selects same plan or goes back to Free, just proceed to Get Started
                setCurrentStep(2);
                setIsProcessing(false);
                return;
            }

            // No workspace exists yet - this is the first plan selection
            
            // For Pro plan: Don't create workspace yet, open payment modal first
            if (planName === "Pro") {
                console.log('Pro plan selected - opening payment modal (workspace will be created after payment)');
                setIsUpgradeModalOpen(true);
                setIsProcessing(false);
                return;
            }

            // For Free plan: Create workspace immediately and move to Get Started step
            console.log('Free plan selected - creating workspace now');
            const workspace = await createWorkspaceMutation.mutateAsync({
                name: workspaceName.trim(),
                logo: avatarPreview || undefined,
                description: `${planName} plan workspace`,
                subscription: "free",
            });

            console.log('Workspace created:', workspace.id);

            // Set active workspace in store with complete data
            const activeWs = {
                id: workspace.id,
                name: workspace.name,
                description: workspace.description,
                icon: workspace.logo,
                plan: "free" as const,
                createdBy: workspace.ownerId,
                ownerId: workspace.ownerId,
                role: 'owner',
                members: [],
                createdAt: workspace.createdAt,
            };

            setActiveWorkspace(activeWs);
            
            const { addWorkspace } = useWorkspaceStore.getState();
            addWorkspace(activeWs);

            // DO NOT set activeWorkspaceId in auth store yet
            // User must click "Get Started" to complete onboarding

            // Save workspace to localStorage for persistence
            if (typeof window !== "undefined") {
                const workspaces = JSON.parse(localStorage.getItem("workspaces") || "[]");
                const workspaceToSave = {
                    id: workspace.id,
                    name: workspace.name,
                    description: workspace.description,
                    createdBy: workspace.ownerId,
                    ownerId: workspace.ownerId,
                    plan: "free",
                    icon: workspace.logo,
                    createdAt: workspace.createdAt,
                };
                workspaces.push(workspaceToSave);
                localStorage.setItem("workspaces", JSON.stringify(workspaces));
                localStorage.setItem("activeWorkspace", String(workspace.id));
            }

            showToast.success("Workspace created successfully!");

            // Move to Get Started step (step 2) - user MUST click "Get Started" to complete
            setCurrentStep(2);
        } catch (error: any) {
            console.error('Error in handlePlanSelect:', error);
            showToast.error(error?.message || "Failed to create workspace");
            setSelectedPlan(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUpgradeConfirm = async () => {
        // User confirmed they want Pro plan
        setPaymentConfirmed(true);
        setIsUpgradeModalOpen(false);

        // Check if this is an upgrade scenario (workspace already exists)
        if (activeWorkspace?.id) {
            // Workspace exists - this is an upgrade from Free to Pro
            await redirectToStripe(activeWorkspace.id);
        } else {
            // No workspace yet - user selected Pro during onboarding
            // DON'T create workspace yet - just redirect to payment
            // Workspace will be created AFTER successful payment

            // Store workspace details in localStorage (not sessionStorage) for creation after payment
            if (typeof window !== "undefined") {
                const pendingWorkspace = {
                    name: workspaceName.trim(),
                    logo: avatarPreview || undefined,
                    plan: 'pro',
                    timestamp: Date.now(),
                };
                localStorage.setItem('pendingProWorkspace', JSON.stringify(pendingWorkspace));
            }

            // Redirect to payment without workspace ID
            // The dummy checkout will create workspace after successful payment
            await redirectToStripeWithoutWorkspace();
        }
    };

    const redirectToStripe = async (workspaceId: string | number) => {
        try {
            setIsRedirecting(true);
            
            // Get token from auth store
            const token = useAuthStore.getState().token;
            if (!token) {
                throw new Error('You are not logged in. Please log in and try again.');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/stripe/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workspaceId: workspaceId,
                    plan: 'pro',
                    billingCycle: 'annual',
                    returnUrl: '/onboarding',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Handle 401 Unauthorized specifically
                if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }

                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.url) {
                clearOnboardingState();
                window.location.href = data.data.url;
            } else {
                throw new Error('No checkout URL received from server');
            }
        } catch (error: any) {
            showToast.error(error?.message || 'Payment system error. Please try again.');
            setPaymentConfirmed(false);
            setIsUpgradeModalOpen(true); // Reopen modal
            setIsRedirecting(false);
            setSelectedPlan(null); // Allow user to select again
        }
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

            console.log('Token exists:', token ? 'Yes' : 'No');

            // For dummy mode, we need to pass workspace details in the session
            // In real Stripe, we'd create workspace after webhook
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/stripe/create-checkout-session-pending`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    workspaceName: workspaceName.trim(),
                    workspaceLogo: avatarPreview || undefined,
                    plan: 'pro',
                    billingCycle: 'annual',
                    returnUrl: '/onboarding',
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Response error:', errorData);

                // Handle 401 Unauthorized specifically
                if (response.status === 401) {
                    throw new Error('Your session has expired. Please log in again.');
                }

                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('=== Checkout Session Response ===');
            console.log('data.success:', data.success);
            console.log('data.data?.url:', data.data?.url);

            if (data.success && data.data && data.data.url) {
                console.log('✅ Valid response - Redirecting to:', data.data.url);
                clearOnboardingState();
                window.location.href = data.data.url;
            } else {
                console.error('❌ Invalid response format');
                throw new Error('No checkout URL received from server');
            }
        } catch (error: any) {
            console.error('Error creating Stripe checkout:', error);
            showToast.error(error?.message || 'Payment system error. Please try again.');
            setPaymentConfirmed(false);
            setIsUpgradeModalOpen(true); // Reopen modal
            setIsRedirecting(false);
            setSelectedPlan(null); // Allow user to select again
        }
    };

    const handleUpgradeClose = () => {
        // User closed payment modal without completing payment
        setPaymentConfirmed(false);
        setIsUpgradeModalOpen(false);
        setIsProcessing(false); // Reset processing state

        // During onboarding, ALWAYS stay on plan selection page
        // This allows user to try payment again or choose Free plan
        console.log('Payment modal closed - staying on plan selection');
        setSelectedPlan(null); // Clear selected plan so user can choose again
        showToast.info('Payment cancelled. Please select a plan to continue.');
    };

    const handleGetStarted = async () => {
        console.log('=== handleGetStarted called ===');
        console.log('Current step:', currentStep);
        console.log('Selected plan:', selectedPlan);
        console.log('Active workspace:', activeWorkspace);

        // Set activeWorkspaceId in auth store NOW (when user clicks Get Started)
        if (activeWorkspace?.id) {
            const user = useAuthStore.getState().user;
            useAuthStore.setState({
                user: {
                    ...user,
                    activeWorkspaceId: activeWorkspace.id
                }
            });
            console.log('Set activeWorkspaceId:', activeWorkspace.id);
        }

        // Mark onboarding as complete in database and localStorage
        console.log('Marking onboarding as complete...');
        await markOnboardingComplete();

        // Clear onboarding state from localStorage
        console.log('Clearing onboarding state...');
        clearOnboardingState();

        // Redirect to dashboard
        console.log('Redirecting to dashboard...');
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StepIndicator steps={STEPS} currentStep={currentStep} />

            <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
                <div className={cn(
                    "w-full",
                    currentStep === 1 ? "max-w-5xl" : "max-w-lg"
                )}>
                    {currentStep === 0 && (
                        <WorkspaceStep
                            workspaceName={workspaceName}
                            avatarPreview={avatarPreview}
                            workspaceNameError={workspaceNameError}
                            onWorkspaceNameChange={(name) => {
                                setWorkspaceName(name);
                                setWorkspaceNameError("");
                            }}
                            onAvatarUpload={handleAvatarUpload}
                            onNext={nextStep}
                            isProcessing={isProcessing}
                            isCompressing={isCompressing}
                        />
                    )}

                    {currentStep === 1 && (
                        <PlanSelectionStep
                            workspaceName={workspaceName}
                            selectedPlan={selectedPlan}
                            isCreatingWorkspace={createWorkspaceMutation.isPending || isProcessing}
                            plans={PLANS}
                            onSelectPlan={handlePlanSelect}
                            onBack={prevStep}
                        />
                    )}

                    {currentStep === 2 && selectedPlan && (
                        <GetStartedStep
                            workspaceName={workspaceName}
                            selectedPlan={selectedPlan}
                            isCreatingWorkspace={isProcessing}
                            onGetStarted={handleGetStarted}
                            onBack={prevStep}
                        />
                    )}
                </div>
            </div>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={handleUpgradeClose}
                onSuccess={handleUpgradeConfirm}
                onUpgrade={handleUpgradeConfirm}
                isOnboarding={true}
            />

            {/* Loading Overlay for Workspace Creation and Payment Redirect */}
            {(createWorkspaceMutation.isPending || updateWorkspaceMutation.isPending || isProcessing || isRedirecting || isCompressing) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm font-semibold text-gray-900 text-center">
                            {isCompressing 
                                ? 'Compressing image...'
                                : isRedirecting 
                                    ? 'Redirecting to payment...' 
                                    : 'Creating your workspace...'}
                        </p>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Please don't close this window
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function OnboardingPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <OnboardingPage />
        </Suspense>
    );
}

export default OnboardingPageWrapper;
