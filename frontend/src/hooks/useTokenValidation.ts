import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/api/auth.service';

/**
 * Hook to validate JWT token on app load and periodically
 * If token is invalid or user no longer exists, logout the user
 * This handles cases where:
 * - User deletes their account
 * - Database is cleared
 * - Token expires
 * - User is deleted by admin
 */
export function useTokenValidation() {
    const { token, logout } = useAuthStore();

    useEffect(() => {
        if (!token) return;

        const validateToken = async () => {
            try {
                // Try to fetch user profile using the token
                // If this fails, the token is invalid or user no longer exists
                await authService.getCurrentUser();
            } catch (error) {
                console.warn('Token validation failed, logging out user');
                // Token is invalid or user no longer exists
                logout();
            }
        };

        // Validate token on mount
        validateToken();

        // Also validate periodically (every 5 minutes)
        // This catches cases where user deletes account in another tab
        const interval = setInterval(validateToken, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [token, logout]);
}
