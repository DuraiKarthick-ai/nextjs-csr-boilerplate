import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import DOMPurify from "dompurify";

/**
 * ─── Token Resolution via Module Federation ────────────────────────
 *
 * Instead of manually injecting a tokenAccessor from each component,
 * we dynamically import the Portal's AuthTokenService singleton.
 *
 * AuthTokenService.getToken():
 *   - Returns cached token if still valid
 *   - Transparently calls Portal BFF /api/auth/refresh if expired
 *   - Coalesces concurrent refresh requests (mutex pattern)
 *   - Throws 'SESSION_EXPIRED' when refresh_token is dead
 *
 * This means Remote apps never own any auth logic — the Portal
 * controls the entire token lifecycle.
 * ───────────────────────────────────────────────────────────────────
 */

type GetTokenFn = () => Promise<string>;

let _getToken: GetTokenFn | null = null;
let _resolvePromise: Promise<GetTokenFn> | null = null;

/**
 * Lazily resolve the federated getToken function.
 * Cached after first successful import — subsequent calls are instant.
 */
async function resolveGetToken(): Promise<GetTokenFn> {
  if (_getToken) return _getToken;

  if (!_resolvePromise) {
    _resolvePromise = (async () => {
      try {
        const authService = await import("portal/AuthTokenService");
        console.log("[apiClient] ✅ portal/AuthTokenService imported successfully. Exports:", Object.keys(authService));
        _getToken = authService.getToken;
        return _getToken;
      } catch (err) {
        console.warn(
          "[apiClient] ❌ Failed to import portal/AuthTokenService — running standalone without auth",
          err
        );
        // Standalone fallback: no token
        _getToken = async () => "";
        return _getToken;
      }
    })();
  }

  return _resolvePromise;
}

// ── Create Axios instance ───────────────────────────────────────────

const SIGNS_APP_URL =
  process.env.NEXT_PUBLIC_SIGNS_APP_URL ?? "http://localhost:3001";

const apiClient: AxiosInstance = axios.create({
  baseURL: SIGNS_APP_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor: attach access token from Portal ────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const getToken = await resolveGetToken();
      const token = await getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log first 20 chars + last 10 chars for safety (never log full tokens in prod)
        const masked = token.length > 30
          ? `${token.slice(0, 20)}...${token.slice(-10)}`
          : "(short-token)";
        console.log(`[apiClient] 🔑 Token attached to ${config.method?.toUpperCase()} ${config.url}`, {
          tokenPreview: masked,
          tokenLength: token.length,
        });
      } else {
        console.warn(`[apiClient] ⚠️ No token available for ${config.method?.toUpperCase()} ${config.url}`);
      }
    } catch (err: any) {
      // SESSION_EXPIRED → redirect to Portal login
      if (err?.message === "SESSION_EXPIRED") {
        console.error("[AuthInterceptor] Session expired — redirecting to login");
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=session_expired";
        }
        return Promise.reject(err);
      }
      console.error("[AuthInterceptor] Token acquisition failed:", err);
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: sanitize + handle 401 ─────────────────────

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[apiClient] ✅ Response ${response.status} from ${response.config.url}`, {
      hasAuthHeader: !!response.config.headers?.Authorization,
      dataType: Array.isArray(response.data) ? `array[${response.data.length}]` : typeof response.data,
    });
    // Deep-sanitize string values in the response payload
    response.data = sanitize(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // On 401, force a token refresh via AuthTokenService and retry once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear the cached token so resolveGetToken fetches a fresh one.
        // AuthTokenService.getToken() handles refresh internally —
        // do NOT call useAuth() here (we're outside a React component).
        _getToken = null;
        _resolvePromise = null;

        const getToken = await resolveGetToken();
        const newToken = await getToken();

        if (newToken) {
          console.log("[AuthInterceptor] 🔄 401 retry — refreshed token, retrying request");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }

        console.warn("[AuthInterceptor] 🔄 401 retry — no token after refresh");
      } catch (refreshErr: any) {
        console.error("[AuthInterceptor] 401 retry failed:", refreshErr);
        if (
          refreshErr?.message === "SESSION_EXPIRED" &&
          typeof window !== "undefined"
        ) {
          window.location.href = "/login?reason=session_expired";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ── Sanitizer ───────────────────────────────────────────────────────

/**
 * Recursively sanitize all string values in an object using DOMPurify.
 * Guards against XSS payloads embedded in API responses.
 */
function sanitize<T>(data: T): T {
  if (typeof data === "string") {
    return DOMPurify.sanitize(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(sanitize) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      cleaned[key] = sanitize(value);
    }
    return cleaned as T;
  }
  return data;
}

export default apiClient;
