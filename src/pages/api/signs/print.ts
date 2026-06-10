/**
 * API route: POST /api/signs/print
 * Accepts a print request and forwards it to the backend print service.
 *
 * Security:
 * - Only POST requests are accepted.
 * - Payload is validated before forwarding to the backend.
 * - Never exposes internal error details to the client.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type { PrintRequest, PrintResponse } from "../../../types/sign.types";
import { isValidQuantity } from "../../../lib/validators";
import { HTTP_STATUS } from "../../../lib/constants";
import { BACKEND_SIGNS_URL } from "../../../services/config";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";

/**
 * Returns true if the request method is POST.
 *
 * @param {NextApiRequest} req - The incoming request.
 * @returns {boolean} True when method is POST.
 */
function isPostRequest(req: NextApiRequest): boolean {
  return req.method === "POST";
}

/**
 * Handles sign print submission.
 *
 * @param {NextApiRequest} req - Incoming request.
 * @param {NextApiResponse<ApiResponse<PrintResponse | null>>} res - Response.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PrintResponse | null>>
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null,
    });
    return;
  }

  const body = req.body as Partial<PrintRequest>;

  if (!Array.isArray(body.signIds) || body.signIds.length === 0) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "signIds must be a non-empty array.",
      data: null,
    });
    return;
  }

  if (!isValidQuantity(body.quantity ?? 0)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Invalid quantity.",
      data: null,
    });
    return;
  }

  try {
    const backendRes = await fetchWithTimeout(`${BACKEND_SIGNS_URL}/signs/print`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
      throw new Error(`Backend responded with status ${backendRes.status}`);
    }

    const data: PrintResponse = await backendRes.json() as PrintResponse;
    res.status(HTTP_STATUS.OK).json({ success: true, message: "Print submitted.", data });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to submit print request.",
      data: null,
    });
  }
}
