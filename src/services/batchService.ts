/**
 * Batch API service layer.
 *
 * Encapsulates the get-all-batches endpoint and returns the normalized batch list.
 */

import apiClient from "@/utils/apiClient";
import type {
  BatchDetailItem,
  BatchItem,
  GetBatchDetailApiResponse,
  GetBatchDetailRequestPayload,
  GetAllBatchesApiResponse,
  GetAllBatchesRequestPayload,
} from "@/types/batch";

const BATCH_API_BASE_URL = process.env.NEXT_PUBLIC_BATCH_API_BASE_URL;

const GET_ALL_BATCHES_API_URL = BATCH_API_BASE_URL
  ? `${BATCH_API_BASE_URL}/get-all-batches`
  : "/api/batch/get-all-batches";

const GET_BATCH_DETAIL_API_URL = BATCH_API_BASE_URL
  ? `${BATCH_API_BASE_URL}/get-batch-detail`
  : "/api/batch/get-batch-detail";

export const batchService = {
  /**
   * Fetches all batches for the given store.
   *
   * @param payload - Request payload containing the storeId.
   * @returns The batch list from the API response.
   */
  async getAllBatches(payload: GetAllBatchesRequestPayload): Promise<BatchItem[]> {
    const response = await apiClient.post<GetAllBatchesApiResponse>(
      GET_ALL_BATCHES_API_URL,
      payload,
    );

    return response.data.data;
  },

  /**
   * Fetches detail rows for the selected batch tab.
   *
   * @param payload - Request payload containing batch identifiers and storeId.
   * @returns The selected batch detail rows from the API response.
   */
  async getBatchDetail(payload: GetBatchDetailRequestPayload): Promise<BatchDetailItem[]> {
    const response = await apiClient.post<GetBatchDetailApiResponse>(
      GET_BATCH_DETAIL_API_URL,
      payload,
    );

    return response.data.data.itemDetails;
  },
};
