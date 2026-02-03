// src/lib/auth/jwt.ts
/**
 * JWT Utilities
 */

import { jwtDecode } from 'jwt-decode';
import type { DecodedToken, UserInfo } from '@/types/auth.types';

/**
 * Decode JWT token
 */
export function decodeToken(token: string): DecodedToken {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    throw new Error('Invalid token format');
  }
}

/**
 * Extract user info from ID token
 */
export function extractUserInfo(idToken: string): UserInfo {
  const decoded = decodeToken(idToken);
  
  return {
    sub: decoded.sub,
    email: decoded.email || '',
    email_verified: decoded.email_verified,
    name: decoded.name,
    given_name: decoded.given_name,
    family_name: decoded.family_name,
    preferred_username: decoded.preferred_username,
    picture: decoded.picture,
  };
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string, bufferSeconds: number = 300): boolean {
  try {
    const decoded = decodeToken(token);
    const now = Date.now() / 1000; // Convert to seconds
    return decoded.exp <= now + bufferSeconds;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpiration(token: string): number | null {
  try {
    const decoded = decodeToken(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}

/**
 * Validate token structure and claims
 */
export function validateToken(token: string, expectedIssuer?: string, expectedAudience?: string): boolean {
  try {
    const decoded = decodeToken(token);
    
    // Check expiration
    if (isTokenExpired(token, 0)) {
      return false;
    }
    
    // Check issuer if provided
    if (expectedIssuer && decoded.iss !== expectedIssuer) {
      return false;
    }
    
    // Check audience if provided
    if (expectedAudience) {
      const audiences = Array.isArray(decoded.aud) ? decoded.aud : [decoded.aud];
      if (!audiences.includes(expectedAudience)) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}
