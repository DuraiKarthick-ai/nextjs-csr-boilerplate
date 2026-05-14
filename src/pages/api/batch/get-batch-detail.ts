import type { NextApiRequest, NextApiResponse } from "next";

const BATCH_API_BASE_URL =
  process.env.BATCH_API_BASE_URL ?? "http://34.133.77.6:8080/api/v1/ecs/batch";

const ALLOWED_BATCH_API_ORIGINS = [
  "http://34.133.77.6:8080",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://localhost:3001",
];

/**
 * Proxies get-batch-detail server-side to avoid browser CORS preflight failures.
 */
export default async function getBatchDetailHandler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, message: "Method Not Allowed" });
    return;
  }

  const isAllowed = ALLOWED_BATCH_API_ORIGINS.some((origin) => BATCH_API_BASE_URL.startsWith(origin));
  if (!isAllowed) {
    res.status(503).json({ success: false, message: "Invalid batch API configuration" });
    return;
  }

  try {
    const upstream = await fetch(`${BATCH_API_BASE_URL}/get-batch-detail`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body ?? {}),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch {
    res.status(502).json({ success: false, message: "Failed to reach batch API" });
  }
}
