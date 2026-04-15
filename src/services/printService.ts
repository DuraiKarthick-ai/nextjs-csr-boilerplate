/**
 * Print API service layer.
 *
 * Centralises the print endpoint URL and request/response mapping.
 * All components that trigger a print action should call this service
 * rather than using apiClient directly.
 *
 * @security OWASP A10: URL validated against allowlist inside apiClient.
 */

import apiClient from "@/utils/apiClient";
import type { PrintRequestPayload, PrintResponse } from "@/types/print";

/**
 * Print API endpoint URL.
 * Override at build time via NEXT_PUBLIC_PRINT_API_URL.
 */
const PRINT_API_URL =
  process.env.NEXT_PUBLIC_PRINT_API_URL ??
  "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/print";

export const printService = {
  /**
   * Submits a print request to the print API.
   *
   * @param {PrintRequestPayload} payload - The full print request including storeId, requestedBy, and printRequests.
   * @returns {Promise<PrintResponse>} Array of print result items from the API.
   * @throws {Error} Re-throws API/network errors for the caller to handle.
   */
  async submitPrint(payload: PrintRequestPayload): Promise<PrintResponse> {
    const response = await apiClient.post<PrintResponse>(PRINT_API_URL, payload);
    return response.data;
  },
};
