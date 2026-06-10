/**
 * API route: POST /api/print/batch-headers
 * Authenticates with the ECS Web Server, then fetches all batch headers for a
 * given store. Used to resolve the jobID required by the print server load step.
 *
 * Body: { storeId: string }
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

interface BatchHeader {
  batchId: number;
  jobID: number;
  batchConfigId: number;
  storeId: string;
  [key: string]: unknown;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { storeId } = req.body as { storeId?: string };

  if (!storeId) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "storeId is required." });
    return;
  }

  try {
    // Step A: log on to ECS web server to get a session token
    const logonUpstream = await fetchWithTimeout(`${ECS_WEB_SERVER_URL}/ecs/logon.sws`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ userName: ECS_WEB_USERNAME, password: ECS_WEB_PASSWORD, apiToken: ECS_WEB_API_TOKEN }]),
    });

    if (!logonUpstream.ok) throw new Error(`ECS logon failed with HTTP ${logonUpstream.status}`);

    const logonData = await logonUpstream.json() as unknown;
    const token = Array.isArray(logonData)
      ? (logonData[0] as Record<string, unknown>)?.token
      : (logonData as Record<string, unknown>)?.token;

    if (!token) throw new Error("No token in ECS logon response");

    // Step B: fetch batch headers using the token
    const upstream = await fetchWithTimeout(`${ECS_WEB_SERVER_URL}/ecs/batchservice-getAllBatches.sws`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName: ECS_WEB_USERNAME, token, storeId }),
    });

    if (!upstream.ok) throw new Error(`Batch headers fetch failed with HTTP ${upstream.status}`);

    const data = await upstream.json() as { batchHeaders?: BatchHeader[] };

    res.status(HTTP_STATUS.OK).json({
      success: true,
      batchHeaders: data.batchHeaders ?? [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch batch headers.";
    console.error("[/api/print/batch-headers]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message,
      debug: {
        targetUrl: `${ECS_WEB_SERVER_URL}/ecs/batchservice-getAllBatches.sws`,
        userName: ECS_WEB_USERNAME,
        storeId,
      },
    });
  }
}
