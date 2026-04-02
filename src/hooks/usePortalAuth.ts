import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthContextType } from "@/types";
import { AUTH_ERRORS, ROUTES, ALLOWED_PORTAL_ORIGINS } from "@/constants/auth";

/**
 * OWASP Fixes applied in this file:
 *
 * A07 Auth: isDev guard on all console.log — no auth state logged in production.
 * A09 Log:  Auth user data (email, roles) never logged in production.
 * A10 SSRF: PORTAL_LOGIN_URL validated against ALLOWED_PORTAL_ORIGINS allowlist.
 */

const isDev = process.env.NODE_ENV === "development";

// ── Singleton resolution ──────────────────────────────────────────

let _portalCtx: React.Context<AuthContextType> | null = null;
let _ctxPromise: Promise<React.Context<AuthContextType> | null> | null = null;

function resolvePortalAuthContext(): Promise<React.Context<AuthContextType> | null> {
  if (_portalCtx) return Promise.resolve(_portalCtx);
  if (!_ctxPromise) {
    _ctxPromise = (async () => {
      try {
        const mod = await import(/* webpackIgnore: true */ "portal/AuthContext");
        const ctx =
          (mod as Record<string, unknown>).AuthContext ??
          (mod as Record<string, unknown>).default;
        if (ctx) {
          if (isDev) console.log("[Signs MFE] portal/AuthContext resolved");
          _portalCtx = ctx as React.Context<AuthContextType>;
          return _portalCtx;
        }
        if (isDev) {
          console.warn("[Signs MFE] portal/AuthContext loaded but no Context found.");
        }
        return null;
      } catch (err) {
        if (isDev) console.warn("[Signs MFE] Standalone mode — portal/AuthContext unavailable", err);
        return null;
      }
    })();
  }
  return _ctxPromise;
}

// ── Fallback (standalone / no Portal) ────────────────────────────

const fallbackAuth: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: AUTH_ERRORS.SESSION_EXPIRED,
  login: () => {},
  logout: async () => {},
  getAccessToken: async () => null,
  refreshSession: async () => false,
};

/**
 * OWASP A10 Fix: Validate the Portal login URL against an allowlist.
 * Prevents open-redirect if env var is misconfigured or tampered.
 */
function buildPortalLoginUrl(): string {
  const raw =
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD ?? "https://erp-portal.costco.com")
      : (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV ?? "http://localhost:3001");

  if (!ALLOWED_PORTAL_ORIGINS.some((origin) => raw.startsWith(origin))) {
    console.error(`[usePortalAuth] PORTAL_LOGIN_URL "${raw}" is not in allowlist — using fallback`);
    return "https://erp-portal.costco.com";
  }
  return raw;
}

export const PORTAL_LOGIN_URL = buildPortalLoginUrl();

// ── Return type ───────────────────────────────────────────────────

export interface PortalAuthResult extends AuthContextType {
  /** true when the Portal host's AuthContext could NOT be resolved (standalone mode). */
  isStandalone: boolean;
  /** true while we're still trying to import the federated context. */
  isResolvingCtx: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────

/**
 * Custom hook that safely reads the Portal's AuthContext.
 * Works both when federated (inside the Portal) and standalone.
 */
export function usePortalAuth(): PortalAuthResult {
  const [ctx, setCtx] = useState<React.Context<AuthContextType> | null>(_portalCtx);
  const [resolved, setResolved] = useState(_portalCtx !== null);

  useEffect(() => {
    let cancelled = false;
    if (!_portalCtx) {
      resolvePortalAuthContext().then((result) => {
        if (!cancelled) {
          if (result) setCtx(result);
          setResolved(true);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // useContext is called unconditionally (Rules of Hooks ✓).
  const DummyContext = useMemo(() => createContext<AuthContextType>(fallbackAuth), []);
  const auth = useContext(ctx ?? DummyContext);

  useEffect(() => {
    if (ctx && isDev) {
      // OWASP A09: Log auth state only in dev — never log user PII in production
      console.log("[Signs MFE] Auth state:", {
        isAuthenticated: auth.isAuthenticated,
        // Only log sub (non-PII) — never log email, name, or roles in prod
        sub: auth.user?.sub ?? null,
      });
    }
  }, [ctx, auth.isAuthenticated, auth.user]);

  return {
    ...auth,
    isStandalone: resolved && ctx === null,
    isResolvingCtx: !resolved,
  };
}

/** Navigate to the login route (used by AuthGate and session-expiry handlers). */
export function redirectToLogin(reason = "unauthenticated"): void {
  if (typeof window !== "undefined") {
    window.location.href = `${ROUTES.LOGIN}?reason=${reason}`;
  }
}
