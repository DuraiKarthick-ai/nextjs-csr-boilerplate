/**
 * dashboardService — API calls for the Dashboard feature.
 *
 * Handles fetching the ECS batch job list via the internal Next.js API route,
 * which in turn proxies to the external ECS batch API with server-side OAuth.
 *
 * Security: never calls the external ECS API directly from the client.
 * All external calls are proxied through Next.js API routes.
 */

import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/common.types";
import type { GetAllBatchesResponse } from "../../../types/batch.types";
import { BATCH_API_PATHS } from "../../../lib/constants";

/**
 * Fetches all batch jobs for the given store via the internal batches API route.
 *
 * @param {string} storeId - The store identifier to fetch batches for.
 * @returns {Promise<GetAllBatchesResponse>} The batch list response.
 * @throws {Error} If the request fails or the response is not successful.
 */
export async function fetchAllBatches(
  storeId: string
): Promise<GetAllBatchesResponse> {
  const response = await apiClient.post<ApiResponse<GetAllBatchesResponse>>(
    BATCH_API_PATHS.BATCHES,
    { storeId }
  );
  return response.data.data;
}
