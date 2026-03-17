'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { invitationService, InvitationDetails } from '@/services/api/invitation.service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { isWebView, openInBrowser } from '@/utils/webview-detector';

function WebViewWarning({ currentUrl }: { currentUrl: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
        <div className="text-4xl mb-3">🌐</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Open in your browser</h2>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          You're viewing this in your email app's built-in browser. To sign up and verify your email, you need to open this in Chrome, Safari, or your default browser.
        </p>
        <button
          onClick={() => openInBrowser(currentUrl)}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm mb-3 hover:bg-blue-700 transition-colors"
        >
          Open in Browser
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-full py-2 px-4 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Continue anyway
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Tip: tap ⋮ or the share icon in your email app and choose "Open in browser"
        </p>
      </div>
    </div>
  );
}

function InviteAcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, setAuth } = useAuthStore();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [showWebViewWarning, setShowWebViewWarning] = useState(false);

  // Detect WebView on mount
  useEffect(() => {
    if (isWebView()) {
      setShowWebViewWarning(true);
    }
  }, []);

  useEffect(() => {
    // Only run validation once
    if (hasValidated) return;

    if (!token) {
      router.push('/invite/error?type=invalid');
      return;
    }

    // Check if user is logged in — redirect to login with token in URL
    // Backend will look up the pending invite by email after login
    if (!user) {
      router.replace(`/login?inviteToken=${token}`);
      return;
    }

    // Validate token
    validateInvitation();
    setHasValidated(true);
  }, [token, user, hasValidated]);

  const validateInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await invitationService.validateToken(token);
      setInvitation(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate invitation';

      // Clear stale token from user state on any validation failure
      if (user && token) {
        try {
          const currentToken = useAuthStore.getState().token || '';
          const currentRole = useAuthStore.getState().role || 'USER';
          setAuth(
            { ...user, hasPendingInvitation: false, pendingInviteToken: null } as any,
            currentToken,
            currentRole
          );
        } catch {
          // ignore
        }
      }

      if (errorMessage.includes('already been accepted') || errorMessage.includes('already a member')) {
        setError('✅ You have already accepted this invitation and are a member of this workspace. You can go to your dashboard to access it.');
      } else if (errorMessage.includes('expired')) {
        setError('⏰ This invitation has expired. Please contact the workspace owner to send you a new invitation.');
      } else if (errorMessage.includes('cancelled')) {
        setError('🚫 This invitation has been cancelled by the workspace owner.');
      } else if (errorMessage.includes('no longer exists') || errorMessage.includes('deleted')) {
        setError('🗑️ The workspace associated with this invitation no longer exists. It may have been deleted.');
      } else if (errorMessage.includes('Invalid invitation') || errorMessage.includes('not found')) {
        setError('❌ Invalid invitation link. The invitation may have been deleted or the link is incorrect. Please ask the workspace owner to send a new invitation.');
      } else {
        setError(`⚠️ ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token || !user || !invitation) return;

    try {
      setAccepting(true);
      const result = await invitationService.acceptInvitation(token);

      const currentToken = useAuthStore.getState().token || '';
      const currentRole = useAuthStore.getState().role || 'USER';

      setAuth(
        {
          ...user,
          onboardingCompleted: true,
          skipOnboarding: true,
          hasPendingInvitation: false,
          pendingInviteToken: null,
          activeWorkspaceId: result.workspaceId,
        } as any,
        currentToken,
        currentRole
      );

      const acceptedWorkspace = {
        id: result.workspaceId,
        name: result.workspaceName,
        description: '',
        createdBy: result.workspaceId,
        ownerId: result.workspaceId,
        role: result.role,
        plan: 'free' as 'free' | 'pro',
        members: [],
        icon: undefined,
        createdAt: new Date().toISOString(),
      };

      const { useWorkspaceStore } = await import('@/store/useWorkspaceStore');
      const { addWorkspace, setActiveWorkspace } = useWorkspaceStore.getState();

      addWorkspace(acceptedWorkspace);
      setActiveWorkspace(acceptedWorkspace);

      router.replace('/dashboard');
    } catch (err: any) {
      
      if (err.message?.includes('different email')) {
        router.push('/invite/error?type=wrong-account');
      } else {
        setError(err.message || 'Failed to accept invitation');
      }
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!token) {
      router.replace('/dashboard');
      return;
    }

    try {
      setDeclining(true);
      await invitationService.declineInvitation(token);

      // Clear pending token from auth store
      if (user) {
        const currentToken = useAuthStore.getState().token || '';
        const currentRole = useAuthStore.getState().role || 'USER';
        setAuth(
          { ...user, hasPendingInvitation: false, pendingInviteToken: null } as any,
          currentToken,
          currentRole
        );
      }

      setDeclined(true);
    } catch {
      // Even if the API call fails, show the declined screen
      setDeclined(true);
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    const isExpiredOrInvalid = error.includes('expired') || error.includes('Invalid') || error.includes('cancelled') || error.includes('no longer exists');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-6">
          <EmptyState 
            title="Invitation Error" 
            description={error}
            icon={<div className="text-4xl">⚠️</div>}
          />
          <div className="mt-6 flex gap-3">
            <Button onClick={() => router.replace('/dashboard')} className="flex-1">
              Go to Dashboard
            </Button>
            {!isExpiredOrInvalid && (
              <Button onClick={validateInvitation} variant="outline" className="flex-1">
                Try Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-4xl mb-4">👋</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Declined</h1>
          <p className="text-gray-500 text-sm mb-6">
            You've declined the invitation to join <span className="font-medium text-gray-700">{invitation?.workspaceName}</span>.
            The workspace owner will be able to see this and can send a new invite if needed.
          </p>
          <Button onClick={() => router.replace('/dashboard')} className="w-full">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const formatRole = (role: string) => {
    if (!role) return 'Member';
    if (role === 'pm') return 'Project Manager';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {showWebViewWarning && (
        <WebViewWarning currentUrl={typeof window !== 'undefined' ? window.location.href : ''} />
      )}
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            You're Invited!
          </h1>
          <p className="text-gray-600">
            {invitation.inviterName} has invited you to join their workspace
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Workspace</div>
            <div className="text-lg font-semibold text-gray-900">
              {invitation.workspaceName}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Your Role</div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {formatRole(invitation.role)}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Expires</div>
            <div className="text-sm text-gray-700">
              {formatDate(invitation.expiresAt)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            disabled={accepting || declining}
            className="w-full"
          >
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            disabled={accepting || declining}
            className="w-full"
          >
            {declining ? 'Declining...' : 'Decline'}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          By accepting, you'll be added to this workspace with the role specified above.
        </p>
      </Card>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    }>
      <InviteAcceptContent />
    </Suspense>
  );
}
