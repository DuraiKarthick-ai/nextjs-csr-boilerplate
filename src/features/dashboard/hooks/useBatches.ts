/**
 * useBatches hook — fetches the ECS batch job list for the dashboard.
 *
 * Triggers automatically on mount, using the configured default store ID.
 * Follows the Single Responsibility Principle — this hook only manages
 * batch list data and its loading/error state.
 *
 * @returns {UseBatchesResult} Batch list, loading flag, error message, and refresh fn.
 */

import { useEffect, useState } from "react";
import { fetchAllBatches } from "../services/dashboardService";
import type { BatchItem } from "../../../types/batch.types";
import { DEFAULT_STORE_ID } from "../../../services/config";

/** Shape returned by the useBatches hook. */
export interface UseBatchesResult {
  /** The list of batch jobs returned from the API. */
  batches: BatchItem[];
  /** Whether the batch list is currently loading. */
  isLoading: boolean;
  /** Error message if the fetch failed, otherwise null. */
  error: string | null;
  /** Manually re-triggers a data refresh. */
  refresh: () => void;
}

/**
 * Fetches all batch jobs for the default store on mount and exposes
 * the result with loading and error state.
 *
 * @returns {UseBatchesResult}
 */
function useBatches(): UseBatchesResult {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    /**
     * Fetches the batch list from the API.
     *
     * @returns {Promise<void>}
     */
    async function loadBatches(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchAllBatches(DEFAULT_STORE_ID);
        if (!cancelled) {
          setBatches(data.batches ?? []);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load batch jobs."
          );
          setBatches([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadBatches();

    return () => {
      cancelled = true;
    };
  }, [tick]);

  /** Increments tick to force a re-fetch. */
  function refresh(): void {
    setTick((prev) => prev + 1);
  }

  return { batches, isLoading, error, refresh };
}

export default useBatches;
