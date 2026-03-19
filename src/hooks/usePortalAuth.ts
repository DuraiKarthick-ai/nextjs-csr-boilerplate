import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthContextType } from "@/types";

/* ── Portal auth bridge ────────────────────────────────────────────
 *
 * Lazily resolves the Portal host's AuthContext (a raw React.Context
 * object) via Module Federation, then exposes it through a normal
 * React hook so any component in this MFE can consume it.
 *
 * Usage:
 *   import { usePortalAuth } from "@/hooks/usePortalAuth";
 *   const auth = usePortalAuth();
 * ─────────────────────────────────────────────────────────────────── */

// ── Singleton resolution ──────────────────────────────────────────

let _portalCtx: React.Context<AuthContextType> | null = null;
let _ctxPromise: Promise<React.Context<AuthContextType> | null> | null = null;

function resolvePortalAuthContext(): Promise<React.Context<AuthContextType> | null> {
  if (_portalCtx) return Promise.resolve(_portalCtx);
  if (!_ctxPromise) {
    _ctxPromise = (async () => {
      try {
        const mod = await import("portal/AuthContext");
        const ctx =
          (mod as any).AuthContext ?? // named export
          (mod as any).default; // default export
        if (ctx) {
          console.log(
            "[Signs MFE] ✅ portal/AuthContext resolved (React.Context object)"
          );
          _portalCtx = ctx as React.Context<AuthContextType>;
          return _portalCtx;
        }
        console.warn(
          "[Signs MFE] ⚠️ portal/AuthContext module loaded but no Context object found. Exports:",
          Object.keys(mod)
        );
        return null;
      } catch (err) {
        console.warn(
          "[Signs MFE] ❌ Could not import portal/AuthContext — standalone mode",
          err
        );
        return null;
      }
    })();
  }
  return _ctxPromise;
}

// ── Fallback (standalone / no Portal) ─────────────────────────────

const fallbackAuth: AuthContextType = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: "Portal auth unavailable",
  login: () => {},
  logout: async () => {},
  getAccessToken: async () => null,
  refreshSession: async () => false,
};

/** The Portal URL — used to redirect when running standalone. */
export const PORTAL_LOGIN_URL =
  process.env.NODE_ENV === "production"
    ? (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_PROD ?? "https://erp-portal.costco.com")
    : (process.env.NEXT_PUBLIC_PORTAL_REMOTE_URL_DEV ?? "https://localhost:3001");

// ── Return type ───────────────────────────────────────────────────

export interface PortalAuthResult extends AuthContextType {
  /**
   * `true` when the Portal host's AuthContext could NOT be resolved
   * (i.e. the MFE is running on its own, outside the Portal shell).
   */
  isStandalone: boolean;
  /** `true` while we're still trying to import the federated context. */
  isResolvingCtx: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────

/**
 * Custom hook that safely reads the Portal's AuthContext.
 * Works both when federated (inside the Portal) and standalone.
 *
 * Internally uses `React.useContext` on the dynamically-resolved
 * Context object — no Rules-of-Hooks violations.
 */
export function usePortalAuth(): PortalAuthResult {
  const [ctx, setCtx] = useState<React.Context<AuthContextType> | null>(
    _portalCtx
  );
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
  // When ctx is null we pass a dummy context whose default value is the fallback.
  const DummyContext = useMemo(
    () => createContext<AuthContextType>(fallbackAuth),
    []
  );

  const auth = useContext(ctx ?? DummyContext);

  useEffect(() => {
    if (ctx) {
      console.log("[Signs MFE] 🔑 Auth state from portal context:", {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user,
        hasGetAccessToken: typeof auth.getAccessToken === "function",
      });
    }
  }, [ctx, auth.isAuthenticated, auth.user, auth.getAccessToken]);

  return {
    ...auth,
    isStandalone: resolved && ctx === null,
    isResolvingCtx: !resolved,
  };
}
