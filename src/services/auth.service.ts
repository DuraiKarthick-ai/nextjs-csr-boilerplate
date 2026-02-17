// src/services/auth.service.ts
/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import {
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshTokens as refreshAuthTokens,
  revokeToken,
  getUserInfo as fetchUserInfo,
  buildLogoutUrl,
} from '@/lib/auth/oauth';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { extractUserInfo } from '@/lib/auth/jwt';
import type { UserInfo } from '@/types/auth.types';

class AuthService {
  /**
   * Initiate login flow
   * Redirects to Ping authorization page
   */
  async login(): Promise<void> {
    // Ensure discovery is ready so the first request uses provider endpoints
    try {
      // Dynamically import the oauth helpers to avoid circular imports at module load time
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
      const { ensureDiscoveryReady } = require('@/lib/auth/oauth');
      // Wait (short) for discovery to be fetched
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      await ensureDiscoveryReady();
    } catch (err) {
      // ignore discovery errors — fallbacks will be used
    }

    const authUrl = buildAuthorizationUrl();
    // Helpful debug: print the URL so you can test it directly in a browser
    // eslint-disable-next-line no-console
    console.log('Auth URL:', authUrl);

    // Open in a new tab so dev console and logs remain visible for debugging
    try {
      window.open(authUrl, '_blank');
    } catch (e) {
      // ignore
    }

    // Also navigate current window (normal flow)
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   * Exchange authorization code for tokens
   */
  async handleCallback(code: string, state: string): Promise<UserInfo> {
    try {
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code, state);
      
      // Store tokens
      tokenStorage.setTokens(tokens);

      // Extract user info from ID token
      let userInfo: UserInfo;
      
      if (tokens.id_token) {
        userInfo = extractUserInfo(tokens.id_token);
      } else {
        // If no ID token, fetch from userinfo endpoint
        userInfo = await fetchUserInfo(tokens.access_token);
      }

      return userInfo;
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      
      if (!refreshToken) {
        return false;
      }

      const tokens = await refreshAuthTokens(refreshToken);
      tokenStorage.setTokens(tokens);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Logout user
   * Revokes tokens and clears storage
   */
  async logout(): Promise<void> {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const idToken = tokenStorage.getIdToken();

      // Revoke access token
      if (accessToken) {
        await revokeToken(accessToken, 'access_token');
      }

      // Clear local tokens
      tokenStorage.clearTokens();

      // Redirect to Ping logout (ends Ping session)
      const logoutUrl = buildLogoutUrl(idToken || undefined);
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even if revocation fails
      tokenStorage.clearTokens();
      window.location.href = '/';
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const accessToken = tokenStorage.getAccessToken();
      
      if (!accessToken) {
        return null;
      }

      // Try to get from ID token first
      const idToken = tokenStorage.getIdToken();
      if (idToken) {
        return extractUserInfo(idToken);
      }

      // Otherwise fetch from userinfo endpoint
      return await fetchUserInfo(accessToken);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasValidTokens();
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return tokenStorage.getAccessToken();
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(): boolean {
    return tokenStorage.isTokenExpired();
  }
}

export const authService = new AuthService();
