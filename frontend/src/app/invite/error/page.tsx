'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function InviteErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorType = searchParams.get('type') || 'invalid';

  const errorConfig = {
    invalid: {
      icon: '❌',
      title: 'Invalid Invitation',
      message: 'This invitation link is invalid or has been removed.',
    },
    expired: {
      icon: '⏰',
      title: 'Invitation Expired',
      message: 'This invitation has expired. Please contact the workspace owner to request a new invitation.',
    },
    used: {
      icon: '✓',
      title: 'Already Accepted',
      message: 'This invitation has already been accepted.',
    },
    'wrong-account': {
      icon: '⚠️',
      title: 'Wrong Account',
      message: 'This invitation was sent to a different email address. Please log in with the correct account.',
    },
  };

  const config = errorConfig[errorType as keyof typeof errorConfig] || errorConfig.invalid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">{config.icon}</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {config.title}
        </h1>
        <p className="text-gray-600 mb-8">
          {config.message}
        </p>
        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </Card>
    </div>
  );
}

export default function InviteErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    }>
      <InviteErrorContent />
    </Suspense>
  );
}
