/**
 * Sign Audit API service layer.
 *
 * Centralises the endpoint URL and typed request/response handling.
 *
 * @security OWASP A10: URL is validated by apiClient allowlist checks.
 */

import apiClient from "@/utils/apiClient";
import type { SignAuditRequestPayload, SignAuditResponseItem } from "@/types/signAudit";

/**
 * Sign Audit API endpoint URL.
 */
const SIGN_AUDIT_API_URL = "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/signAudit";

export const signAuditService = {
  /**
   * Fetches Sign Audit rows using server-side filters, sorting, and pagination.
   *
   * @param {SignAuditRequestPayload} payload - Filter/sort/pagination request body.
   * @returns {Promise<SignAuditResponseItem[]>} Sign Audit rows from the API.
   * @throws {Error} Re-throws API/network errors for UI-level handling.
   */
  async getSignAuditData(payload: SignAuditRequestPayload): Promise<SignAuditResponseItem[]> {
    const response = await apiClient.post<SignAuditResponseItem[]>(SIGN_AUDIT_API_URL, payload);
    return response.data;
  },
};
