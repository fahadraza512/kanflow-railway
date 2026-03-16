"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useMemo } from "react";
import { 
    useWorkspace,
    useUpdateSubscription,
    useCancelSubscription,
    useReactivateSubscription,
    useInvoices,
    useDownloadInvoice,
    useSubscriptionEvents
} from "@/hooks/api";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";
import { 
    SubscriptionStatus, 
    ExpiryWarning, 
    PlanCard, 
    InvoiceList,
    Plan 
} from "@/components/billing";
import UpgradeModal from "@/components/workspace/UpgradeModal";
import ContactSalesModal from "@/components/workspace/ContactSalesModal";
import CancelSubscriptionModal from "@/components/billing/CancelSubscriptionModal";
import PaymentMethodCard from "@/components/billing/PaymentMethodCard";
import SubscriptionActivity from "@/components/billing/SubscriptionActivity";
import LoadingState from "@/components/ui/LoadingState";
import { showToast } from "@/lib/toast";

export default function BillingPage() {
    return <BillingPageContent />;
}

function BillingPageContent() {
    const { activeWorkspace } = useWorkspaceStore();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    // Fetch workspace data
    const { data: rawWorkspace, isLoading: workspaceLoading } = useWorkspace(activeWorkspace?.id || null);
    // Disable these queries for now - endpoints need to be fixed
    const invoices = [];
    const subscriptionEvents = [];

    // Normalize workspace data - map 'subscription' to 'plan'
    const workspace = useMemo(() => {
        if (!rawWorkspace) return null;
        
        return {
            ...rawWorkspace,
            plan: (rawWorkspace.subscription || rawWorkspace.plan || 'free') as 'free' | 'pro'
        };
    }, [rawWorkspace]);

    // Mutations
    const updateSubscriptionMutation = useUpdateSubscription();
    const cancelSubscriptionMutation = useCancelSubscription();
    const reactivateSubscriptionMutation = useReactivateSubscription();
    const downloadInvoiceMutation = useDownloadInvoice();

    // Only show loading if workspace is loading (invoices/events are optional)
    const isLoading = workspaceLoading;

    // Calculate days until expiry
    const getDaysUntilExpiry = () => {
        if (!workspace?.subscriptionEndDate) return 0;
        const endDate = new Date(workspace.subscriptionEndDate);
        const now = new Date();
        const days = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    // Define plans
    const plans: Plan[] = useMemo(() => [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            features: [
                "Up to 3 boards per project",
                "5 team members",
                "Basic task management",
                "Email support",
                "100 MB file storage"
            ],
            current: workspace?.plan === "free" || workspace?.subscriptionStatus === "expired"
        },
        {
            name: "Pro",
            price: "$12",
            period: "per user/month",
            features: [
                "Unlimited boards",
                "Unlimited team members",
                "Advanced analytics",
                "Priority support",
                "Custom fields",
                "API access",
                "10 GB file storage"
            ],
            current: workspace?.plan === "pro" && (workspace?.subscriptionStatus === "active" || workspace?.subscriptionStatus === "cancelled"),
            popular: true
        }
    ], [workspace]);

    // Check if workspace exists
    const hasWorkspace = !!activeWorkspace?.id;

    // Handle plan selection
    const handlePlanSelect = (planName: string) => {
        if (!hasWorkspace) return;
        
        if (planName === "Pro") {
            setIsUpgradeModalOpen(true);
        }
    };

    // Handle invoice download
    const handleDownloadInvoice = async (invoiceId: string | number) => {
        if (!activeWorkspace?.id) return;
        
        try {
            await downloadInvoiceMutation.mutateAsync({
                workspaceId: activeWorkspace.id,
                invoiceId: invoiceId.toString()
            });
        } catch (error) {
            // Error handled by mutation
        }
    };

    // Handle subscription cancellation
    const handleCancelSubscription = async () => {
        if (!activeWorkspace?.id) return;
        
        try {
            await cancelSubscriptionMutation.mutateAsync(activeWorkspace.id);
            setIsCancelModalOpen(false);
        } catch (error) {
            // Error handled by mutation
        }
    };

    // Handle subscription reactivation
    const handleReactivateSubscription = async () => {
        if (!activeWorkspace?.id) return;
        
        try {
            await reactivateSubscriptionMutation.mutateAsync(activeWorkspace.id);
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <main className="max-w-6xl mx-auto px-4 py-3">
                    <LoadingState message="Loading billing information..." />
                </main>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <main className="max-w-6xl mx-auto px-4 py-3">
                <div className="mb-3">
                    <h1 className="text-base font-bold text-gray-900">Billing & Plans</h1>
                    <p className="text-gray-500 mt-0.5 text-[10px]">
                        {hasWorkspace ? `${activeWorkspace.name} • Manage your subscription and billing` : "Manage your subscription and billing"}
                    </p>
                </div>

                {/* No Workspace Warning */}
                {!hasWorkspace && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                                    No Workspace Found
                                </h3>
                                <p className="text-xs text-yellow-700 mb-3">
                                    You need to create a workspace before you can select a plan. Plans are assigned to workspaces, not individual users.
                                </p>
                                <a
                                    href="/dashboard/workspace"
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 rounded-md transition-colors"
                                >
                                    Create Workspace
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current Plan Status */}
                {hasWorkspace && workspace && (
                    <div className="mb-4">
                        <SubscriptionStatus
                            currentPlan={workspace.plan}
                            subscriptionStatus={workspace.subscriptionStatus}
                            subscriptionEndDate={workspace.subscriptionEndDate}
                            billingCycle={workspace.billingCycle}
                            workspaceName={workspace.name}
                            onUpgrade={() => setIsUpgradeModalOpen(true)}
                            onReactivate={handleReactivateSubscription}
                            onCancel={() => setIsCancelModalOpen(true)}
                        />
                    </div>
                )}

                {/* Expiry Warning */}
                {workspace?.subscriptionStatus === "cancelled" && (
                    <div className="mb-4">
                        <ExpiryWarning
                            daysUntilExpiry={getDaysUntilExpiry()}
                            onReactivate={handleReactivateSubscription}
                        />
                    </div>
                )}

                {/* Available Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-4xl">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.name}
                            plan={plan}
                            onSelect={handlePlanSelect}
                            disabled={!hasWorkspace || (plan.name === "Free" && workspace?.plan !== "free")}
                        />
                    ))}
                </div>

                {/* Payment Method */}
                {hasWorkspace && workspace?.plan === "pro" && workspace?.subscriptionStatus === "active" && (
                    <div className="mb-4">
                        <PaymentMethodCard />
                    </div>
                )}

                {/* Billing History */}
                {hasWorkspace && Array.isArray(invoices) && invoices.length > 0 && (
                    <div className="mb-4">
                        <InvoiceList
                            invoices={invoices}
                            onDownload={handleDownloadInvoice}
                        />
                    </div>
                )}

                {/* Subscription Activity */}
                {hasWorkspace && Array.isArray(subscriptionEvents) && subscriptionEvents.length > 0 && (
                    <div className="mb-4">
                        <SubscriptionActivity events={subscriptionEvents} />
                    </div>
                )}
            </main>

            {/* Modals */}
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onSuccess={() => {
                    setIsUpgradeModalOpen(false);
                }}
            />

            <ContactSalesModal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                onSuccess={() => setIsContactModalOpen(false)}
                isExistingWorkspace={true}
            />

            <CancelSubscriptionModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelSubscription}
            />
        </DashboardLayout>
    );
}
