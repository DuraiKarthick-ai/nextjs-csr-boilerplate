/**
 * Emergency Price Change API service layer.
 *
 * Centralises the endpoint URL and request/response handling.
 *
 * @security OWASP A10: URL is validated by apiClient allowlist checks.
 */

import apiClient from "@/utils/apiClient";
import type {
  EmergencyPriceChangeRequestPayload,
  EmergencyPriceChangeResponseItem,
} from "@/types/emergencyPriceChange";

/**
 * Emergency Price Change API endpoint URL.
 */
const EMERGENCY_PRICE_CHANGE_API_URL =
  "https://69ce482633a09f831b7d3ab9.mockapi.io/api/v1/dashboard/emergencyPriceChange";

export const emergencyPriceChangeService = {
  /**
   * Fetches Emergency Price Change rows using the request payload.
   *
   * @param {EmergencyPriceChangeRequestPayload} payload - Request with storeId, date, and filters.
   * @returns {Promise<EmergencyPriceChangeResponseItem[]>} Emergency Price Change rows from the API.
   * @throws {Error} Re-throws API/network errors for UI-level handling.
   */
  async getEmergencyPriceChangeData(
    payload: EmergencyPriceChangeRequestPayload
  ): Promise<EmergencyPriceChangeResponseItem[]> {
    const response = await apiClient.post<EmergencyPriceChangeResponseItem[]>(
      EMERGENCY_PRICE_CHANGE_API_URL,
      payload
    );
    return response.data;
  },
};
