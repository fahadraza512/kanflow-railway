import { apiClient } from './base.service';

/**
 * User Preferences API Service
 * Handles user preference settings
 */

export interface EmailPreferences {
    assignments: boolean;
    mentions: boolean;
    deadlines: boolean;
    comments: boolean;
    paymentAlerts: boolean;
}

export interface UserPreferences {
    email: EmailPreferences;
    notifications: {
        desktop: boolean;
        mobile: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
    language?: string;
}

export const preferencesService = {
    /**
     * Get user preferences
     */
    getPreferences: async (): Promise<UserPreferences> => {
        const response = await apiClient.get<UserPreferences>('/preferences');
        return response.data;
    },

    /**
     * Update email preferences
     */
    updateEmailPreferences: async (preferences: EmailPreferences): Promise<void> => {
        await apiClient.patch('/preferences', { email: preferences });
    },

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: async (preferences: { desktop: boolean; mobile: boolean }): Promise<void> => {
        await apiClient.put('/preferences/notifications', preferences);
    },

    /**
     * Update theme preference
     */
    updateTheme: async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
        await apiClient.put('/preferences/theme', { theme });
    },
};
