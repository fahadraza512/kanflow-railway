import { useState, useEffect } from "react";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { useCreateCheckoutSession } from "./api/useStripe";
import { showToast } from "@/lib/toast";

type UpgradeStep = "plans" | "checkout" | "success" | "already-subscribed";

export function useUpgrade(isOpen: boolean, isOnboarding: boolean = false) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<UpgradeStep>("plans");
    const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
    const [isReactivation, setIsReactivation] = useState(false);
    const [workspaceName, setWorkspaceName] = useState<string>("");
    
    const { activeWorkspace } = useWorkspaceStore();
    const createCheckoutMutation = useCreateCheckoutSession();

    useEffect(() => {
        if (isOpen && activeWorkspace) {
            setWorkspaceName(activeWorkspace.name);
            
            // Check if already on Pro plan with active subscription
            if (activeWorkspace.plan === "pro" && activeWorkspace.subscriptionStatus === "active") {
                setStep("already-subscribed");
            } 
            // Check if subscription was cancelled (reactivation flow)
            else if (activeWorkspace.subscriptionStatus === "cancelled" && activeWorkspace.billingCycle) {
                setIsReactivation(true);
                setBillingCycle(activeWorkspace.billingCycle);
                setStep("plans");
            } 
            // New upgrade flow
            else {
                setIsReactivation(false);
                setStep("plans");
            }
        } else if (!isOpen) {
            // Reset state when modal closes
            setIsReactivation(false);
            setStep("plans");
            setWorkspaceName("");
        }
    }, [isOpen, activeWorkspace]);

    const handleUpgrade = async () => {
        if (!activeWorkspace?.id) {
            console.error('No active workspace');
            showToast.error('Unable to process payment. Please try again.');
            return;
        }
        
        setIsProcessing(true);
        
        try {
            console.log('Creating Stripe checkout session...');
            console.log('Workspace ID:', activeWorkspace.id);
            console.log('Plan: pro');
            console.log('Billing Cycle:', billingCycle);
            console.log('Is Onboarding:', isOnboarding);
            
            // Determine return URL based on context
            const returnUrl = isOnboarding ? '/onboarding' : undefined;
            
            // Create Stripe checkout session
            // This will redirect to Stripe checkout page (or dummy page)
            const result = await createCheckoutMutation.mutateAsync({
                workspaceId: String(activeWorkspace.id),
                plan: "pro",
                billingCycle: billingCycle,
                returnUrl: returnUrl,
            });
            
            console.log('Checkout session created:', result);
            
            // Note: User will be redirected to Stripe (or dummy checkout)
            // After successful payment, Stripe webhook will:
            // 1. Update workspace subscription to "pro"
            // 2. Set stripeSubscriptionId
            // 3. User returns to success URL
            
        } catch (error: any) {
            console.error('Error creating checkout session:', error);
            console.error('Error details:', {
                message: error?.message,
                response: error?.response?.data,
                status: error?.response?.status,
            });
            setIsProcessing(false);
            
            // Show user-friendly error message
            let errorMessage = 'Unable to start payment process. Please try again.';
            
            // Check for specific error messages
            if (error?.message?.includes('Stripe is not configured')) {
                errorMessage = 'Payment system is not configured yet. Please contact support or try again later.';
            } else if (error?.message?.includes('Price ID not configured')) {
                errorMessage = 'Pricing is not configured yet. Please contact support.';
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            showToast.error(errorMessage);
        }
    };

    return {
        step,
        setStep,
        billingCycle,
        setBillingCycle,
        workspaceName,
        isProcessing,
        handleUpgrade
    };
}
