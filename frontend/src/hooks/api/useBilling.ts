import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '@/services/api/billing.service';
import { EntityId } from '@/types/api.types';
import { showToast } from '@/lib/toast';

/**
 * Query keys for billing
 */
export const billingKeys = {
    all: ['billing'] as const,
    invoices: (workspaceId: EntityId) => [...billingKeys.all, 'invoices', workspaceId] as const,
    paymentMethods: (workspaceId: EntityId) => [...billingKeys.all, 'payment-methods', workspaceId] as const,
    subscriptionEvents: (workspaceId: EntityId) => [...billingKeys.all, 'subscription-events', workspaceId] as const,
};

/**
 * Hook to fetch invoices for a workspace
 */
export function useInvoices(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: billingKeys.invoices(workspaceId!),
        queryFn: () => billingService.getInvoices(workspaceId!),
        enabled: !!workspaceId,
    });
}

/**
 * Hook to download an invoice
 */
export function useDownloadInvoice() {
    return useMutation({
        mutationFn: ({ workspaceId, invoiceId }: { workspaceId: EntityId; invoiceId: EntityId }) =>
            billingService.downloadInvoice(workspaceId, invoiceId),
        onSuccess: (blob, variables) => {
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoice-${variables.invoiceId}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            showToast.success('Invoice downloaded');
        },
        onError: () => {
            showToast.error('Failed to download invoice');
        },
    });
}

/**
 * Hook to fetch payment methods for a workspace
 */
export function usePaymentMethods(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: billingKeys.paymentMethods(workspaceId!),
        queryFn: () => billingService.getPaymentMethods(workspaceId!),
        enabled: !!workspaceId,
    });
}

/**
 * Hook to add a payment method
 */
export function useAddPaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, paymentMethodData }: { workspaceId: EntityId; paymentMethodData: any }) =>
            billingService.addPaymentMethod(workspaceId, paymentMethodData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(variables.workspaceId) });
            showToast.success('Payment method added');
        },
        onError: () => {
            showToast.error('Failed to add payment method');
        },
    });
}

/**
 * Hook to set default payment method
 */
export function useSetDefaultPaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, paymentMethodId }: { workspaceId: EntityId; paymentMethodId: EntityId }) =>
            billingService.setDefaultPaymentMethod(workspaceId, paymentMethodId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(variables.workspaceId) });
            showToast.success('Default payment method updated');
        },
        onError: () => {
            showToast.error('Failed to update default payment method');
        },
    });
}

/**
 * Hook to delete a payment method
 */
export function useDeletePaymentMethod() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceId, paymentMethodId }: { workspaceId: EntityId; paymentMethodId: EntityId }) =>
            billingService.deletePaymentMethod(workspaceId, paymentMethodId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: billingKeys.paymentMethods(variables.workspaceId) });
            showToast.success('Payment method deleted');
        },
        onError: () => {
            showToast.error('Failed to delete payment method');
        },
    });
}

/**
 * Hook to fetch subscription events for a workspace
 */
export function useSubscriptionEvents(workspaceId: EntityId | null) {
    return useQuery({
        queryKey: billingKeys.subscriptionEvents(workspaceId!),
        queryFn: () => billingService.getSubscriptionEvents(workspaceId!),
        enabled: !!workspaceId,
    });
}
