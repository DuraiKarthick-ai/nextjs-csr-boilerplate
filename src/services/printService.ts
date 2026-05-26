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
import { runQuickPreviewFlow } from "@/services/quickPreviewFlow";

/**
 * Print API endpoint URL.
 */
const PRINT_API_URL = "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/print";

export type PrintSubmitMode = "STANDARD" | "QUICK_PREVIEW";

export interface PrintSubmitOptions {
  mode?: PrintSubmitMode;
}

export const printService = {
  /**
   * Submits a print request.
   * - STANDARD: single POST to the mock print API.
   * - QUICK_PREVIEW: delegates to /api/print/quick-preview (Next.js proxy) which
   *   executes the 5-step ECS sequence server-to-server:
   *   create-sess I,Ō.P[=|
   *   SETRYUIO6P78[9]0,-\
   * UI=0\\ters → get-trays → adhoc-preview-load →
   *   adhoc-preview-show-data. ECS calls run in Node.js (not the browser) so
   *   the self-signed cert and CORS preflight issues are bypassed.
   *
   * @param {PrintRequestPayload} payload - Print request payload.
   * @param {PrintSubmitOptions} [options] - Submission options.
   * @returns {Promise<PrintResponse>} Print response.
   * @throws {Error} Re-throws API/network errors for the caller to handle.
   */
  async submitPrint(payload: PrintRequestPayload, options?: PrintSubmitOptions): Promise<PrintResponse> {
    if (options?.mode === "QUICK_PREVIEW") {
      return runQuickPreviewFlow(payload);
    }

    const response = await apiClient.post<PrintResponse>(PRINT_API_URL, payload);
    return response.data;
  },
};
