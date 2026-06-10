/**
 * API route: GET /api/signs/worklist-summary
 * Returns aggregated worklist counts for the dashboard widget.
 *
 * Security:
 * - Only GET requests are accepted.
 * - Proxies to the backend; internal errors are never exposed.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type { WorklistSummaryData } from "../../../types/worklist.types";
import { HTTP_STATUS } from "../../../lib/constants";
import { BACKEND_SIGNS_URL } from "../../../services/config";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";

/**
 * Returns true if the request method is GET.
 *
 * @param {NextApiRequest} req - The incoming request.
 * @returns {boolean} True when method is GET.
 */
function isGetRequest(req: NextApiRequest): boolean {
  return req.method === "GET";
}

/**
 * Handles the worklist summary request for the dashboard widget.
 *
 * @param {NextApiRequest} req - Incoming request.
 * @param {NextApiResponse<ApiResponse<WorklistSummaryData>>} res - Response.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<WorklistSummaryData>>
): Promise<void> {
  if (!isGetRequest(req)) {
    res.setHeader("Allow", ["GET"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null as unknown as WorklistSummaryData,
    });
    return;
  }

  try {
    const backendRes = await fetchWithTimeout(
      `${BACKEND_SIGNS_URL}/signs/worklist/summary`
    );

    if (!backendRes.ok) {
      throw new Error(`Backend responded with ${backendRes.status}`);
    }

    const data = (await backendRes.json()) as ApiResponse<WorklistSummaryData>;
    res.status(HTTP_STATUS.OK).json(data);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "OK (dev fallback)",
        data: {
          totalItems: 10,
          pendingItems: 2,
          printedItems: 8,
          failedItems: 0,
          approvedItems: 8,
        },
      });
      return;
    }

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Worklist summary service is currently unavailable.",
      data: null as unknown as WorklistSummaryData,
    });
  }
}
