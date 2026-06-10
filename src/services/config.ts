/**
 * Application-level API configuration.
 * All environment-driven API settings are centralised here to ensure
 * secrets and base URLs are never hardcoded in component or service files.
 *
 * Security: only NEXT_PUBLIC_ prefixed variables are exposed to the client
 * bundle.  Server-only variables (without the prefix) remain private.
 */

/**
 * The base URL for the internal Signs API.
 * Falls back to an empty string so relative paths work during SSR.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * Request timeout in milliseconds for all Axios calls.
 */
export const API_TIMEOUT_MS: number = Number(
  process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 10000
);

/**
 * The internal backend Signs service URL.
 * Security: server-side only — never prefixed with NEXT_PUBLIC_.
 */
export const BACKEND_SIGNS_URL: string =
  process.env.BACKEND_SIGNS_URL ?? "http://localhost:3001";

/**
 * The base URL of the external ECS batch API.
 * Security: server-side only — never prefixed with NEXT_PUBLIC_.
 */
export const ECS_API_BASE_URL: string =
  process.env.ECS_API_BASE_URL ?? "";

/**
 * The default store identifier used in ECS batch API requests.
 * Exposed to the client bundle via the NEXT_PUBLIC_ prefix.
 */
export const DEFAULT_STORE_ID: string =
  process.env.NEXT_PUBLIC_DEFAULT_STORE_ID ?? "51";

// ── ECS Print Server (server-side only) ──────────────────────────────────────

/** ECS Web Server base URL (batch service endpoint). */
export const ECS_WEB_SERVER_URL: string =
  process.env.ECS_WEB_SERVER_URL ?? "";

/** ECS Web Server username for logon. */
export const ECS_WEB_USERNAME: string =
  process.env.ECS_WEB_USERNAME ?? "CostcoWS";

/** ECS Web Server password for logon. */
export const ECS_WEB_PASSWORD: string =
  process.env.ECS_WEB_PASSWORD ?? "";

/** ECS Web Server API token for logon. */
export const ECS_WEB_API_TOKEN: string =
  process.env.ECS_WEB_API_TOKEN ?? "";

/** ECS Print Server base URL. */
export const ECS_PRINT_SERVER_URL: string =
  process.env.ECS_PRINT_SERVER_URL ?? "";

/** ECS Print Server username. */
export const ECS_PRINT_USERNAME: string =
  process.env.ECS_PRINT_USERNAME ?? "ECS";

/** ECS Print Server password. */
export const ECS_PRINT_PASSWORD: string =
  process.env.ECS_PRINT_PASSWORD ?? "";

/** ECS Print Server API token. */
export const ECS_PRINT_API_TOKEN: string =
  process.env.ECS_PRINT_API_TOKEN ?? "";

/** ECS Print Server WebSocket URL (port 8082, used for all print operations except session creation). */
export const ECS_PRINT_WS_URL: string =
  process.env.ECS_PRINT_WS_URL ?? "wss://localhost.ecsglobalinc.com:8082";

