// src/lib/auth/oauth.ts
/**
 * OAuth 2.0 Utilities for Ping Integration
 */

import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/config/constants';
import { generatePKCEChallenge, generateState, generateNonce } from './pkce';
import type { AuthorizationParams, TokenRequest, TokenResponse } from '@/types/auth.types';

/**
 * Build authorization URL for OAuth 2.0 flow
 */
export function buildAuthorizationUrl(): string {
  // Generate PKCE challenge
  const { codeVerifier, codeChallenge } = generatePKCEChallenge();
  
  // Generate state and nonce
  const state = generateState();
  const nonce = generateNonce();

  // Store code verifier and state in sessionStorage for callback
  sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);

  // Build authorization parameters
  const params: AuthorizationParams = {
    response_type: 'code',
    client_id: env.ping.clientId,
    redirect_uri: env.ping.redirectUri,
    scope: env.ping.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
  };

  // Validate issuer
  const issuer = (env.ping.issuer || '').trim();
  if (!issuer || (!issuer.startsWith('http://') && !issuer.startsWith('https://'))) {
    throw new Error(
      'Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER). Please set a valid https://... issuer URL.'
    );
  }

  // Build URL
  const authUrl = new URL(`${issuer.replace(/\/+$/, '')}/authorize`);
  Object.entries(params).forEach(([key, value]) => {
    authUrl.searchParams.append(key, value);
  });

  return authUrl.toString();
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<TokenResponse> {
  // Verify state parameter
  const savedState = sessionStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  if (state !== savedState) {
    throw new Error('State mismatch - possible CSRF attack');
  }

  // Get code verifier from storage
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  // Build token request
  const tokenRequest: TokenRequest = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.ping.redirectUri,
    client_id: env.ping.clientId,
    code_verifier: codeVerifier,
  };

  // Exchange code for tokens
  const issuer = (env.ping.issuer || '').trim();
  if (!issuer || (!issuer.startsWith('http://') && !issuer.startsWith('https://'))) {
    throw new Error('Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER).');
  }

  const response = await fetch(`${issuer.replace(/\/+$/, '')}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenRequest as any),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for tokens');
  }

  const tokens: TokenResponse = await response.json();

  // Clean up sessionStorage
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_STATE);

  return tokens;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const tokenRequest: TokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: env.ping.clientId,
  };

  const issuer2 = (env.ping.issuer || '').trim();
  if (!issuer2 || (!issuer2.startsWith('http://') && !issuer2.startsWith('https://'))) {
    throw new Error('Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER).');
  }

  const response = await fetch(`${issuer2.replace(/\/+$/, '')}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(tokenRequest as any),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to refresh token');
  }

  return await response.json();
}

/**
 * Revoke token (logout)
 */
export async function revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
  try {
    const issuer3 = (env.ping.issuer || '').trim();
    if (!issuer3 || (!issuer3.startsWith('http://') && !issuer3.startsWith('https://'))) {
      throw new Error('Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER).');
    }

    await fetch(`${issuer3.replace(/\/+$/, '')}/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token,
        token_type_hint: tokenTypeHint,
        client_id: env.ping.clientId,
      }),
    });
  } catch (error) {
    console.error('Failed to revoke token:', error);
    // Don't throw - logout should continue even if revocation fails
  }
}

/**
 * Build logout URL
 */
export function buildLogoutUrl(idToken?: string): string {
  const issuer4 = (env.ping.issuer || '').trim();
  if (!issuer4 || (!issuer4.startsWith('http://') && !issuer4.startsWith('https://'))) {
    throw new Error('Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER).');
  }

  const logoutUrl = new URL(`${issuer4.replace(/\/+$/, '')}/logout`);

  logoutUrl.searchParams.append('client_id', env.ping.clientId);
  logoutUrl.searchParams.append('post_logout_redirect_uri', env.ping.logoutUri);
  
  if (idToken) {
    logoutUrl.searchParams.append('id_token_hint', idToken);
  }

  return logoutUrl.toString();
}

/**
 * Get user info from Ping
 */
export async function getUserInfo(accessToken: string): Promise<any> {
  const issuer5 = (env.ping.issuer || '').trim();
  if (!issuer5 || (!issuer5.startsWith('http://') && !issuer5.startsWith('https://'))) {
    throw new Error('Invalid or missing Ping issuer (NEXT_PUBLIC_PING_ISSUER).');
  }

  const response = await fetch(`${issuer5.replace(/\/+$/, '')}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return await response.json();
}
