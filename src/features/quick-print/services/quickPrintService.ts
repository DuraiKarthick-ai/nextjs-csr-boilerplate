/**
 * quickPrintService — API calls for the Quick Print feature.
 * Provides item lookup and batch print submission.
 *
 * Security: never pass raw user input directly; validate with validators.ts first.
 */

import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/common.types";
import type { LookupResult, PrintRequest, PrintResponse } from "../../../types/sign.types";
import { API_BASE_PATH } from "../../../lib/constants";

/**
 * Looks up an item by its item number, returning sign-ready data.
 *
 * @param {string} itemNumber - The item number to look up (validated before call).
 * @returns {Promise<LookupResult>} The lookup result from the backend.
 */
export async function lookupItem(itemNumber: string): Promise<LookupResult> {
  const response = await apiClient.get<ApiResponse<LookupResult>>(
    `${API_BASE_PATH}/lookup`,
    { params: { itemNumber } }
  );
  return response.data.data;
}

/**
 * Submits a batch print request for one or more sign IDs.
 *
 * @param {PrintRequest} request - The validated print request payload.
 * @returns {Promise<PrintResponse>} The print job response from the backend.
 */
export async function submitBatchPrint(request: PrintRequest): Promise<PrintResponse> {
  const response = await apiClient.post<ApiResponse<PrintResponse>>(
    `${API_BASE_PATH}/print`,
    request
  );
  return response.data.data;
}
