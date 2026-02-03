// src/components/auth/ProtectedRoute.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/constants';
import { LoadingPage } from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps pages that require authentication
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  redirectTo = ROUTES.LOGIN,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      // Store the current URL to redirect back after login
      sessionStorage.setItem('returnUrl', window.location.pathname);
      router.push(redirectTo);
      return;
    }

    // Check for required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = (user as any)?.roles || [];
      const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRequiredRole) {
        router.push(ROUTES.UNAUTHORIZED);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRoles, redirectTo, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingPage text="Verifying authentication..." />;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return <LoadingPage text="Redirecting..." />;
  }

  // Check roles
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = (user as any)?.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return <LoadingPage text="Checking permissions..." />;
    }
  }

  return <>{children}</>;
}
