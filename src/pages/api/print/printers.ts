/**
 * API route: POST /api/print/printers
 * Returns the list of printers available on the ECS Print Server.
 *
 * Body: { sessionID: string }
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

  const { sessionID } = req.body as { sessionID?: string };

  if (!sessionID) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID is required." });
    return;
  }

  try {
    const data = await ecsWsCall(ECS_PRINT_WS_URL, { method: "get-printers", sessionID });

    // TODO: remove console logging before production
    console.log("[/api/print/printers] raw ECS response:", JSON.stringify(data));

    // ECS may return printers under various key casings
    const printers =
      (data.printers as string[] | undefined) ??
      (data.Printers as string[] | undefined) ??
      [];

    res.status(HTTP_STATUS.OK).json({
      success: true,
      printers,
      _raw: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch printers.";
    console.error("[/api/print/printers]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
