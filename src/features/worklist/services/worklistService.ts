/**
 * worklistService — API calls for the Worklist (Emergency Price Change) feature.
 * Handles fetching, filtering, and batch print submission of worklist items.
 *
 * Security: all filter values must be validated before calling these functions.
 */

import apiClient from "../../../services/apiClient";
import type { ApiResponse, PaginatedResponse } from "../../../types/common.types";
import type {
  WorklistItem,
  WorklistFilter,
  WorklistPrintRequest,
  WorklistSummaryData,
} from "../../../types/worklist.types";
import type {
  PrintResponse,
  CustomSignRenderRequest,
  CustomSignRenderResponse,
} from "../../../types/sign.types";
import type { BatchQueryParams, BatchDetailResponse } from "../../../types/batch.types";
import { API_BASE_PATH, DEFAULT_PAGE_SIZE, BATCH_API_PATHS, PREVIEW_SIGN_API_PATHS, DEFAULT_STORE_ID } from "../../../lib/constants";

/**
 * Fetches a paginated list of worklist items with optional filters.
 *
 * @param {WorklistFilter} filters - Active filter criteria.
 * @param {number} [page=1] - 1-based page index.
 * @param {number} [pageSize=DEFAULT_PAGE_SIZE] - Number of items per page.
 * @returns {Promise<PaginatedResponse<WorklistItem>>} Paginated worklist items.
 */
export async function fetchWorklist(
  filters: WorklistFilter,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResponse<WorklistItem>> {
  const response = await apiClient.get<PaginatedResponse<WorklistItem>>(
    `${API_BASE_PATH}/worklist`,
    { params: { ...filters, page, pageSize } }
  );
  return response.data;
}

/**
 * Fetches aggregated worklist summary statistics for the dashboard widget.
 *
 * @returns {Promise<WorklistSummaryData>} Summary counts.
 */
export async function fetchWorklistSummary(): Promise<WorklistSummaryData> {
  const response = await apiClient.get<ApiResponse<WorklistSummaryData>>(
    `${API_BASE_PATH}/worklist/summary`
  );
  return response.data.data;
}

/**
 * Submits a batch print request for selected worklist items.
 *
 * @param {WorklistPrintRequest} request - The batch print request payload.
 * @returns {Promise<PrintResponse>} The print job response.
 */
export async function printWorklistItems(
  request: WorklistPrintRequest
): Promise<PrintResponse> {
  const response = await apiClient.post<ApiResponse<PrintResponse>>(
    `${API_BASE_PATH}/worklist/print`,
    request
  );
  return response.data.data;
}

/**
 * Requests a rendered sign preview image for a single worklist item.
 * Calls the shared ECS custom-sign render endpoint with the item number
 * as the product code and default style parameters.
 *
 * @param {string} itemNumber - The item number to preview.
 * @returns {Promise<CustomSignRenderResponse>} The ECS render response containing
 *   a base-64 encoded PNG in data[0].responseData.
 * @throws {Error} If the request fails or the response is not successful.
 */
export async function renderWorklistItemPreview(
  itemNumber: string
): Promise<CustomSignRenderResponse> {
  const payload: CustomSignRenderRequest[] = [
    {
      styleName: "Default",
      outputType: "png",
      productCode: itemNumber,
      storeId: DEFAULT_STORE_ID,
      outputParams: "",
      shapeNameValues: [],
    },
  ];
  const response = await apiClient.post<ApiResponse<CustomSignRenderResponse>>(
    PREVIEW_SIGN_API_PATHS.RENDER,
    payload
  );
  return response.data.data;
}

/**
 * Fetches the detailed sign item list for a specific ECS batch.
 *
 * @param {BatchQueryParams} params - The batch identifiers sourced from URL query params.
 * @returns {Promise<BatchDetailResponse>} The batch detail including all sign items.
 * @throws {Error} If the request fails or the response is not successful.
 */
export async function fetchBatchDetail(
  params: BatchQueryParams
): Promise<BatchDetailResponse> {
  const response = await apiClient.post<ApiResponse<BatchDetailResponse>>(
    BATCH_API_PATHS.BATCH_DETAIL,
    {
      batchId: params.batchId,
      storeId: params.storeId,
      batchConfigId: params.batchConfigId,
      batchName: params.batchName,
    }
  );
  return response.data.data;
}
