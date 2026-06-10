/**
 * API route: POST /api/signs/batches
 * Fetches all batch jobs for a given store from the ECS external batch API.
 *
 * Security:
 * - Only POST requests are accepted.
 * - storeId is validated before the upstream request is made.
 * - The OAuth token is obtained server-side via oauthTokenService and is
 *   never exposed to the client.
 * - Response never forwards raw stack traces or upstream error details.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type { BatchItem, GetAllBatchesResponse } from "../../../types/batch.types";
import { BatchStatus } from "../../../types/batch.types";
import { HTTP_STATUS, ECS_BATCH_API_PATHS } from "../../../lib/constants";
import { ECS_API_BASE_URL } from "../../../services/config";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";

/**
 * Raw shape of a single batch item as returned by the ECS get-all-batches endpoint.
 * Field names differ from our internal BatchItem shape.
 */
interface ECSBatchItem {
  batchId: number;
  /** Maps to BatchItem.batchConfigId */
  configId: number;
  batchName: string;
  storeId?: string;
  startDate?: string;
  /** Total signs in the batch. Drives status: > 0 → Ready, 0 → Completed. */
  signQuantity?: number;
  /** Number of signs already printed. */
  printedQuantity?: number;
}

/** Raw envelope returned by the ECS get-all-batches endpoint. */
interface ECSGetAllBatchesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ECSBatchItem[];
}

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
 * Validates that the storeId value from the request body is a non-empty string.
 *
 * @param {unknown} storeId - The raw storeId value from the request body.
 * @returns {boolean} True when storeId is a valid non-empty string.
 */
function isValidStoreId(storeId: unknown): storeId is string {
  return typeof storeId === "string" && storeId.trim().length > 0;
}

/**
 * Handles POST /api/signs/batches requests.
 * Obtains an OAuth token, proxies the request to the ECS get-all-batches
 * endpoint, and returns the batch list to the client.
 *
 * @param {NextApiRequest} req - Incoming request. Body must contain { storeId: string }.
 * @param {NextApiResponse<ApiResponse<GetAllBatchesResponse>>} res - Response object.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<GetAllBatchesResponse>>
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null as unknown as GetAllBatchesResponse,
    });
    return;
  }

  const { storeId } = req.body as { storeId?: unknown };

  if (!isValidStoreId(storeId)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "storeId is required and must be a non-empty string.",
      data: null as unknown as GetAllBatchesResponse,
    });
    return;
  }

  try {
    const token = await getAccessToken();

    const upstreamRes = await fetchWithTimeout(
      `${ECS_API_BASE_URL}${ECS_BATCH_API_PATHS.GET_ALL_BATCHES}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeId: storeId.trim() }),
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(
        `ECS API responded with status ${upstreamRes.status}`
      );
    }

    const ecsResponse = (await upstreamRes.json()) as ECSGetAllBatchesResponse;

    /* Map ECS field names to our internal BatchItem shape. */
    const batches: BatchItem[] = (ecsResponse.data ?? []).map((item) => ({
      batchId: item.batchId,
      batchName: item.batchName,
      storeId: item.storeId ?? storeId.trim(),
      batchConfigId: item.configId,
      status: (item.signQuantity ?? 0) > 0 ? BatchStatus.READY : BatchStatus.COMPLETED,
      signQuantity: item.signQuantity,
      printedQuantity: item.printedQuantity,
    }));

    const data: GetAllBatchesResponse = { batches };

    res.status(HTTP_STATUS.OK).json({ success: true, message: "OK", data });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch batches.",
      data: null as unknown as GetAllBatchesResponse,
    });
  }
}
