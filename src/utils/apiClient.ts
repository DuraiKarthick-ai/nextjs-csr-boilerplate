import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import DOMPurify from "dompurify";

/**
 * Token accessor — will be injected by the ProductsPage component
 * so the interceptor can attach the Bearer token from the shared AuthContext.
 */
let tokenAccessor: (() => Promise<string | null>) | null = null;
let sessionRefresher: (() => Promise<boolean>) | null = null;

export function setTokenAccessor(fn: () => Promise<string | null>): void {
  tokenAccessor = fn;
}

export function setSessionRefresher(fn: () => Promise<boolean>): void {
  sessionRefresher = fn;
}

// ── Create Axios instance ───────────────────────────────────────────

// Client-side requests go through the Signs app's Next.js API proxy
// to avoid CORS issues (the real backend doesn't support browser preflight).
// When running inside the Portal via MFE, we need the full Signs app origin.
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

// ── Request interceptor: attach access token ────────────────────────

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tokenAccessor) {
      const token = await tokenAccessor();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor: sanitize + handle 401 ─────────────────────

apiClient.interceptors.response.use(
  (response) => {
    // Deep-sanitize string values in the response payload
    response.data = sanitize(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // On 401, attempt one silent refresh then retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      sessionRefresher
    ) {
      originalRequest._retry = true;
      const refreshed = await sessionRefresher();
      if (refreshed) {
        // Re-attach updated token
        if (tokenAccessor) {
          const newToken = await tokenAccessor();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
        }
        return apiClient(originalRequest);
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
