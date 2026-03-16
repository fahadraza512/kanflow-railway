import { apiClient } from './base.service';

export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}

export interface PortalSessionResponse {
    url: string;
}

export const stripeService = {
    /**
     * Create a Stripe checkout session for subscription
     * @param workspaceId - Workspace ID
     * @param plan - Plan type (pro)
     * @param billingCycle - Billing cycle (monthly, annual)
     * @param returnUrl - Optional return URL for redirect after payment
     * @returns Checkout session with redirect URL
     */
    createCheckoutSession: async (
        workspaceId: string,
        plan: 'pro',
        billingCycle: 'monthly' | 'annual' = 'monthly',
        returnUrl?: string
    ): Promise<CheckoutSessionResponse> => {
        const response = await apiClient.post<{ data: CheckoutSessionResponse }>(
            '/stripe/create-checkout-session',
            {
                workspaceId,
                plan,
                billingCycle,
                returnUrl,
            }
        );

        return response.data.data;
    },

    /**
     * Create a Stripe customer portal session
     * @param workspaceId - Workspace ID
     * @returns Portal session with redirect URL
     */
    createPortalSession: async (workspaceId: string): Promise<PortalSessionResponse> => {
        const response = await apiClient.post<{ data: PortalSessionResponse }>(
            '/stripe/create-portal-session',
            {
                workspaceId,
            }
        );

        return response.data.data;
    },
};
