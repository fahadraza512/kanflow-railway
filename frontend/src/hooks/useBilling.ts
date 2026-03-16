import { useState, useEffect } from "react";
import {
    getActiveWorkspace,
    getWorkspaceById,
    getFromStorage,
    getInvoicesByWorkspace,
    getSubscriptionEventsByWorkspace,
    createSubscriptionEvent,
    Invoice,
    Workspace,
    SubscriptionEvent
} from "@/lib/storage";

export interface BillingData {
    currentPlan: "free" | "pro";
    subscriptionStatus?: "active" | "cancelled" | "expired";
    subscriptionEndDate?: string;
    subscriptionStartDate?: string;
    billingCycle?: "annual" | "monthly";
    workspaceName: string;
    workspaceId: string | number | null;
    invoices: Invoice[];
    subscriptionEvents: SubscriptionEvent[];
}

export function useBilling() {
    const [billingData, setBillingData] = useState<BillingData>({
        currentPlan: "free",
        workspaceName: "",
        workspaceId: null,
        invoices: [],
        subscriptionEvents: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadBillingData = () => {
        const activeWsId = getActiveWorkspace();
        if (!activeWsId) {
            setIsLoading(false);
            return;
        }

        const workspace = getWorkspaceById(activeWsId);
        if (!workspace) {
            setIsLoading(false);
            return;
        }

        // Check if subscription has expired
        let plan = workspace.plan || "free";
        let status = workspace.subscriptionStatus;

        if (workspace.subscriptionEndDate && workspace.subscriptionStatus === "cancelled") {
            const endDate = new Date(workspace.subscriptionEndDate);
            const now = new Date();

            if (now > endDate) {
                // Subscription has expired
                const workspaces = getFromStorage<Workspace>("workspaces");
                const updated = workspaces.map(w =>
                    w.id === activeWsId
                        ? { ...w, plan: "free" as const, subscriptionStatus: "expired" as const }
                        : w
                );
                localStorage.setItem("workspaces", JSON.stringify(updated));

                // Create expiration event
                const events = getSubscriptionEventsByWorkspace(activeWsId);
                const hasExpiredEvent = events.some(
                    e => e.eventType === "expired" && new Date(e.timestamp).toDateString() === now.toDateString()
                );

                if (!hasExpiredEvent) {
                    createSubscriptionEvent({
                        id: Date.now(),
                        workspaceId: activeWsId,
                        eventType: "expired",
                        fromPlan: "pro",
                        toPlan: "free",
                        timestamp: now.toISOString()
                    });
                }

                plan = "free";
                status = "expired";
            }
        }

        // Check for expiry reminders
        checkExpiryReminders(workspace, activeWsId);

        // Load invoices and events
        const workspaceInvoices = getInvoicesByWorkspace(activeWsId);
        const events = getSubscriptionEventsByWorkspace(activeWsId);

        setBillingData({
            currentPlan: plan,
            subscriptionStatus: status,
            subscriptionEndDate: workspace.subscriptionEndDate,
            subscriptionStartDate: workspace.subscriptionStartDate,
            billingCycle: workspace.billingCycle,
            workspaceName: workspace.name,
            workspaceId: activeWsId,
            invoices: workspaceInvoices,
            subscriptionEvents: events
        });

        setIsLoading(false);
    };

    const checkExpiryReminders = (workspace: Workspace, workspaceId: string | number) => {
        if (!workspace.subscriptionEndDate || workspace.subscriptionStatus !== "cancelled") {
            return;
        }

        const endDate = new Date(workspace.subscriptionEndDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry > 0 && daysUntilExpiry <= 3) {
            const reminderKey = `expiry-reminder-${workspaceId}-${now.toDateString()}`;
            const reminderSent = localStorage.getItem(reminderKey);

            if (!reminderSent) {
                const notifications = getFromStorage<any>("notifications") || [];
                notifications.push({
                    id: Date.now(),
                    workspaceId: workspaceId,
                    type: "subscription_expiry",
                    title: "Subscription Expiring Soon",
                    message: `Your Pro subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Reactivate to continue enjoying Pro features.`,
                    read: false,
                    createdAt: now.toISOString()
                });
                localStorage.setItem("notifications", JSON.stringify(notifications));
                localStorage.setItem(reminderKey, "true");
                window.dispatchEvent(new Event('local-storage-change'));
            }
        }
    };

    const reactivateSubscription = () => {
        const { workspaceId, billingCycle } = billingData;
        if (!workspaceId || !billingCycle) return;

        const now = new Date();
        const endDate = new Date(now);

        if (billingCycle === "annual") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        const workspaces = getFromStorage<Workspace>("workspaces");
        const updated = workspaces.map(w =>
            w.id === workspaceId
                ? {
                    ...w,
                    subscriptionStatus: "active" as const,
                    subscriptionStartDate: now.toISOString(),
                    subscriptionEndDate: endDate.toISOString()
                }
                : w
        );
        localStorage.setItem("workspaces", JSON.stringify(updated));

        // Create invoice
        const invoice: Invoice = {
            id: Date.now(),
            workspaceId: workspaceId,
            invoiceNumber: `INV-${Date.now()}`,
            date: now.toISOString().split('T')[0],
            amount: billingCycle === "annual" ? "$120.00" : "$12.00",
            billingCycle: billingCycle,
            status: "paid",
            description: `Pro Plan - Reactivated (${billingCycle === "annual" ? "Annual" : "Monthly"})`,
            createdAt: now.toISOString()
        };

        const invoicesData = getFromStorage<Invoice>("invoices");
        invoicesData.push(invoice);
        localStorage.setItem("invoices", JSON.stringify(invoicesData));

        // Create event
        createSubscriptionEvent({
            id: Date.now() + 1,
            workspaceId: workspaceId,
            eventType: "reactivated",
            toPlan: "pro",
            billingCycle: billingCycle,
            timestamp: now.toISOString()
        });

        window.dispatchEvent(new Event('local-storage-change'));
    };

    const cancelSubscription = () => {
        const { workspaceId, billingCycle } = billingData;
        if (!workspaceId) return;

        const workspaces = getFromStorage<Workspace>("workspaces");
        const updated = workspaces.map(w =>
            w.id === workspaceId
                ? {
                    ...w,
                    subscriptionStatus: "cancelled" as const,
                    subscriptionCancelledAt: new Date().toISOString()
                }
                : w
        );
        localStorage.setItem("workspaces", JSON.stringify(updated));

        createSubscriptionEvent({
            id: Date.now(),
            workspaceId: workspaceId,
            eventType: "cancelled",
            fromPlan: "pro",
            billingCycle: billingCycle,
            timestamp: new Date().toISOString()
        });

        window.dispatchEvent(new Event('local-storage-change'));
    };

    useEffect(() => {
        loadBillingData();

        const handleStorageChange = () => {
            loadBillingData();
        };

        window.addEventListener('local-storage-change', handleStorageChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('local-storage-change', handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    return {
        ...billingData,
        isLoading,
        reactivateSubscription,
        cancelSubscription,
        refresh: loadBillingData
    };
}
