import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';
import { showToast, showApiError } from '@/lib/toast';
import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from '@/types/api.types';

// Query keys
export const authKeys = {
    all: ['auth'] as const,
    currentUser: () => [...authKeys.all, 'current-user'] as const,
};

/**
 * Get current user
 */
export function useCurrentUser() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: authKeys.currentUser(),
        queryFn: () => authService.getCurrentUser(),
        enabled: !!user, // Only fetch if user is logged in
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/**
 * Login mutation
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginDto) => authService.login(credentials),
        onSuccess: (data) => {
            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: authKeys.currentUser() });
            
            // Return data to caller - let the login page handle redirect
            return data;
        },
        // Don't handle error here - let the login page handle it
    });
}

/**
 * Register mutation
 */
export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: ({ data, inviteToken }: { data: RegisterDto; inviteToken?: string }) => 
            authService.register(data, inviteToken),
        onSuccess: (data) => {
            showToast.success('Account created! Please verify your email.');
            router.push(`/verify-email?email=${encodeURIComponent(data.user.email)}`);
        },
        onError: (error: any) => {
            showApiError(error, 'Registration failed. Please try again.');
        },
    });
}

/**
 * Logout mutation
 */
export function useLogout() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            // Clear auth store
            logout();

            // Clear all queries
            queryClient.clear();

            showToast.success('Logged out successfully');
            router.push('/login');
        },
        onError: (error: any) => {
            // Still logout locally even if API call fails
            logout();
            queryClient.clear();
            router.push('/login');
            showApiError(error, 'Logout failed');
        },
    });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
    return useMutation({
        mutationFn: (data: ChangePasswordDto) => authService.changePassword(data),
        onSuccess: () => {
            showToast.success('Password changed successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to change password');
        },
    });
}

/**
 * Forgot password mutation
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
        onSuccess: () => {
            showToast.success('Password reset email sent. Please check your inbox.');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to send reset email');
        },
    });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),
        onSuccess: () => {
            showToast.success('Password reset successfully. Please login.');
            router.push('/login');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to reset password');
        },
    });
}

/**
 * Verify email mutation
 */
export function useVerifyEmail() {
    const router = useRouter();

    return useMutation({
        mutationFn: (token: string) => authService.verifyEmail(token),
        onSuccess: () => {
            showToast.success('Email verified successfully!');
            router.push('/login?verified=true');
        },
        onError: (error: any) => {
            showApiError(error, 'Email verification failed');
        },
    });
}

/**
 * Resend verification email mutation
 */
export function useResendVerificationEmail() {
    return useMutation({
        mutationFn: ({ email, inviteToken }: { email: string; inviteToken?: string }) => 
            authService.resendVerificationEmail(email, inviteToken),
        onError: (error: any) => {
            showApiError(error, 'Failed to send verification email');
        },
    });
}

/**
 * Enable 2FA mutation
 */
export function useEnable2FA() {
    return useMutation({
        mutationFn: () => authService.enable2FA(),
        onSuccess: () => {
            showToast.success('2FA enabled successfully');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to enable 2FA');
        },
    });
}

/**
 * Delete account mutation
 */
export function useDeleteAccount() {
    const router = useRouter();
    const { logout } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.deleteAccount(),
        onSuccess: () => {
            // Clear auth store
            logout();

            // Clear all queries
            queryClient.clear();

            // Clear onboarding status from localStorage
            // This ensures if user signs up again, they'll go through onboarding
            if (typeof window !== 'undefined') {
                localStorage.removeItem('onboardingCompleted');
                localStorage.removeItem('onboardingInProgress');
            }

            showToast.success('Account deleted successfully');
            router.push('/');
        },
        onError: (error: any) => {
            showApiError(error, 'Failed to delete account');
        },
    });
}
