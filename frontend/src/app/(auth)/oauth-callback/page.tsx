'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { showToast } from '@/lib/toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * OAuth Callback Page
 * Handles OAuth2 callback from Google authentication
 * Extracts token from URL and stores it in auth store
 */
export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser, setToken } = useAuthStore();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Extract token and user data from URL params
                const token = searchParams.get('token');
                const error = searchParams.get('error');

                // Handle OAuth error
                if (error) {
                    showToast.error(error || 'Authentication failed');
                    router.push('/login');
                    return;
                }

                // Validate token exists
                if (!token) {
                    showToast.error('No authentication token received');
                    router.push('/login');
                    return;
                }

                // Extract user data (backend should include this in callback URL)
                const userDataParam = searchParams.get('user');
                if (!userDataParam) {
                    showToast.error('No user data received');
                    router.push('/login');
                    return;
                }

                // Parse user data
                const userData = JSON.parse(decodeURIComponent(userDataParam));

                // Store token and user in auth store
                setToken(token);
                setUser(userData);

                // Show success message
                showToast.success('Successfully logged in with Google');

                // Redirect to dashboard
                router.push('/dashboard');
            } catch (error) {
                console.error('OAuth callback error:', error);
                showToast.error('Failed to complete authentication');
                router.push('/login');
            }
        };

        handleOAuthCallback();
    }, [searchParams, router, setUser, setToken]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
}
