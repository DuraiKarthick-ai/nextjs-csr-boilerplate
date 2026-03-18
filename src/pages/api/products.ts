import type { NextApiRequest, NextApiResponse } from "next";
import type { SignItem } from "@/types";

/**
 * Real backend URL from the Postman collection.
 * Override with SIGNS_API_BASE_URL env var if the IP changes.
 */
const SIGNS_API_URL =
  process.env.SIGNS_API_BASE_URL ?? "http://34.149.59.244";

/** Basic-auth credentials matching Postman collection. */
const BASIC_AUTH = "YWRtaW46YWRtaW4NCg==";

/**
 * GET /api/products
 *
 * Proxies to the real Signs backend.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ── CORS: allow Portal (or any allowed origin) to call this route ──
  const allowedOrigin =
    process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(`${SIGNS_API_URL}/api/v1/signs/items`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${BASIC_AUTH}`,
        Host: "api.signs.com",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      throw new Error(`Upstream ${upstream.status}`);
    }

    const data: SignItem[] = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({
      error: "Failed to fetch items from Signs backend",
      upstream: `${SIGNS_API_URL}/api/v1/signs/items`,
      message,
    });
  }
}
