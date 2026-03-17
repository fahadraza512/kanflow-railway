'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/services/api/client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showToast } from '@/lib/toast';

/**
 * Handles the redirect from Google OAuth.
 * Backend redirects here with ?token=JWT after successful Google login.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      showToast.error('Google login failed. Please try again.');
      router.replace('/login');
      return;
    }

    // Fetch user profile using the token
    apiClient
      .get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const user = res.data?.data ?? res.data;
        setAuth(user, token, user.role || 'USER');
        showToast.success(`Welcome, ${user.name || user.firstName}!`);

        // Pending invite takes priority
        if (user.pendingInviteToken) {
          router.replace(`/invite/accept?token=${user.pendingInviteToken}`);
          return;
        }

        const shouldOnboard =
          !user.onboardingCompleted &&
          !user.activeWorkspaceId &&
          !user.skipOnboarding;

        router.replace(shouldOnboard ? '/onboarding' : '/dashboard');
      })
      .catch(() => {
        showToast.error('Google login failed. Please try again.');
        router.replace('/login');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <LoadingSpinner size="lg" color="primary" />
      <p className="text-sm text-gray-500">Signing you in with Google...</p>
    </div>
  );
}
