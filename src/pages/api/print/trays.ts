/**
 * API route: POST /api/print/trays
 * Returns the list of paper trays for a specific printer on the ECS Print Server.
 *
 * Body: { sessionID: string; printer: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL } from "../../../services/config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { sessionID, printer } = req.body as { sessionID?: string; printer?: string };

  if (!sessionID || !printer) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID and printer are required." });
    return;
  }

  try {
    const data = await ecsWsCall(ECS_PRINT_WS_URL, { method: "get-trays", args: printer, sessionID });

    // TODO: remove console logging before production
    console.log("[/api/print/trays] raw ECS response:", JSON.stringify(data));

    // ECS may return trays under various key casings
    const trays =
      (data.trays as string[] | undefined) ??
      (data.Trays as string[] | undefined) ??
      [];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      trays,
      _raw: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch trays.";
    console.error("[/api/print/trays]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
