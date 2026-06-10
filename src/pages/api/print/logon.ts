/**
 * API route: POST /api/print/logon
 * Authenticates with the ECS Web Server and returns a session token.
 * Token is used in subsequent batch-headers calls to identify the caller.
 *
 * Security: credentials are read from server-side env vars only.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";
import {
  ECS_WEB_SERVER_URL,
  ECS_WEB_USERNAME,
  ECS_WEB_PASSWORD,
  ECS_WEB_API_TOKEN,
} from "../../../services/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  if (!ECS_WEB_SERVER_URL) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "ECS_WEB_SERVER_URL is not configured.",
    });
    return;
  }

  try {
    const payload = [{ userName: ECS_WEB_USERNAME, password: ECS_WEB_PASSWORD, apiToken: ECS_WEB_API_TOKEN }];

    const upstream = await fetchWithTimeout(`${ECS_WEB_SERVER_URL}/ecs/logon.sws`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) throw new Error(`ECS web server responded with HTTP ${upstream.status}`);

    const data = await upstream.json() as unknown;
    const token = Array.isArray(data) ? (data[0] as Record<string, unknown>)?.token : (data as Record<string, unknown>)?.token;

    if (!token) throw new Error("No token in ECS logon response");

    res.status(HTTP_STATUS.OK).json({ success: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    console.error("[/api/print/logon]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message,
      debug: {
        targetUrl: `${ECS_WEB_SERVER_URL}/ecs/logon.sws`,
        userName: ECS_WEB_USERNAME,
        hasPassword: !!ECS_WEB_PASSWORD,
        hasApiToken: !!ECS_WEB_API_TOKEN,
      },
    });
  }
}
