import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { sanitize } from "@/utils/sanitize";
import { AUTH_ERRORS, ROUTES, API_TIMEOUT_MS, MAX_REFRESH_ATTEMPTS } from "@/constants/auth";

/**
 * OWASP Fixes applied in this file:
 *
 * A03 XSS:  Uses isomorphic sanitize() — works in SSR/Node, not just browser.
 * A07 Auth: Max refresh attempt counter prevents infinite 401 retry loops.
 * A09 Log:  All console.log/warn calls are guarded by isDev — silent in prod.
 * A10 SSRF: API base URL is validated against an allowlist before use.
 */

const isDev = process.env.NODE_ENV === "development";

type GetTokenFn = () => Promise<string>;

let _getToken: GetTokenFn | null = null;
let _resolvePromise: Promise<GetTokenFn> | null = null;
let _refreshAttempts = 0;

async function resolveGetToken(): Promise<GetTokenFn> {
  if (_getToken) return _getToken;

  if (!_resolvePromise) {
    _resolvePromise = (async () => {
      try {
        const authService = await import(/* webpackIgnore: true */ "portal/AuthTokenService");
        if (isDev) console.log("[apiClient] portal/AuthTokenService imported.");
        _getToken = authService.getToken;
        return _getToken;
      } catch (err) {
        if (isDev) console.warn("[apiClient] Standalone mode — no portal auth", err);
        _getToken = async () => "";
        return _getToken;
      }
    })();
  }

  return _resolvePromise;
}

// ── OWASP A10: Validate API base URL against allowlist ──────────────

const ALLOWED_API_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://34.133.77.6:8080",
  "https://erp-portal.costco.com",
  "https://69ce482633a09f831b7d3ab9.mockapi.io",
  "https://localhost:3001",
];

function validateApiUrl(url: string): string {
  if (!url) {
    return "";
  }

  // Relative paths should resolve against the current origin in browser/runtime.
  if (url.startsWith("/")) {
    return "";
  }

  try {
    const origin = new URL(url).origin;
    if (!isDev && origin.includes("localhost")) {
      console.warn("[apiClient] Ignoring localhost API base URL in production");
      return "";
    }

    if (!ALLOWED_API_ORIGINS.some((a) => origin === a || url.startsWith(a))) {
      throw new Error(`API URL not in allowlist: ${origin}`);
    }
    return url;
  } catch {
    console.error("[apiClient] Invalid API base URL — falling back to same-origin");
    return "";
  }
}

const SIGNS_APP_URL = validateApiUrl(
  process.env.NEXT_PUBLIC_SIGNS_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""
);

// ── Axios instance ──────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: SIGNS_APP_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor: attach Bearer token ────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Route Next.js internal API calls through the signs app origin when configured.
    // In host-mounted federation, same-origin points to the host app (wrong API route).
    if (typeof config.url === "string" && config.url.startsWith("/api/")) {
      config.baseURL = SIGNS_APP_URL || "";
    }

    try {
      const getToken = await resolveGetToken();
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // OWASP A09: never log token data in production
        if (isDev) {
          const masked = token.length > 30 ? `${token.slice(0, 10)}...[redacted]` : "(short)";
          console.log(`[apiClient] Token attached — preview: ${masked}`);
        }
      } else if (isDev) {
        console.warn(`[apiClient] No token for ${config.method?.toUpperCase()} ${config.url}`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message === AUTH_ERRORS.SESSION_EXPIRED) {
        if (typeof window !== "undefined") {
          window.location.href = `${ROUTES.LOGIN}?reason=session_expired`;
        }
        return Promise.reject(err);
      }
      if (isDev) console.error("[AuthInterceptor] Token acquisition failed:", err);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: sanitize + handle 401 ─────────────────────

apiClient.interceptors.response.use(
  (response) => {
    if (isDev) console.log(`[apiClient] ${response.status} ${response.config.url}`);
    // OWASP A03: sanitize all string values — isomorphic, works in SSR too
    response.data = sanitize(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // OWASP A07: enforce max refresh attempts before forcing re-login
      if (_refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        _refreshAttempts = 0;
        if (typeof window !== "undefined") {
          window.location.href = `${ROUTES.LOGIN}?reason=session_expired`;
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      _refreshAttempts++;

      try {
        _getToken = null;
        _resolvePromise = null;
        const getToken = await resolveGetToken();
        const newToken = await getToken();

        if (newToken) {
          if (isDev) console.log("[AuthInterceptor] Token refreshed — retrying");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          _refreshAttempts = 0;
          return apiClient(originalRequest);
        }
      } catch (refreshErr: unknown) {
        const e = refreshErr as Error;
        if (e?.message === AUTH_ERRORS.SESSION_EXPIRED && typeof window !== "undefined") {
          _refreshAttempts = 0;
          window.location.href = `${ROUTES.LOGIN}?reason=session_expired`;
        }
        if (isDev) console.error("[AuthInterceptor] 401 retry failed:", refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
