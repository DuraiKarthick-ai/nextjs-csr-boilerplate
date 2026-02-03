// src/types/auth.types.ts
/**
 * Authentication Type Definitions
 */

// OAuth Token Response from Ping
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  scope: string;
}

// Decoded JWT Token
export interface DecodedToken {
  sub: string; // Subject (user ID)
  iss: string; // Issuer
  aud: string | string[]; // Audience
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time
  email?: string;
  name?: string;
  preferred_username?: string;
  [key: string]: any; // Additional custom claims
}

// User Information from ID Token or UserInfo endpoint
export interface UserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  [key: string]: any;
}

// Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number | null; // Unix timestamp
  error: string | null;
}

// PKCE Code Challenge
export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}

// OAuth Authorization Parameters
export interface AuthorizationParams {
  response_type: 'code';
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  code_challenge: string;
  code_challenge_method: 'S256';
  nonce?: string;
}

// OAuth Token Request
export interface TokenRequest {
  grant_type: 'authorization_code' | 'refresh_token';
  code?: string;
  redirect_uri?: string;
  client_id: string;
  code_verifier?: string;
  refresh_token?: string;
}

// Auth Context Type
export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  handleCallback: (code: string, state: string) => Promise<void>;
}

// Auth Error Types
export type AuthErrorType =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope'
  | 'server_error'
  | 'temporarily_unavailable'
  | 'access_denied'
  | 'state_mismatch'
  | 'token_expired'
  | 'unknown_error';

export interface AuthError {
  type: AuthErrorType;
  message: string;
  description?: string;
}
