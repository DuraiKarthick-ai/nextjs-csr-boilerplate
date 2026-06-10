/**
 * API route: GET /api/signs/worklist
 * Returns a paginated list of worklist items with optional filters.
 *
 * POST /api/signs/worklist/print is handled separately.
 *
 * Security:
 * - Only GET requests are accepted on this handler.
 * - All query params are type-coerced; no raw passthrough.
 * - Internal errors are never exposed in the response body.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { PaginatedResponse } from "../../../types/common.types";
import type { WorklistItem } from "../../../types/worklist.types";
import { HTTP_STATUS, DEFAULT_PAGE_SIZE } from "../../../lib/constants";
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
 * Handles paginated worklist item requests.
 *
 * @param {NextApiRequest} req - Incoming request.
 * @param {NextApiResponse<PaginatedResponse<WorklistItem> | { success: boolean; message: string }>} res - Response.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    PaginatedResponse<WorklistItem> | { success: boolean; message: string }
  >
): Promise<void> {
  if (!isGetRequest(req)) {
    res.setHeader("Allow", ["GET"]);
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json({ success: false, message: "Method not allowed." });
    return;
  }

  const rawPage = parseInt(String(req.query.page ?? ""), 10);
  const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage);

  const rawPageSize = parseInt(String(req.query.pageSize ?? ""), 10);
  const pageSize = Number.isNaN(rawPageSize) ? DEFAULT_PAGE_SIZE : Math.max(1, rawPageSize);

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  const allowedFilters = [
    "department",
    "status",
    "printStatus",
    "dateFrom",
    "dateTo",
    "searchTerm",
  ] as const;

  allowedFilters.forEach((key) => {
    const value = req.query[key];
    if (typeof value === "string" && value) {
      params.set(key, value);
    }
  });

  try {
    const backendRes = await fetchWithTimeout(
      `${BACKEND_SIGNS_URL}/signs/worklist?${params.toString()}`
    );

    if (!backendRes.ok) {
      throw new Error(`Backend responded with status ${backendRes.status}`);
    }

    const data: PaginatedResponse<WorklistItem> =
      await backendRes.json() as PaginatedResponse<WorklistItem>;
    res.status(HTTP_STATUS.OK).json(data);
  } catch {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to fetch worklist." });
  }
}
