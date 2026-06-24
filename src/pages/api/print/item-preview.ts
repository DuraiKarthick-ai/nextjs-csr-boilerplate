/**
 * API route: POST /api/print/item-preview
 *
 * Returns the ECS preview image for a single sign at a given position
 * within a batch. Called per-click from the Worklist Preview button.
 *
 * Flow:
 *   1. create-session  → HTTPS to ECS port 8083
 *   2. batchSign-preview → WSS to ECS port 8082 — loads batch into SignSink
 *   3. preview-first     → WSS — image for sign at position 0
 *   4. preview-next × position → WSS — navigate to the requested position
 *
 * Body:    { jobID: number; batchID: number; position: number; storeId?: string }
 * Returns: { success: true; previewImage: string }  (base64 PNG)
 */

import https from "node:https";
import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import {
  ECS_PRINT_SERVER_URL,
  ECS_PRINT_WS_URL,
  ECS_WEB_USERNAME,
  ECS_WEB_PASSWORD,
  ECS_WEB_API_TOKEN,
  ECS_WEB_SERVER_URL,
} from "../../../services/config";

const DEFAULT_SELL_UNIT_ID = "106";

interface ItemPreviewRequestBody {
  jobID?: number;
  batchID?: number;
  position?: number;
  storeId?: string;
}

function httpsPost(
  url: string,
  body: Record<string, unknown>,
  timeoutMs = 15_000
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const bodyStr = JSON.stringify(body);
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname || "/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
        },
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
        res.on("end", () => {
          try { resolve(JSON.parse(raw) as Record<string, unknown>); }
          catch { reject(new Error(`ECS session response not JSON: ${raw.slice(0, 200)}`)); }
        });
      }
    );
    req.on("timeout", () => { req.destroy(); reject(new Error(`ECS request timed out after ${timeoutMs}ms`)); });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
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

  const { jobID, batchID, position = 0, storeId = DEFAULT_SELL_UNIT_ID } = req.body as ItemPreviewRequestBody;

  if (jobID === undefined || batchID === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "jobID and batchID are required." });
    return;
  }

  try {
    // Step 1 — create-session (HTTPS to ECS port 8083)
    const sessionPayload = {
      method: "create-session",
      userName: ECS_WEB_USERNAME,
      password: ECS_WEB_PASSWORD,
      apiToken: ECS_WEB_API_TOKEN,
      serverURL: `${ECS_WEB_SERVER_URL.replace(/:443$/, "")}/ecs/`,
    };
    const sessionData = await httpsPost(`${ECS_PRINT_SERVER_URL}/`, sessionPayload);
    const sessionID = sessionData.sessionID as string | undefined;
    if (!sessionID) throw new Error("No sessionID returned by ECS");

    // Step 2 — batchSign-preview: load batch into SignSink (WSS port 8082)
    await ecsWsCall(ECS_PRINT_WS_URL, {
      method: "batchSign-preview",
      sessionID,
      args: [{
        drillDownLevel: 0,
        printStatus: "0",
        batchHeader: { jobID, batchID, sellUintId: storeId, hasPrintPermission: true, doNotReprint: false, printedQty: 0, qty: 1 },
      }],
    });

    // Step 3 — preview-first: image for sign at position 0
    const firstRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-first", sessionID });
    let image = (firstRes.data ?? firstRes.Data) as string | undefined;

    // Step 4 — preview-next × position: navigate to the requested position
    for (let i = 0; i < position; i++) {
      const nextRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-next", sessionID });
      image = (nextRes.data ?? nextRes.Data) as string | undefined;
    }

    if (!image) throw new Error("No preview image returned from ECS");

    res.status(HTTP_STATUS.OK).json({ success: true, previewImage: image });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load sign preview.";
    console.error("[/api/print/item-preview]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
