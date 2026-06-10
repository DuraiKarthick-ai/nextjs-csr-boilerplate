/**
 * customSignService — API calls for the Custom Sign Builder feature.
 * All requests go through the shared apiClient for consistent error handling.
 *
 * Security: inputs must be validated by validators.ts before calling these
 * functions; never trust raw user input.
 */

import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/common.types";
import type {
  PrintResponse,
  CustomSignRenderRequest,
  CustomSignRenderResponse,
} from "../../../types/sign.types";
import { API_BASE_PATH, PREVIEW_SIGN_API_PATHS } from "../../../lib/constants";

/**
 * Submits a custom sign render request to the ECS API via the internal
 * Next.js proxy route and returns the full render response containing
 * the base-64 encoded preview image.
 *
 * @param {CustomSignRenderRequest[]} payload - Array of render request items.
 * @returns {Promise<CustomSignRenderResponse>} The ECS render response.
 * @throws {Error} If the request fails or the response is not successful.
 */
export async function renderCustomSign(
  payload: CustomSignRenderRequest[]
): Promise<CustomSignRenderResponse> {
  const response = await apiClient.post<ApiResponse<CustomSignRenderResponse>>(
    PREVIEW_SIGN_API_PATHS.RENDER,
    payload
  );
  return response.data.data;
}

/**
 * Submits a custom sign to the backend for printing.
 *
 * @param {number} quantity - Number of copies to print.
 * @returns {Promise<PrintResponse>} The print job response.
 * @throws {Error} If the request fails or the response is not successful.
 */
export async function printCustomSign(
  quantity: number
): Promise<PrintResponse> {
  const response = await apiClient.post<ApiResponse<PrintResponse>>(
    `${API_BASE_PATH}/print`,
    { quantity }
  );
  return response.data.data;
}
