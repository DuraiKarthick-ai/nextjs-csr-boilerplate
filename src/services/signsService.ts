/**
 * Signs API service layer.
 *
 * Structure fix: Components should never call apiClient directly.
 * All API interactions go through this service module, which:
 *  1. Centralizes endpoint definitions (single place to update URLs)
 *  2. Adds TypeScript return types for all responses
 *  3. Makes mocking/testing straightforward (mock this module, not axios)
 *  4. Keeps components free of HTTP/axios concerns
 *
 * Usage:
 *   import { signsService } from "@/services/signsService";
 *   const items = await signsService.getItems({ dept: "110" });
 */

import apiClient from "@/utils/apiClient";
import type { SignItem, SignItemsResponse } from "@/types";

export interface GetItemsParams {
  dept?: string;
  catCode?: string;
  onHandOnly?: boolean;
}

export interface PrintJobParams {
  deptNumber: string;
  catCode?: string;
  quantity?: number;
  size?: string;
  printOnlyOnHand?: boolean;
}

export interface PrintJobResponse {
  jobId: string;
  status: "queued" | "printing" | "completed" | "failed";
  itemCount: number;
}

export const signsService = {
  /**
   * Fetch sign items for the given department/category filters.
   */
  async getItems(params: GetItemsParams = {}): Promise<SignItemsResponse> {
    const response = await apiClient.get<SignItemsResponse>("/api/v1/signs/items", {
      params,
    });
    return response.data;
  },

  /**
   * Submit a print job for department/category signs.
   */
  async printSigns(params: PrintJobParams): Promise<PrintJobResponse> {
    const response = await apiClient.post<PrintJobResponse>("/api/v1/signs/print", params);
    return response.data;
  },

  /**
   * Fetch a single sign item by ID.
   */
  async getItemById(itemId: number): Promise<SignItem> {
    const response = await apiClient.get<SignItem>(`/api/v1/signs/items/${itemId}`);
    return response.data;
  },
};
