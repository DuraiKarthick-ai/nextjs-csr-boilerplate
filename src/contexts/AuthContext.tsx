// src/contexts/AuthContext.tsx
'use client';

/**
 * Authentication Context
 * Manages authentication state and provides auth methods
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { TOKEN_CONFIG } from '@/config/constants';
import type { AuthState, AuthContextType } from '@/types/auth.types';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  idToken: null,
  expiresAt: null,
  error: null,
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  /**
   * Initialize authentication state
   */
  const initialize = useCallback(async () => {
    try {
      // Check if we have valid tokens
      if (tokenStorage.hasValidTokens()) {
        const user = await authService.getCurrentUser();
        
        if (user) {
          const tokens = tokenStorage.getAllTokens();
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            idToken: tokens.idToken,
            expiresAt: tokens.expiresAt,
            error: null,
          });
          return;
        }
      }

      // No valid tokens
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to initialize authentication',
      }));
    }
  }, []);

  /**
   * Login - Redirect to Ping
   */
  const login = useCallback(() => {
    authService.login();
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await authService.logout();
      setState(initialState);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();
      
      if (success) {
        const tokens = tokenStorage.getAllTokens();
        setState((prev) => ({
          ...prev,
          accessToken: tokens.accessToken,
          expiresAt: tokens.expiresAt,
        }));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  /**
   * Handle OAuth callback
   */
  const handleCallback = useCallback(async (code: string, state: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      
      const user = await authService.handleCallback(code, state);
      const tokens = tokenStorage.getAllTokens();
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        idToken: tokens.idToken,
        expiresAt: tokens.expiresAt,
        error: null,
      });
    } catch (error) {
      console.error('Callback error:', error);
      setState({
        ...initialState,
        isLoading: false,
        error: 'Failed to complete login',
      });
      throw error;
    }
  }, []);

  /**
   * Auto-refresh token before expiration
   */
  useEffect(() => {
    if (!state.isAuthenticated || !state.expiresAt) {
      return;
    }

    const checkAndRefresh = async () => {
      const timeUntilExpiry = state.expiresAt! - Date.now();
      
      // If token expires within buffer time, refresh it
      if (timeUntilExpiry <= TOKEN_CONFIG.REFRESH_BUFFER_MS) {
        const success = await refreshAccessToken();
        
        if (!success) {
          // Refresh failed, logout user
          await logout();
          toast.error('Session expired. Please login again.');
        }
      }
    };

    // Check immediately
    checkAndRefresh();

    // Set up interval to check periodically
    const interval = setInterval(checkAndRefresh, TOKEN_CONFIG.CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.expiresAt, refreshAccessToken, logout]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshAccessToken,
    handleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
