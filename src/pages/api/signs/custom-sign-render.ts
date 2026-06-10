/**
 * API route: POST /api/signs/custom-sign-render
 * Proxies a custom-sign render request to the ECS render API.
 *
 * Security:
 * - Only POST requests are accepted.
 * - Every element of the request array is validated, not just body[0].
 * - Array length is capped at MAX_RENDER_BATCH_SIZE to prevent mass injection.
 * - A clean, reconstructed payload is forwarded — the raw body is never passed verbatim.
 * - The OAuth token is obtained server-side via oauthTokenService and is
 *   never exposed to the client.
 * - Raw ECS error details are never forwarded to the client.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type {
  CustomSignRenderRequest,
  CustomSignRenderResponse,
} from "../../../types/sign.types";
import { HTTP_STATUS, ECS_CUSTOM_SIGN_PATHS, MAX_PRINT_BATCH_SIZE } from "../../../lib/constants";
import { ECS_API_BASE_URL } from "../../../services/config";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";

/**
 * Returns true if the incoming request uses the POST method.
 *
 * @param {NextApiRequest} req - The incoming Next.js API request.
 * @returns {boolean} True when the method is POST.
 */
function isPostRequest(req: NextApiRequest): boolean {
  return req.method === "POST";
}

/**
 * Validates that productCode is a non-empty string containing only
 * alphanumeric characters to prevent injection attacks.
 *
 * @param {unknown} productCode - Raw productCode value from the request body.
 * @returns {boolean} True when productCode is safe for upstream use.
 */
function isValidProductCode(productCode: unknown): productCode is string {
  if (typeof productCode !== "string") return false;
  const PRODUCT_CODE_PATTERN = /^[A-Za-z0-9-]{1,20}$/;
  return PRODUCT_CODE_PATTERN.test(productCode.trim());
}

/**
 * Validates that storeId is a positive integer.
 *
 * @param {unknown} storeId - Raw storeId value from the request body.
 * @returns {boolean} True when storeId is a valid positive integer.
 */
function isValidStoreId(storeId: unknown): storeId is number {
  return typeof storeId === "number" && Number.isInteger(storeId) && storeId > 0;
}

/**
 * Validates a single render request item. Returns true only when both
 * productCode and storeId pass their respective guards.
 *
 * @param {unknown} item - A single element from the request array.
 * @returns {item is CustomSignRenderRequest} True when the item is valid.
 */
function isValidRenderItem(item: unknown): item is CustomSignRenderRequest {
  if (typeof item !== "object" || item === null) return false;
  const r = item as Partial<CustomSignRenderRequest>;
  return isValidProductCode(r.productCode) && isValidStoreId(r.storeId);
}

/**
 * Handles POST /api/signs/custom-sign-render requests.
 * Obtains an OAuth token, proxies the request to the ECS render endpoint,
 * and returns the base-64 encoded sign image to the client.
 *
 * @param {NextApiRequest} req - Incoming request. Body must contain a
 *   CustomSignRenderRequest array.
 * @param {NextApiResponse<ApiResponse<CustomSignRenderResponse>>} res - Response object.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CustomSignRenderResponse>>
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null as unknown as CustomSignRenderResponse,
    });
    return;
  }

  const rawBody = req.body as unknown;

  if (!Array.isArray(rawBody) || rawBody.length === 0) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Request body must be a non-empty array of render requests.",
      data: null as unknown as CustomSignRenderResponse,
    });
    return;
  }

  if (rawBody.length > MAX_PRINT_BATCH_SIZE) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Request array must not exceed ${MAX_PRINT_BATCH_SIZE} items.`,
      data: null as unknown as CustomSignRenderResponse,
    });
    return;
  }

  const invalidIndex = rawBody.findIndex((item) => !isValidRenderItem(item));
  if (invalidIndex !== -1) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: `Item at index ${invalidIndex} has an invalid productCode or storeId.`,
      data: null as unknown as CustomSignRenderResponse,
    });
    return;
  }

  const validatedBody = rawBody as CustomSignRenderRequest[];

  const sanitisedPayload: CustomSignRenderRequest[] = validatedBody.map((item) => ({
    styleName: String(item.styleName ?? "Default"),
    outputType: String(item.outputType ?? "png"),
    productCode: item.productCode.trim(),
    storeId: item.storeId,
    outputParams: String(item.outputParams ?? ""),
    shapeNameValues: Array.isArray(item.shapeNameValues) ? item.shapeNameValues : [],
  }));

  try {
    const token = await getAccessToken();

    const upstreamRes = await fetchWithTimeout(
      `${ECS_API_BASE_URL}${ECS_CUSTOM_SIGN_PATHS.RENDER}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sanitisedPayload),
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(
        `ECS render API responded with status ${upstreamRes.status}`
      );
    }

    const ecsResponse = (await upstreamRes.json()) as CustomSignRenderResponse;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Custom signs rendered successfully.",
      data: ecsResponse,
    });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to render sign preview.",
      data: null as unknown as CustomSignRenderResponse,
    });
  }
}
