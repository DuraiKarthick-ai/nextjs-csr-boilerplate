// src/lib/auth/tokenStorage.ts
/**
 * Token Storage Utility
 * Manages secure in-memory token storage
 * Note: Tokens are NOT persisted in localStorage for security
 */

import type { TokenResponse } from '@/types/auth.types';

// In-memory token storage
class TokenStorage {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private idToken: string | null = null;
  private expiresAt: number | null = null;

  /**
   * Store tokens from OAuth response
   */
  setTokens(tokens: TokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || null;
    this.idToken = tokens.id_token || null;
    
    // Calculate expiration time (current time + expires_in seconds)
    this.expiresAt = Date.now() + tokens.expires_in * 1000;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Get ID token
   */
  getIdToken(): string | null {
    return this.idToken;
  }

  /**
   * Get token expiration time
   */
  getExpiresAt(): number | null {
    return this.expiresAt;
  }

  /**
   * Check if access token is expired or about to expire
   * @param bufferMs - Buffer time in milliseconds (default: 5 minutes)
   */
  isTokenExpired(bufferMs: number = 5 * 60 * 1000): boolean {
    if (!this.expiresAt) return true;
    return Date.now() >= this.expiresAt - bufferMs;
  }

  /**
   * Check if we have valid tokens
   */
  hasValidTokens(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.idToken = null;
    this.expiresAt = null;
  }

  /**
   * Update only the access token (used during refresh)
   */
  updateAccessToken(accessToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.expiresAt = Date.now() + expiresIn * 1000;
  }

  /**
   * Get all tokens as an object
   */
  getAllTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    idToken: string | null;
    expiresAt: number | null;
  } {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      idToken: this.idToken,
      expiresAt: this.expiresAt,
    };
  }
}

// Export singleton instance
export const tokenStorage = new TokenStorage();
