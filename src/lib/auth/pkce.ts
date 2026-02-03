// src/lib/auth/pkce.ts
/**
 * PKCE (Proof Key for Code Exchange) Utilities
 * For secure OAuth 2.0 authorization code flow in public clients
 */

import CryptoJS from 'crypto-js';
import type { PKCEChallenge } from '@/types/auth.types';

/**
 * Generate a random code verifier
 * Must be 43-128 characters, using [A-Z], [a-z], [0-9], "-", ".", "_", "~"
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate a code challenge from the verifier using SHA-256
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = CryptoJS.SHA256(verifier);
  return base64URLEncode(convertWordArrayToUint8Array(hash));
}

/**
 * Generate both verifier and challenge
 */
export function generatePKCEChallenge(): PKCEChallenge {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Convert CryptoJS WordArray to Uint8Array
 */
function convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const u8 = new Uint8Array(sigBytes);
  
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  
  return u8;
}

/**
 * Base64 URL encode (RFC 4648)
 * Replace '+' with '-', '/' with '_', and remove '='
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate a random state parameter for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate a random nonce for ID token validation
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
