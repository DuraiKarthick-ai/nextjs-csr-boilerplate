"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingPage } from '@/components/common/Loading';
import { ErrorDisplay } from '@/components/common/ErrorBoundary';
import { ROUTES } from '@/config/constants';

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get code and state from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for error from OAuth provider
        if (errorParam) {
          setError(errorDescription || errorParam);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setError('Missing required parameters');
          return;
        }

        // Handle the callback
        await handleCallback(code, state);

        // Get return URL or default to dashboard
        const returnUrl = sessionStorage.getItem('returnUrl') || ROUTES.DASHBOARD;
        sessionStorage.removeItem('returnUrl');

        // Redirect to return URL
        router.push(returnUrl);
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message || 'Failed to complete login');
      }
    };

    processCallback();
  }, [searchParams, handleCallback, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorDisplay
          title="Authentication Error"
          message={error}
          onRetry={() => router.push(ROUTES.LOGIN)}
        />
      </div>
    );
  }

  return <LoadingPage text="Completing login..." />;
}
