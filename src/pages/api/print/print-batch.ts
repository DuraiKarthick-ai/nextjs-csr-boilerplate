/**
 * API route: POST /api/print/print-batch
 * Retrieves layouts from the ECS Print Server SignSink and sends each to the
 * specified printer and tray.
 *
 * Must be called after /api/print/load-batch has loaded the batch into SignSink.
 *
 * Body: { sessionID: string; printer: string; tray: string }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL } from "../../../services/config";

const ECS_PRINT_TIMEOUT_MS = 60_000;
const PRINT_PAGE_FROM = "1";
const PRINT_PAGE_TO = "9999";

interface Layout {
  layoutID_1: string;
  layoutID_Count: number;
}

interface PrintBatchRequestBody {
  sessionID?: string;
  printer?: string;
  tray?: string;
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
 * POST /api/print/print-batch
 * Calls get-layouts-from-sink to retrieve layout IDs from the active SignSink
 * session, then calls print-signs-for-layout for each layout to dispatch the
 * print job to the specified printer and tray over WSS.
 *
 * @param {NextApiRequest} req - Request body: { sessionID, printer, tray }
 * @param {NextApiResponse} res - JSON response: { success, layoutCount }
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

  const { sessionID, printer, tray } = req.body as PrintBatchRequestBody;

  if (!sessionID || !printer || !tray) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID, printer, and tray are required." });
    return;
  }

  try {
    // Step 1: get layouts from SignSink
    const layoutsPayload = { method: "get-layouts-from-sink", sessionID };
    const layoutsData = await ecsWsCall(ECS_PRINT_WS_URL, layoutsPayload);

    // ECS may return layouts under various key casings or as a top-level array
    const layouts: Layout[] = (
      (layoutsData.layouts as Layout[] | undefined) ??
      (layoutsData.Layouts as Layout[] | undefined) ??
      (Array.isArray(layoutsData) ? layoutsData as Layout[] : undefined) ??
      []
    );

    // TODO: remove console logging before production
    console.log(`[print-batch] get-layouts-from-sink — ${layouts.length} layout(s):`, JSON.stringify(layouts));

    if (layouts.length === 0) throw new Error(`No layouts found in SignSink. ECS response: ${JSON.stringify(layoutsData)}`);

    // Step 2: print each layout — collect sent payloads for browser logging
    const printPayloads: Record<string, unknown>[] = [];
    for (const layout of layouts) {
      const printPayload = {
        method: "print-signs-for-layout",
        args: { ID: layout.layoutID_1, PRINTER: printer, daily: tray, PAGE_FROM: PRINT_PAGE_FROM, PAGE_TO: PRINT_PAGE_TO },
        sessionID,
      };
      printPayloads.push({ ...printPayload, sessionID: "(sessionID)" });
      await ecsWsCall(ECS_PRINT_WS_URL, printPayload, ECS_PRINT_TIMEOUT_MS);
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      layoutCount: layouts.length,
      _sentToECS: {
        getLayouts: {
          url: ECS_PRINT_WS_URL,
          payload: { ...layoutsPayload, sessionID: "(sessionID)" },
          response: layoutsData,
        },
        printLayouts: printPayloads.map((p) => ({ url: ECS_PRINT_WS_URL, payload: p })),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to print batch.";
    // TODO: remove console logging before production
    console.error("[/api/print/print-batch]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
