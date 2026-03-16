import { apiClient, handleApiError, ApiResponse } from './base.service';
import {
    LoginDto,
    RegisterDto,
    AuthResponse,
    ChangePasswordDto,
    ResetPasswordDto,
    ForgotPasswordDto,
    RefreshTokenDto,
    User,
} from '@/types/api.types';

class AuthService {
    private endpoint = '/auth';

    /**
     * Login user
     */
    async login(credentials: LoginDto): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>(
                `${this.endpoint}/login`,
                credentials
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Register new user
     */
    async register(data: RegisterDto, inviteToken?: string): Promise<AuthResponse> {
        try {
            const url = inviteToken 
                ? `${this.endpoint}/register?inviteToken=${encodeURIComponent(inviteToken)}`
                : `${this.endpoint}/register`;
            
            const response = await apiClient.post<ApiResponse<AuthResponse>>(
                url,
                data
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/logout`);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Refresh access token
     */
    async refreshToken(data: RefreshTokenDto): Promise<AuthResponse> {
        try {
            const response = await apiClient.post<ApiResponse<AuthResponse>>(
                `${this.endpoint}/refresh`,
                data
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        try {
            const response = await apiClient.get<ApiResponse<User>>(`${this.endpoint}/me`);
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Verify email
     */
    async verifyEmail(token: string): Promise<void> {
        try {
            await apiClient.get(`${this.endpoint}/verify-email?token=${token}`);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Resend verification email
     */
    async resendVerificationEmail(email: string, inviteToken?: string): Promise<{ expired?: boolean; message?: string }> {
        try {
            // If user was deleted by cleanup, we may need to re-register them
            let pendingData: any = null;
            try {
                const stored = sessionStorage.getItem('pendingRegistration');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.email === email) pendingData = parsed;
                }
            } catch {}

            const response = await apiClient.post(`${this.endpoint}/resend-verification`, { 
                email,
                inviteToken,
                ...(pendingData ? {
                    firstName: pendingData.firstName,
                    lastName: pendingData.lastName,
                    password: pendingData.password,
                } : {}),
            });
            return response.data?.data || response.data || {};
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Cancel unverified account
     */
    async cancelUnverifiedAccount(email: string): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/cancel-unverified`, { email });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Request password reset
     */
    async forgotPassword(data: ForgotPasswordDto): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/forgot-password`, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Reset password with token
     */
    async resetPassword(data: ResetPasswordDto): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/reset-password`, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Change password (authenticated user)
     */
    async changePassword(data: ChangePasswordDto): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/change-password`, data);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Enable 2FA
     */
    async enable2FA(): Promise<{ secret: string; qrCode: string }> {
        try {
            const response = await apiClient.post<ApiResponse<{ secret: string; qrCode: string }>>(
                `${this.endpoint}/2fa/enable`
            );
            return response.data.data;
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Verify 2FA code
     */
    async verify2FA(code: string): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/2fa/verify`, { code });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Disable 2FA
     */
    async disable2FA(code: string): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/2fa/disable`, { code });
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Delete account
     */
    async deleteAccount(): Promise<void> {
        try {
            await apiClient.delete(`${this.endpoint}/account`);
        } catch (error) {
            throw handleApiError(error);
        }
    }

    /**
     * Mark onboarding as completed
     */
    async completeOnboarding(): Promise<void> {
        try {
            await apiClient.post(`${this.endpoint}/complete-onboarding`);
        } catch (error) {
            throw handleApiError(error);
        }
    }
}

export const authService = new AuthService();
