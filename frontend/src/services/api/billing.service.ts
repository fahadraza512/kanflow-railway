import { apiClient } from './base.service';
import { EntityId } from '@/types/api.types';

/**
 * Billing API Service
 * Handles billing, invoices, and payment methods
 */

export interface Invoice {
    id: EntityId;
    workspaceId: EntityId;
    invoiceNumber: string;
    amount: string;
    status: 'paid' | 'pending' | 'failed';
    date: string;
    description: string;
    billingCycle: 'monthly' | 'annual';
    downloadUrl?: string;
}

export interface PaymentMethod {
    id: EntityId;
    type: 'card' | 'bank';
    last4: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
}

export interface SubscriptionEvent {
    id: EntityId;
    type: 'created' | 'upgraded' | 'downgraded' | 'cancelled' | 'reactivated' | 'expired';
    description: string;
    timestamp: string;
}

export const billingService = {
    /**
     * Get invoices for a workspace
     */
    getInvoices: async (workspaceId: EntityId): Promise<Invoice[]> => {
        const response = await apiClient.get<Invoice[]>(`/workspaces/${workspaceId}/invoices`);
        return response.data;
    },

    /**
     * Download invoice
     */
    downloadInvoice: async (workspaceId: EntityId, invoiceId: EntityId): Promise<Blob> => {
        const response = await apiClient.get(`/workspaces/${workspaceId}/invoices/${invoiceId}/download`, {
            responseType: 'blob',
        });
        return response.data;
    },

    /**
     * Get payment methods for a workspace
     */
    getPaymentMethods: async (workspaceId: EntityId): Promise<PaymentMethod[]> => {
        const response = await apiClient.get<PaymentMethod[]>(`/workspaces/${workspaceId}/payment-methods`);
        return response.data;
    },

    /**
     * Add payment method
     */
    addPaymentMethod: async (workspaceId: EntityId, paymentMethodData: any): Promise<PaymentMethod> => {
        const response = await apiClient.post<PaymentMethod>(
            `/workspaces/${workspaceId}/payment-methods`,
            paymentMethodData
        );
        return response.data;
    },

    /**
     * Set default payment method
     */
    setDefaultPaymentMethod: async (workspaceId: EntityId, paymentMethodId: EntityId): Promise<void> => {
        await apiClient.put(`/workspaces/${workspaceId}/payment-methods/${paymentMethodId}/default`);
    },

    /**
     * Delete payment method
     */
    deletePaymentMethod: async (workspaceId: EntityId, paymentMethodId: EntityId): Promise<void> => {
        await apiClient.delete(`/workspaces/${workspaceId}/payment-methods/${paymentMethodId}`);
    },

    /**
     * Get subscription events/activity
     */
    getSubscriptionEvents: async (workspaceId: EntityId): Promise<SubscriptionEvent[]> => {
        const response = await apiClient.get<SubscriptionEvent[]>(`/workspaces/${workspaceId}/subscription/events`);
        return response.data;
    },
};
