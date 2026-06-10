/**
 * Wraps the native fetch with an AbortController timeout.
 *
 * If the upstream server does not respond within timeoutMs, the request is
 * aborted and an error is thrown. This prevents hung Node.js connections from
 * exhausting the server's connection pool and causing GKE pod failures when an
 * external service becomes unreachable.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} options - Standard fetch options (method, headers, body, …).
 * @param {number} timeoutMs - Milliseconds before the request is aborted. Defaults to 10 000.
 * @returns {Promise<Response>} The fetch response.
 * @throws {Error} If the request times out or the network call fails.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 10_000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
