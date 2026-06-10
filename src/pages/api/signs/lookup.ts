/**
 * API route: GET /api/signs/lookup
 * Looks up an item by item number and returns sign-ready data.
 *
 * Security:
 * - Only GET requests are accepted.
 * - itemNumber is validated before forwarding to the backend service.
 * - Response never exposes stack traces.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type { LookupResult } from "../../../types/sign.types";
import { isValidItemNumber } from "../../../lib/validators";
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
 * Handles item number lookup requests.
 *
 * @param {NextApiRequest} req - Incoming request.
 * @param {NextApiResponse<ApiResponse<LookupResult | null>>} res - Response.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LookupResult | null>>
): Promise<void> {
  if (!isGetRequest(req)) {
    res.setHeader("Allow", ["GET"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null,
    });
    return;
  }

  const itemNumber = String(req.query.itemNumber ?? "").trim();

  if (!isValidItemNumber(itemNumber)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Invalid item number format.",
      data: null,
    });
    return;
  }

  try {
    const backendRes = await fetchWithTimeout(
      `${BACKEND_SIGNS_URL}/signs/lookup?itemNumber=${encodeURIComponent(itemNumber)}`
    );

    if (!backendRes.ok) {
      throw new Error(`Backend responded with status ${backendRes.status}`);
    }

    const data: LookupResult = await backendRes.json() as LookupResult;
    res.status(HTTP_STATUS.OK).json({ success: true, message: "OK", data });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to look up item.",
      data: null,
    });
  }
}
