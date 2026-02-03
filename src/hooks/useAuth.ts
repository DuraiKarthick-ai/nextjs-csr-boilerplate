// src/hooks/useAuth.ts
/**
 * Authentication Hooks
 * Re-export useAuth from context and provide additional helpers
 */

export { useAuth } from '@/contexts/AuthContext';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ROUTES } from '@/config/constants';

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { user } = useAuthContext();
  
  // Assuming roles are stored in user object
  // Adjust based on your actual user structure
  const roles = (user as any)?.roles || [];
  return roles.includes(role);
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { user } = useAuthContext();
  
  const userRoles = (user as any)?.roles || [];
  return roles.some((role) => userRoles.includes(role));
}

/**
 * Hook to check if user has all specified roles
 */
export function useHasAllRoles(roles: string[]): boolean {
  const { user } = useAuthContext();
  
  const userRoles = (user as any)?.roles || [];
  return roles.every((role) => userRoles.includes(role));
}

/**
 * Hook to redirect if already authenticated
 * Useful for login page
 */
export function useRedirectIfAuthenticated(redirectTo: string = ROUTES.DASHBOARD) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return { isAuthenticated, isLoading };
}
