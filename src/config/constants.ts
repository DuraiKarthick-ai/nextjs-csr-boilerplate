// src/config/constants.ts
/**
 * Application Constants
 */

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_STATE: 'auth_state',
  CODE_VERIFIER: 'pkce_code_verifier',
  RETURN_URL: 'return_url',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    TOKEN: '/oauth/token',
    REVOKE: '/oauth/revoke',
    USERINFO: '/oauth/userinfo',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
  },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  CALLBACK: '/auth/callback',
  RECEIVE_CHANGE: '/item/receive-change',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Token Configuration
export const TOKEN_CONFIG = {
  // Refresh token 5 minutes before expiry
  REFRESH_BUFFER_MS: 5 * 60 * 1000,
  // Token expiry check interval (1 minute)
  CHECK_INTERVAL_MS: 60 * 1000,
} as const;

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  USER: {
    PROFILE: ['user', 'profile'],
    SETTINGS: ['user', 'settings'],
  },
  // Add more query keys as needed
} as const;

// App Metadata
export const APP_METADATA = {
  NAME: 'Next.js CSR Boilerplate',
  DESCRIPTION: 'Production-ready Next.js boilerplate with Ping authentication',
  VERSION: '1.0.0',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
} as const;
