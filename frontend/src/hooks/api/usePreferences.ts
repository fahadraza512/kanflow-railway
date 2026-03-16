import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService, EmailPreferences, UserPreferences } from '@/services/api/preferences.service';

/**
 * Query keys for preferences
 */
export const preferencesKeys = {
    all: ['preferences'] as const,
    detail: () => [...preferencesKeys.all, 'detail'] as const,
};

/**
 * Hook to fetch user preferences
 */
export function usePreferences() {
    return useQuery({
        queryKey: preferencesKeys.detail(),
        queryFn: preferencesService.getPreferences,
    });
}

/**
 * Hook to update email preferences
 */
export function useUpdateEmailPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: EmailPreferences) => 
            preferencesService.updateEmailPreferences(preferences),
        onSuccess: () => {
            // Invalidate preferences cache
            queryClient.invalidateQueries({ queryKey: preferencesKeys.detail() });
        },
    });
}

/**
 * Hook to update notification preferences
 */
export function useUpdateNotificationPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: { desktop: boolean; mobile: boolean }) => 
            preferencesService.updateNotificationPreferences(preferences),
        onSuccess: () => {
            // Invalidate preferences cache
            queryClient.invalidateQueries({ queryKey: preferencesKeys.detail() });
        },
    });
}

/**
 * Hook to update theme preference
 */
export function useUpdateTheme() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (theme: 'light' | 'dark' | 'system') => 
            preferencesService.updateTheme(theme),
        onSuccess: () => {
            // Invalidate preferences cache
            queryClient.invalidateQueries({ queryKey: preferencesKeys.detail() });
        },
    });
}
