/**
 * API route: POST /api/signs/batch-detail
 * Fetches the detailed item list for a specific batch from the ECS external API.
 *
 * Security:
 * - Only POST requests are accepted.
 * - All required payload fields are validated before the upstream request is made.
 * - The OAuth token is obtained server-side via oauthTokenService and is
 *   never exposed to the client.
 * - Response never forwards raw stack traces or upstream error details.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "../../../types/common.types";
import type { BatchDetailRequest, BatchDetailResponse, BatchDetailItem } from "../../../types/batch.types";
import { HTTP_STATUS, ECS_BATCH_API_PATHS } from "../../../lib/constants";
import { SIGNS_API_BASE_URL } from "../../../services/config";
import { getAccessToken } from "../../../services/oauthTokenService";
import { fetchWithTimeout } from "../../../lib/fetchWithTimeout";

/** Raw item shape returned by the ECS get-batch-detail endpoint. */
interface ECSBatchDetailItem {
  "Item Number": string;
  "Item Name": string | null;
  "Dept": string | null;
  "Category": string | null;
  "Change Reason": string | null;
  "Valid From": string;
  isPrinted: boolean;
}

/** Raw data block nested inside the ECS get-batch-detail response envelope. */
interface ECSBatchDetailData {
  batchId: number;
  itemDetails: ECSBatchDetailItem[];
}

/** Full ECS response envelope for get-batch-detail. */
interface ECSBatchDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ECSBatchDetailData;
  timestamp: string;
}

/** Default sign size used when the ECS API does not provide one. */
const DEFAULT_SIGN_SIZE = "1" as const;

/** Default copies count used when the ECS API does not provide one. */
const DEFAULT_COPIES = 1 as const;

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
 * Validates that all required batch detail payload fields are present and
 * have the correct types.
 *
 * @param {unknown} body - The raw request body.
 * @returns {body is BatchDetailRequest} True when the body is a valid BatchDetailRequest.
 */
function isValidBatchDetailRequest(body: unknown): body is BatchDetailRequest {
  if (typeof body !== "object" || body === null) return false;

  const b = body as Record<string, unknown>;

  return (
    typeof b.batchId === "number" &&
    typeof b.storeId === "string" &&
    b.storeId.trim().length > 0 &&
    typeof b.batchConfigId === "number" &&
    typeof b.batchName === "string" &&
    b.batchName.trim().length > 0
  );
}

/**
 * Converts a date string from MM/DD/YYYY format to YYYY-MM-DD (ISO 8601).
 * Returns the original string unchanged if the format is unrecognised.
 *
 * @param {string} dateStr - The date string in MM/DD/YYYY format.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
function convertToISODate(dateStr: string): string {
  const parts = dateStr.split("/");
  const month = parts[0];
  const day = parts[1];
  const year = parts[2];
  if (!month || !day || !year) return dateStr;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Maps a raw ECS batch detail item to the internal BatchDetailItem shape.
 * Fields absent from the ECS response default to empty string or the defined
 * constant defaults (signSize = "1", copies = 1).
 *
 * @param {ECSBatchDetailItem} item - The raw ECS item to map.
 * @returns {BatchDetailItem} The normalised internal item.
 */
function mapECSItemToDetailItem(item: ECSBatchDetailItem): BatchDetailItem {
  return {
    itemNumber: item["Item Number"] ?? "",
    description: item["Item Name"] ?? "",
    department: item["Dept"] ?? "",
    changeReason: item["Change Reason"] ?? "",
    effectiveDate: convertToISODate(item["Valid From"] ?? ""),
    printStatus: item.isPrinted ? "PRINTED" : "PENDING",
    signSize: DEFAULT_SIGN_SIZE,
    copies: DEFAULT_COPIES,
  };
}

/**
 * Handles POST /api/signs/batch-detail requests.
 * Obtains an OAuth token, proxies the request to the ECS get-batch-detail
 * endpoint, maps the ECS response to the internal BatchDetailResponse shape,
 * and returns the result to the client.
 *
 * @param {NextApiRequest} req - Incoming request. Body must contain BatchDetailRequest fields.
 * @param {NextApiResponse<ApiResponse<BatchDetailResponse>>} res - Response object.
 * @returns {Promise<void>}
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<BatchDetailResponse>>
): Promise<void> {
  if (!isPostRequest(req)) {
    res.setHeader("Allow", ["POST"]);
    res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: "Method not allowed.",
      data: null as unknown as BatchDetailResponse,
    });
    return;
  }

  if (!isValidBatchDetailRequest(req.body)) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message:
        "Request body must include batchId (number), storeId (string), batchConfigId (number), and batchName (string).",
      data: null as unknown as BatchDetailResponse,
    });
    return;
  }

  const { batchId, storeId, batchConfigId, batchName } =
    req.body as BatchDetailRequest;

  try {
    const token = await getAccessToken();

    const upstreamRes = await fetchWithTimeout(
      `${SIGNS_API_BASE_URL}${ECS_BATCH_API_PATHS.GET_BATCH_DETAIL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          batchId,
          storeId: storeId.trim(),
          batchConfigId,
          batchName: batchName.trim(),
        }),
      }
    );

    if (!upstreamRes.ok) {
      throw new Error(
        `ECS API responded with status ${upstreamRes.status}`
      );
    }

    const ecsResponse = (await upstreamRes.json()) as ECSBatchDetailResponse;

    const items: BatchDetailItem[] = (ecsResponse.data?.itemDetails ?? []).map(
      mapECSItemToDetailItem
    );

    const data: BatchDetailResponse = {
      batchId: ecsResponse.data?.batchId ?? batchId,
      batchName: batchName.trim(),
      storeId: storeId.trim(),
      batchConfigId,
      items,
    };

    res.status(HTTP_STATUS.OK).json({ success: true, message: "OK", data });
  } catch {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch batch detail.",
      data: null as unknown as BatchDetailResponse,
    });
  }
}
