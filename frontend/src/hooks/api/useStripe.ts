import { useMutation } from '@tanstack/react-query';
import { stripeService } from '@/services/api/stripe.service';
import { handleApiError } from '@/services/api/base.service';
import { showToast } from '@/lib/toast';

// Query keys
export const stripeKeys = {
    all: ['stripe'] as const,
    checkout: () => [...stripeKeys.all, 'checkout'] as const,
    portal: () => [...stripeKeys.all, 'portal'] as const,
};

/**
 * Hook to create Stripe checkout session
 */
export function useCreateCheckoutSession() {
    return useMutation({
        mutationFn: ({
            workspaceId,
            plan,
            billingCycle,
            returnUrl,
        }: {
            workspaceId: string;
            plan: 'pro';
            billingCycle?: 'monthly' | 'annual';
            returnUrl?: string;
        }) => stripeService.createCheckoutSession(workspaceId, plan, billingCycle, returnUrl),
        onSuccess: (data) => {
            // Redirect to Stripe checkout
            if (typeof window !== 'undefined' && data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            const apiError = handleApiError(error);
            showToast.error(apiError.message || 'Failed to create checkout session');
        },
    });
}

/**
 * Hook to create Stripe customer portal session
 */
export function useCreatePortalSession() {
    return useMutation({
        mutationFn: (workspaceId: string) => stripeService.createPortalSession(workspaceId),
        onSuccess: (data) => {
            // Redirect to Stripe portal
            if (typeof window !== 'undefined' && data.url) {
                window.location.href = data.url;
            }
        },
        onError: (error) => {
            const apiError = handleApiError(error);
            showToast.error(apiError.message || 'Failed to open billing portal');
        },
    });
}
