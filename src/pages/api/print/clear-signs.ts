/**
 * API route: POST /api/print/clear-signs
 * Clears the existing print queue on the ECS Print Server SignSink.
 * Must be called before batchSign-preview to avoid stale layouts from previous jobs.
 *
 * Body: { sessionID: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL } from "../../../services/config";

interface ClearSignsRequestBody {
  sessionID?: string;
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

  const { sessionID } = req.body as ClearSignsRequestBody;

  if (!sessionID) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID is required." });
    return;
  }

  try {
    const payload = { method: "clear-signs", sessionID };
    const data = await ecsWsCall(ECS_PRINT_WS_URL, payload);

    // TODO: remove console logging before production
    console.log("[/api/print/clear-signs] ECS response:", JSON.stringify(data));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      _sentToECS: { url: ECS_PRINT_WS_URL, payload: { ...payload, sessionID: "(sessionID)" } },
      _ecsResponse: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to clear print queue.";
    console.error("[/api/print/clear-signs]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
