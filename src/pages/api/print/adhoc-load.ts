/**
 * API route: POST /api/print/adhoc-load
 * Loads individual sign items into the ECS Print Server SignSink using
 * adhoc-preview-load-data. Used by the Worklist screen to print selected items
 * directly by product code rather than by batch header.
 *
 * Body: { sessionID: string; storeId: string; items: AdhocArg[] }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL, ECS_PRINT_LOCAL_SERVER_URL } from "../../../services/config";

/** Shape of each item sent as args to adhoc-preview-load-data. */
export interface AdhocArg {
  productCode: string;
  description: string;
  productTypeCode: string;
  sellUnitId: string;
  qty: number;
  styleId?: number;
  batchID?: number;
}

interface AdhocLoadRequestBody {
  sessionID?: string;
  storeId?: string;
  items?: unknown[];
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

  const { sessionID, storeId = "", items } = req.body as AdhocLoadRequestBody;

  if (!sessionID) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "sessionID is required." });
    return;
  }
  if (!items?.length) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "items array is required and must not be empty." });
    return;
  }

  try {
    const serverURL = `${ECS_PRINT_LOCAL_SERVER_URL}/ecs/`;

    // Ensure sellUnitId falls back to storeId from the request when the item omits it
    const args = items.map((item) => {
      const i = item as Record<string, unknown>;
      return {
        ...i,
        sellUnitId: (i["sellUnitId"] as string | undefined) ?? storeId,
      };
    });

    const payload = {
      method: "adhoc-preview-load-data",
      sessionID,
      serverURL,
      args,
    };

    // TODO: remove console logging before production
    console.log("[/api/print/adhoc-load] args:", JSON.stringify(args));

    const ecsResponse = await ecsWsCall(ECS_PRINT_WS_URL, payload as Record<string, unknown>);

    // TODO: remove console logging before production
    console.log("[/api/print/adhoc-load] ECS response:", JSON.stringify(ecsResponse));

    res.status(HTTP_STATUS.OK).json({ success: true, _ecsResponse: ecsResponse });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load adhoc sign data.";
    console.error("[/api/print/adhoc-load]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
