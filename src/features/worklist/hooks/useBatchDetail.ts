/**
 * useBatchDetail hook — fetches the detailed item list for a specific batch.
 *
 * Triggers when batch query parameters are provided (i.e., the user navigated
 * from the dashboard batch-job hyperlink). Returns an empty list with no
 * loading state when no params are given.
 *
 * @param {BatchQueryParams | null} params - Batch identifiers sourced from URL query params.
 * @returns {UseBatchDetailResult} Batch detail items, loading flag, and error message.
 */

import { useEffect, useState } from "react";
import { fetchBatchDetail } from "../services/worklistService";
import { FALLBACK_BATCH_DETAIL_ITEMS } from "../../dashboard/services/mockBatchData";
import type { BatchDetailItem, BatchQueryParams } from "../../../types/batch.types";

/** Shape returned by the useBatchDetail hook. */
export interface UseBatchDetailResult {
  /** The list of sign items belonging to the batch. */
  items: BatchDetailItem[];
  /** Whether the batch detail is currently loading. */
  isLoading: boolean;
  /** Error message if the fetch failed, otherwise null. */
  error: string | null;
}

/**
 * Fetches the batch detail items when params are provided.
 * No-ops when params is null (e.g., worklist opened without a batch context).
 *
 * @param {BatchQueryParams | null} params - The batch identifiers from URL query params.
 * @returns {UseBatchDetailResult}
 */
function useBatchDetail(params: BatchQueryParams | null): UseBatchDetailResult {
  const [items, setItems] = useState<BatchDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;
    const currentParams = params;

    let cancelled = false;

    /**
     * Fetches the batch detail from the API.
     *
     * @returns {Promise<void>}
     */
    async function loadBatchDetail(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchBatchDetail(currentParams);
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load batch detail."
          );
          setItems(FALLBACK_BATCH_DETAIL_ITEMS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadBatchDetail();

    return () => {
      cancelled = true;
    };
  }, [params?.batchId]);

  return { items, isLoading, error };
}

export default useBatchDetail;
