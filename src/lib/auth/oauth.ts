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
    'https://nextjs-csr-boilerplate-1079957950495.asia-south1.run.app/auth/callback',
  logoutUri:
    'https://nextjs-csr-boilerplate-1079957950495.asia-south1.run.app/',
} as const;

/**
 * Resolve redirect URI at runtime.
 * Priority:
 *  1. NEXT_PUBLIC_AUTH_REDIRECT env var (useful for local dev)
 *  2. window.location.origin + '/auth/callback' when running in browser
 *  3. fallback to PING_CONFIG.redirectUri
 */
function getRedirectUri(): string {
  // Use Next.js public env var if provided
  const envRedirect = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_AUTH_REDIRECT as string | undefined) : undefined;
  if (envRedirect) return envRedirect;

  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return PING_CONFIG.redirectUri;
}

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

/*
  Discovery fetch: try to load the provider's .well-known/openid-configuration
  in the background on module import. When available, we'll prefer discovery
  endpoints (authorization_endpoint, token_endpoint, revocation_endpoint,
  userinfo_endpoint, end_session_endpoint). If discovery is not available
  we fallback to known Ping paths.
*/
let discovery: any | null = null;
let discoveryPromise: Promise<any> | null = null;

function startDiscoveryFetch() {
  if (discoveryPromise) return discoveryPromise;

  try {
    const base = normalizeIssuer(PING_CONFIG.issuer);
    const url = `${base}/.well-known/openid-configuration`;
    discoveryPromise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch discovery');
        return res.json();
      })
      .then((json) => {
        discovery = json;
        return discovery;
      })
      .catch((err) => {
        // Keep discovery as null on errors; fallbacks will be used
        // eslint-disable-next-line no-console
        console.warn('OIDC discovery failed, using fallbacks:', err?.message || err);
        discovery = null;
        return null;
      });

    return discoveryPromise;
  } catch (err) {
    discovery = null;
    return Promise.resolve(null);
  }
}

// Start fetching immediately so it's likely available when user clicks login
startDiscoveryFetch();

// Exported helper so callers can await discovery being loaded (useful for first-time login)
export function ensureDiscoveryReady(): Promise<any> {
  return discoveryPromise || Promise.resolve(discovery);
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
    redirect_uri: getRedirectUri(),
    scope: PING_CONFIG.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
  };

  const base = normalizeIssuer(PING_CONFIG.issuer);
  // Ping uses /as/authorization.oauth2 for the authorization endpoint
  const authEndpoint = (discovery && discovery.authorization_endpoint) || `${base}/as/authorization.oauth2`;
  const authUrl = new URL(authEndpoint);
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
    redirect_uri: getRedirectUri(),
    client_id: PING_CONFIG.clientId,
    code_verifier: codeVerifier,
  };

  const base = normalizeIssuer(PING_CONFIG.issuer);
  // Prefer discovery token endpoint when available
  const tokenEndpoint = (discovery && discovery.token_endpoint) || `${base}/as/token.oauth2`;
  const response = await fetch(tokenEndpoint, {
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
  const tokenEndpoint = (discovery && discovery.token_endpoint) || `${base}/as/token.oauth2`;
  // Ping token endpoint for refresh
  const response = await fetch(tokenEndpoint, {
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
    const revokeEndpoint = (discovery && discovery.revocation_endpoint) || `${base}/as/revoke_token.oauth2`;
    // Ping revoke endpoint
    await fetch(revokeEndpoint, {
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
  // Prefer discovery end_session_endpoint when available
  const logoutEndpoint = (discovery && discovery.end_session_endpoint) || `${base}/idp/init_logout.openid`;
  const logoutUrl = new URL(logoutEndpoint);

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
  const userInfoEndpoint = (discovery && discovery.userinfo_endpoint) || `${base}/idp/userinfo.openid`;
  // Ping userinfo endpoint
  const response = await fetch(userInfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) throw new Error('Failed to fetch user info');
  return await response.json();
}