/**
 * Centralized auth constants.
 *
 * OWASP A03/A07 Fix: Replaces magic strings like "SESSION_EXPIRED" and
 * "/login?reason=session_expired" scattered across apiClient.ts and
 * usePortalAuth.ts with typed constants. Prevents typos and makes
 * changes a single-file update.
 */

/** Sentinel error messages thrown by AuthTokenService. */
export const AUTH_ERRORS = {
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

/** Application route paths. */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
} as const;

/** Axios request timeout in milliseconds. */
export const API_TIMEOUT_MS = 15_000;

/**
 * OWASP A07 Fix: Maximum number of token refresh attempts before
 * forcing the user back to the login page.
 * Prevents infinite 401 retry loops on broken sessions.
 */
export const MAX_REFRESH_ATTEMPTS = 2;

/**
 * OWASP A10 Fix: Allowlist of trusted Portal origins.
 * Used in middleware and apiClient URL validation.
 */
export const ALLOWED_PORTAL_ORIGINS = [
  "https://erp-portal.costco.com",
  "http://localhost:3000",
  "http://localhost:3001",
] as const;
