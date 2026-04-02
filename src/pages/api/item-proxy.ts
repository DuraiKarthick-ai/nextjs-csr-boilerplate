/**
 * OWASP A02 Fix — Item API Proxy
 *
 * The Item API requires Basic Auth credentials. These credentials must NEVER
 * be sent to the browser (no NEXT_PUBLIC_ prefix).
 *
 * This Next.js API route acts as a server-side proxy:
 *   Browser → /api/item-proxy → Item API (with server-side Basic Auth)
 *
 * The browser only ever sees the proxy URL — never the credentials or the
 * real Item API URL.
 */

import type { NextApiRequest, NextApiResponse } from "next";

/** OWASP A07: Rate limit — max requests per IP per minute. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;

  return false;
}

export default async function itemProxy(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET for now (extend for POST when needed)
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  // ── OWASP A07: Rate limiting ─────────────────────────────────
  const ip = (req.headers["x-forwarded-for"] as string) ?? req.socket.remoteAddress ?? "unknown";
  if (isRateLimited(ip)) {
    res.status(429).json({ error: "Too Many Requests" });
    return;
  }

  // ── Server-only credentials (never exposed to browser) ───────
  const itemApiUrl = process.env.ITEM_API_BASE_URL;
  const username = process.env.ITEM_API_USERNAME;
  const password = process.env.ITEM_API_PASSWORD;

  if (!itemApiUrl || !username || !password) {
    console.error("[item-proxy] Missing Item API env vars — check server configuration");
    res.status(503).json({ error: "Service temporarily unavailable" });
    return;
  }

  // ── OWASP A10: Validate that itemApiUrl is an expected host ──
  const ALLOWED_ITEM_API_HOSTS = [
    "https://item-api.example.com",
    "http://localhost:3001",
  ];

  if (!ALLOWED_ITEM_API_HOSTS.some((h) => itemApiUrl.startsWith(h))) {
    console.error(`[item-proxy] ITEM_API_BASE_URL not in allowlist: ${itemApiUrl}`);
    res.status(503).json({ error: "Service configuration error" });
    return;
  }

  try {
    const credentials = Buffer.from(`${username}:${password}`).toString("base64");
    // Forward query params from the browser request
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const targetUrl = `${itemApiUrl}/items${queryString ? `?${queryString}` : ""}`;

    const upstream = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Upstream error" });
      return;
    }

    const data = await upstream.json();

    // Pass upstream cache headers through to clients
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) res.setHeader("Cache-Control", cacheControl);

    res.status(200).json(data);
  } catch (err) {
    console.error("[item-proxy] Upstream fetch failed:", err);
    res.status(502).json({ error: "Bad Gateway" });
  }
}
