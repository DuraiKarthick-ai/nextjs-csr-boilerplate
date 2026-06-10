/**
 * API route: POST /api/print/load-preview
 *
 * Flow (mirrors print-final ecs-step.ts):
 *   1. batchSign-preview → ECS WSS (port 8082) — loads batch; response contains sinkSize
 *   2. preview-first     → ECS WSS (port 8082) — image for sign 0
 *   3. preview-next × (sinkSize - 1) → images for signs 1…N-1
 *
 * serverURL is established in create-session only — NOT re-sent in subsequent calls.
 *
 * Body: { sessionID: string; jobID: number; batchID: number; sellUnitId?: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL } from "../../../services/config";

const DEFAULT_SELL_UNIT_ID = "51";

interface LoadPreviewRequestBody {
  sessionID?: string;
  jobID?: number;
  batchID?: number;
  sellUnitId?: string;
}

/**
 * Checks whether the incoming request uses the POST method.
 * @param {NextApiRequest} req - The incoming API request.
 * @returns {boolean} True if the request method is POST.
 */
function isPostRequest(req: NextApiRequest): boolean {
  return req.method === "POST";
}

/**
 * POST /api/print/load-preview
 * Loads a batch into the ECS SignSink and collects all sign preview images
 * by calling preview-first and preview-next sequentially over WSS.
 *
 * @param {NextApiRequest} req - Request body: { sessionID, jobID, batchID, sellUnitId? }
 * @param {NextApiResponse} res - JSON response: { success, previewImages, _sentToECS }
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { sessionID, jobID, batchID, sellUnitId = DEFAULT_SELL_UNIT_ID } = req.body as LoadPreviewRequestBody;

  if (!sessionID || jobID === undefined || batchID === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID, jobID, and batchID are required." });
    return;
  }

  try {
    // Step 1 — batchSign-preview: load batch, get sinkSize
    const batchRes = await ecsWsCall(ECS_PRINT_WS_URL, {
      method: "batchSign-preview",
      sessionID,
      args: [{
        drillDownLevel: 0,
        printStatus: "0",
        batchHeader: { jobID, batchID, sellUintId: sellUnitId, hasPrintPermission: true, doNotReprint: false, printedQty: 0, qty: 1 },
      }],
    });

    const sinkSize = typeof batchRes.sinkSize === "number" ? (batchRes.sinkSize as number) : 1;
    // TODO: remove console logging before production
    console.log(`[load-preview] batchSign-preview OK — sinkSize: ${sinkSize}`);

    // Step 2 — preview-first: image for sign 0
    const previewImages: string[] = [];

    const firstRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-first", sessionID });
    const firstImg = (firstRes.data ?? firstRes.Data) as string | undefined;
    if (firstImg) previewImages.push(firstImg);

    // Steps 3…N — preview-next: remaining signs
    for (let i = 1; i < sinkSize; i++) {
      const nextRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-next", sessionID });
      const nextImg = (nextRes.data ?? nextRes.Data) as string | undefined;
      if (nextImg) previewImages.push(nextImg);
    }

    if (previewImages.length === 0) {
      throw new Error("No preview images returned — check server logs for ECS response keys");
    }

    // TODO: remove console logging before production
    console.log(`[load-preview] collected ${previewImages.length} of ${sinkSize} images`);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      previewImages,
      _sentToECS: {
        step1: { url: ECS_PRINT_WS_URL, payload: { method: "batchSign-preview", sessionID: "(sessionID)", args: [{ batchHeader: { jobID, batchID } }] } },
        step2: { url: ECS_PRINT_WS_URL, payload: { method: "preview-first + preview-next ×" + (sinkSize - 1), sessionID: "(sessionID)" } },
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load sign previews.";
    // TODO: remove console logging before production
    console.error("[load-preview]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
