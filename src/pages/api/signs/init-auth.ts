/**
 * API route: POST /api/signs/init-auth
 * Pre-warms the server-side OAuth token cache on initial page load.
 *
 * Called by the client on application mount so that the OAuth Bearer token
 * is already cached before any ECS batch API requests are made.
 *
 * Security:
 * - Only POST requests are accepted.
 * - The actual token is NEVER returned to the client.
 * - Only a success/failure status is returned so the browser can confirm
 *   authentication was initialised without exposing credentials.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import { HTTP_STATUS } from "../../../lib/constants";
import { getAccessToken } from "../../../services/oauthTokenService";

/**
 * Returns true if the incoming request uses the POST method.
 *
 * @param {NextApiRequest} req - The incoming Next.js API request.
 * @returns {boolean} True when the method is POST.
 */
function isPostRequest(req: NextApiRequest): boolean {
  return req.method === "POST";
}

/** Shape of the init-auth success response — never exposes the token. */
interface InitAuthData {
  /** Whether the OAuth token was successfully obtained and cached. */
  initialised: boolean;
}

/**
 * Handles POST /api/signs/init-auth.
 * Fetches and caches the OAuth token server-side so subsequent batch API
 * calls can reuse the cached token without an additional round-trip.
 *
 * @param {NextApiRequest} req - Incoming request.
 * @param {NextApiResponse<ApiResponse<InitAuthData>>} res - Response object.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<InitAuthData>>
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: { initialised: false },
    });
    return;
  }

  try {
  console.log("Initializing OAuth token");
  await getAccessToken();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Authentication initialised.",
    data: { initialised: true },
  });
} catch (error) {
  console.error("OAuth token initialization failed:", error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Failed to initialise authentication.",
    data: { initialised: false },
  });
  }
}
