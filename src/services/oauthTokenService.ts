/**
 * Server-side OAuth token management for ECS external API calls.
 *
 * Fetches a client credentials Bearer token and caches it in memory until
 * it nears expiry, then transparently refreshes it.
 *
 * Security:
 * - SIGNS_OAUTH_TOKEN_URL, SIGNS_APIGEE_CLIENT_ID, and SIGNS_APIGEE_CLIENT_SECRET must be set as
 *   server-side environment variables (no NEXT_PUBLIC_ prefix).
 * - This module must NEVER be imported in client-side code.
 * - Credentials are never logged or forwarded to the UI.
 */

/** Shape of an in-memory cached token entry. */
interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

/** Raw shape of a successful OAuth token response. */
interface OAuthTokenResponse {
  access_token: string;
  /** ECS OAuth server returns expires_in as a string (e.g. "3599"). */
  expires_in: string | number;
}

import { fetchWithTimeout } from "../lib/fetchWithTimeout";

/** In-memory token cache; valid for the lifetime of the server process. */
let tokenCache: TokenCache | null = null;

/**
 * In-flight token fetch promise.
 * Shared across concurrent callers so only one OAuth request is made at a time,
 * preventing duplicate token fetches when the cache is cold or near-expiry.
 */
let inflightTokenRequest: Promise<TokenCache> | null = null;

/**
 * Buffer in milliseconds before token expiry at which a proactive refresh is
 * triggered, preventing requests from using a token that is about to expire.
 */
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

/**
 * Reads the OAuth token endpoint URL from the environment.
 *
 * @returns {string} The configured OAuth token URL.
 * @throws {Error} If SIGNS_OAUTH_TOKEN_URL is not set.
 */
function getOAuthTokenUrl(): string {
  const url = process.env.SIGNS_OAUTH_TOKEN_URL;
  if (!url) {
    throw new Error("SIGNS_OAUTH_TOKEN_URL environment variable is not set.");
  }
  return url;
}

/**
 * Reads the OAuth client credentials from the environment.
 *
 * @returns {{ clientId: string; clientSecret: string }} Client ID and secret.
 * @throws {Error} If SIGNS_APIGEE_CLIENT_ID or SIGNS_APIGEE_CLIENT_SECRET are not set.
 */
function getClientCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.SIGNS_APIGEE_CLIENT_ID;
  const clientSecret = process.env.SIGNS_APIGEE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "SIGNS_APIGEE_CLIENT_ID or SIGNS_APIGEE_CLIENT_SECRET environment variables are not set."
    );
  }
  return { clientId, clientSecret };
}

/**
 * Returns true when the cached token is present and not yet near expiry.
 *
 * @returns {boolean} True if the cache holds a still-valid token.
 */
function isCacheValid(): boolean {
  return (
    tokenCache !== null &&
    Date.now() < tokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS
  );
}

/**
 * Requests a fresh OAuth Bearer token from the configured token endpoint
 * using the client credentials grant type.
 *
 * @returns {Promise<TokenCache>} A new token with its absolute expiry timestamp.
 * @throws {Error} If the HTTP request fails or the response is malformed.
 */
async function fetchNewToken(): Promise<TokenCache> {
  const tokenUrl = getOAuthTokenUrl();
  console.log("Fetching OAuth token from:", tokenUrl);
  const { clientId, clientSecret } = getClientCredentials();

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetchWithTimeout(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(
      `OAuth token request failed with status ${response.status}`
    );
  }

  const json = (await response.json()) as OAuthTokenResponse;

  if (!json.access_token) {
    throw new Error("OAuth response did not include an access_token.");
  }

  const expiresInMs = (Number(json.expires_in) || 3600) * 1000;

  return {
    accessToken: json.access_token,
    expiresAt: Date.now() + expiresInMs,
  };
}

/**
 * Returns a valid OAuth Bearer access token for ECS API calls.
 *
 * Serves the cached token when it is still valid. On cache miss or near-expiry,
 * a single refresh request is shared across all concurrent callers via a
 * promise lock — preventing duplicate token fetches (race condition) when the
 * cache is cold or multiple requests arrive simultaneously.
 *
 * Security: the returned token is intended for server-side use only and must
 * never be forwarded to the browser.
 *
 * @returns {Promise<string>} A valid Bearer access token.
 * @throws {Error} If the token cannot be obtained from the OAuth server.
 */
export async function getAccessToken(): Promise<string> {
  if (isCacheValid() && tokenCache) {
    return tokenCache.accessToken;
  }

  if (!inflightTokenRequest) {
    inflightTokenRequest = fetchNewToken()
      .then((cache) => {
        tokenCache = cache;
        inflightTokenRequest = null;
        return cache;
      })
      .catch((err: unknown) => {
        console.error("OAuth token fetch failed:", err);
        inflightTokenRequest = null;
        throw err;
      });
  }

  const resolvedCache = await inflightTokenRequest;
  return resolvedCache.accessToken;
}
