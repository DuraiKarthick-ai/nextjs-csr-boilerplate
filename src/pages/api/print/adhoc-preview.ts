/**
 * API route: POST /api/print/adhoc-preview
 *
 * Loads individual sign items into the ECS SignSink using adhoc-preview-load-data,
 * then collects all sign preview images for PDF download.
 *
 * Flow:
 *   1. adhoc-preview-load-data → loads items into SignSink, returns sinkSize
 *   2. preview-first           → image for sign 0
 *   3. preview-next × (N-1)   → images for signs 1…N-1
 *
 * Body:    { sessionID: string; storeId: string; items: AdhocArg[] }
 * Returns: { success: true; previewImages: string[] }
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { HTTP_STATUS } from "../../../lib/constants";
import { ecsWsCall } from "../../../lib/ecsWebSocket";
import { ECS_PRINT_WS_URL, ECS_PRINT_LOCAL_SERVER_URL } from "../../../services/config";
import type { AdhocArg } from "./adhoc-load";

interface AdhocPreviewRequestBody {
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

  const { sessionID, storeId = "", items } = req.body as AdhocPreviewRequestBody;

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

    const args = items.map((item) => {
      const i = item as Record<string, unknown>;
      return { ...i, sellUnitId: (i["sellUnitId"] as string | undefined) ?? storeId };
    });

    // Step 1 — adhoc-preview-load-data: load items into SignSink
    const adhocRes = await ecsWsCall(ECS_PRINT_WS_URL, {
      method: "adhoc-preview-load-data",
      sessionID,
      serverURL,
      args,
    } as Record<string, unknown>);

    // Resolve sinkSize from the ECS response, fall back to item count
    const sinkSize =
      typeof adhocRes.sinkSize === "number" ? adhocRes.sinkSize :
      typeof adhocRes.SinkSize === "number" ? adhocRes.SinkSize :
      (items as AdhocArg[]).length;

    // Step 2 — preview-first: image for sign 0
    const previewImages: string[] = [];

    const firstRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-first", sessionID });
    const firstImg = (firstRes.data ?? firstRes.Data) as string | undefined;
    if (firstImg) previewImages.push(firstImg);

    // Step 3 — preview-next: remaining signs
    for (let i = 1; i < sinkSize; i++) {
      const nextRes = await ecsWsCall(ECS_PRINT_WS_URL, { method: "preview-next", sessionID });
      const nextImg = (nextRes.data ?? nextRes.Data) as string | undefined;
      if (nextImg) previewImages.push(nextImg);
    }

    if (previewImages.length === 0) {
      throw new Error("No preview images returned from ECS");
    }

    res.status(HTTP_STATUS.OK).json({ success: true, previewImages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate sign previews.";
    console.error("[/api/print/adhoc-preview]", message);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message });
  }
}
