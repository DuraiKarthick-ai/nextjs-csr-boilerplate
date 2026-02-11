// src/lib/auth/oauth.ts
/**
 * OAuth 2.0 Utilities for Ping Integration
 * Single-file testing build: configuration is defined inline below.
 */

import { STORAGE_KEYS } from '@/config/constants';
import { generatePKCEChallenge, generateState, generateNonce } from './pkce';
import type { AuthorizationParams, TokenRequest, TokenResponse } from '@/types/auth.types';

/* -------------------------------------------------------------------------- */
/*                         INLINE CONFIG (for testing)                         */
/* -------------------------------------------------------------------------- */
const PING_CONFIG = {
  issuer: 'https://loginnp.costco.com', // public
  clientId: '5c246b05-ddfa-45f2-a8e5-61623873c1c2', // public
  scope: 'openid profile email', // public

  // If you always deploy to a fixed domain, hardcode it:
  redirectUri:
    'https://nextjs-csr-boilerplate-1079957950495.asia-south1.run.app/auth/login',
  logoutUri:
    'https://nextjs-csr-boilerplate-1079957950495.asia-south1.run.app/',
} as const;

/** Small helper to normalize issuer and ensure http(s) */
function normalizeIssuer(raw: string): string {
  const issuer = (raw || '').trim();
  if (!issuer || (!issuer.startsWith('http://') && !issuer.startsWith('https://'))) {
    throw new Error(
      'Invalid or missing Ping issuer. Please set a valid https://... issuer URL.'
    );
  }
  return issuer.replace(/\/+$/, '');
}

/* -------------------------------------------------------------------------- */
/*                             AUTHORIZATION URL                               */
/* -------------------------------------------------------------------------- */
export function buildAuthorizationUrl(): string {
  // PKCE bits
  const { codeVerifier, codeChallenge } = generatePKCEChallenge();
  const state = generateState();
  const nonce = generateNonce();

  // Persist state for callback verification
  sessionStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.AUTH_STATE, state);

  const params: AuthorizationParams = {
    response_type: 'code',
    client_id: PING_CONFIG.clientId,
    redirect_uri: PING_CONFIG.redirectUri,
    scope: PING_CONFIG.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
  };

  const base = normalizeIssuer(PING_CONFIG.issuer);
  const authUrl = new URL(`${base}/authorize`);
  Object.entries(params).forEach(([key, value]) => authUrl.searchParams.append(key, value));
  return authUrl.toString();
}

/* -------------------------------------------------------------------------- */
/*                       EXCHANGE AUTH CODE FOR TOKENS                         */
/* -------------------------------------------------------------------------- */
export async function exchangeCodeForTokens(
  code: string,
  state: string
): Promise<TokenResponse> {
  // CSRF check
  const savedState = sessionStorage.getItem(STORAGE_KEYS.AUTH_STATE);
  if (state !== savedState) throw new Error('State mismatch - possible CSRF attack');

  // PKCE verifier
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  if (!codeVerifier) throw new Error('Code verifier not found');

  const tokenRequest: TokenRequest = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: PING_CONFIG.redirectUri,
    client_id: PING_CONFIG.clientId,
    code_verifier: codeVerifier,
  };

  const base = normalizeIssuer(PING_CONFIG.issuer);
  const response = await fetch(`${base}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(tokenRequest as any),
  });

  if (!response.ok) {
    let errorText = 'Failed to exchange code for tokens';
    try {
      const error = await response.json();
      errorText = error.error_description || errorText;
    } catch { /* fall back to generic */ }
    throw new Error(errorText);
  }

  const tokens: TokenResponse = await response.json();

  // Clean up
  sessionStorage.removeItem(STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_STATE);

  return tokens;
}

/* -------------------------------------------------------------------------- */
/*                               REFRESH TOKENS                                */
/* -------------------------------------------------------------------------- */
export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const tokenRequest: TokenRequest = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: PING_CONFIG.clientId,
  };

  const base = normalizeIssuer(PING_CONFIG.issuer);
  const response = await fetch(`${base}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(tokenRequest as any),
  });

  if (!response.ok) {
    let errorText = 'Failed to refresh token';
    try {
      const error = await response.json();
      errorText = error.error_description || errorText;
    } catch { /* ignore */ }
    throw new Error(errorText);
  }

  return await response.json();
}

/* -------------------------------------------------------------------------- */
/*                                REVOKE TOKEN                                 */
/* -------------------------------------------------------------------------- */
export async function revokeToken(
  token: string,
  tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'
): Promise<void> {
  try {
    const base = normalizeIssuer(PING_CONFIG.issuer);
    await fetch(`${base}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token,
        token_type_hint: tokenTypeHint,
        client_id: PING_CONFIG.clientId,
      }),
    });
  } catch (error) {
    console.error('Failed to revoke token:', error);
    // Don't throw — logout should continue even if revocation fails
  }
}

/* -------------------------------------------------------------------------- */
/*                                LOGOUT URL                                   */
/* -------------------------------------------------------------------------- */
export function buildLogoutUrl(idToken?: string): string {
  const base = normalizeIssuer(PING_CONFIG.issuer);
  const logoutUrl = new URL(`${base}/logout`);

  logoutUrl.searchParams.append('client_id', PING_CONFIG.clientId);
  logoutUrl.searchParams.append('post_logout_redirect_uri', PING_CONFIG.logoutUri);
  if (idToken) logoutUrl.searchParams.append('id_token_hint', idToken);

  return logoutUrl.toString();
}

/* -------------------------------------------------------------------------- */
/*                                 USER INFO                                   */
/* -------------------------------------------------------------------------- */
export async function getUserInfo(accessToken: string): Promise<any> {
  const base = normalizeIssuer(PING_CONFIG.issuer);
  const response = await fetch(`${base}/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch user info');
  return await response.json();
}