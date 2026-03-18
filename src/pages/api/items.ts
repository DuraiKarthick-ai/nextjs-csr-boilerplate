import http from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import type { SignItem } from "@/types";

/**
 * Real backend URL from the Postman collection.
 * Override with SIGNS_API_BASE_URL env var if the IP changes.
 */
const SIGNS_API_URL = process.env.SIGNS_API_BASE_URL ?? "http://34.149.59.244";

/**
 * Optional: override full items URL (useful if the upstream routing rules change).
 * Example: http://34.149.59.244/api/v1/signs/items
 */
const SIGNS_ITEMS_URL =
  process.env.SIGNS_ITEMS_URL ?? `${SIGNS_API_URL}/api/v1/signs/items`;

/** Basic-auth credentials matching Postman collection. */
const BASIC_AUTH = Buffer.from("admin:admin").toString("base64");

/**
 * GET /api/items
 *
 * Proxies to the real Signs backend items API:
 *   GET {SIGNS_API_URL}/api/v1/signs/items
 *
 * Why this exists:
 * - Browsers will do CORS preflight (OPTIONS) when calling the backend directly.
 * - This Next.js API route runs server-side, so it can call the backend without CORS issues.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ── CORS: allow Portal (or any allowed origin) to call this route ──
  const allowedOrigin = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3000";
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
    const upstreamUrl = new URL(SIGNS_ITEMS_URL);
    const upstreamData = await new Promise<string>((resolve, reject) => {
      const request = http.request(
        {
          host: upstreamUrl.hostname,
          port: upstreamUrl.port ? Number(upstreamUrl.port) : 80,
          path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
          method: "GET",
          headers: {
            Host: "api.signs.com",
            Authorization: `Basic ${BASIC_AUTH}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "User-Agent": "curl/8.16.0",
          },
          timeout: 10_000,
        },
        (upstreamRes) => {
          let body = "";
          upstreamRes.setEncoding("utf8");
          upstreamRes.on("data", (chunk) => {
            body += chunk;
          });
          upstreamRes.on("end", () => {
            if ((upstreamRes.statusCode ?? 500) < 200 || (upstreamRes.statusCode ?? 500) >= 300) {
              reject(
                new Error(
                  `Upstream ${upstreamRes.statusCode}: ${body || "(empty body)"}`
                )
              );
              return;
            }
            resolve(body);
          });
        }
      );

      request.on("timeout", () => {
        request.destroy(new Error("Upstream timeout"));
      });
      request.on("error", reject);
      request.end();
    });

    // Backend response shape is { success, message, data: SignItem[] }
    const parsed = JSON.parse(upstreamData) as unknown;
    const items =
      parsed && typeof parsed === "object" && "data" in parsed
        ? (parsed as { data: SignItem[] }).data
        : (parsed as SignItem[]);

    return res.status(200).json(items ?? []);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(502).json({
      error: "Failed to fetch items from Signs backend",
      upstream: SIGNS_ITEMS_URL,
      message,
    });
  }
}
