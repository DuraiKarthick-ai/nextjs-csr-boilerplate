/**
 * API route: POST /api/print/load-batch
 * Loads a batch into the ECS Print Server SignSink using batchSign-preview.
 * Must be called before get-layouts-from-sink or preview-first.
 *
 * Body: { sessionID: string; jobID: number; batchID: number; sellUnitId?: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL } from "../../../services/config";

const DEFAULT_SELL_UNIT_ID = "106";

interface LoadBatchRequestBody {
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
 * POST /api/print/load-batch
 * Calls batchSign-preview on the ECS WebSocket service to load the specified batch
 * into the SignSink session, making layouts available for preview and printing.
 *
 * @param {NextApiRequest} req - Request body: { sessionID, jobID, batchID, sellUnitId? }
 * @param {NextApiResponse} res - JSON response: { success, _sentToECS, _ecsResponse }
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

  const { sessionID, jobID, batchID, sellUnitId = DEFAULT_SELL_UNIT_ID } = req.body as LoadBatchRequestBody;

  if (!sessionID || jobID === undefined || batchID === undefined) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID, jobID, and batchID are required." });
    return;
  }

  try {
    const batchPayload = {
      method: "batchSign-preview",
      sessionID,
      args: [{
        drillDownLevel: 0,
        printStatus: "0",
        batchHeader: {
          jobID,
          batchID,
          sellUintId: sellUnitId,
          hasPrintPermission: true,
          doNotReprint: false,
          printedQty: 0,
          qty: 1,
        },
      }],
    };

    const ecsResponse = await ecsWsCall(ECS_PRINT_WS_URL, batchPayload as Record<string, unknown>);

    // TODO: remove console logging before production
    console.log("[load-batch] batchSign-preview response:", JSON.stringify(ecsResponse));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      _sentToECS: {
        url: ECS_PRINT_WS_URL,
        payload: { ...batchPayload, sessionID: "(sessionID)" },
      },
      _ecsResponse: ecsResponse,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load batch into SignSink.";
    // TODO: remove console logging before production
    console.error("[/api/print/load-batch]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
