/**
 * useDashboard hook — fetches and exposes the worklist summary data
 * used by the dashboard overview widgets.
 *
 * @returns {UseDashboardResult} Dashboard loading state and summary data.
 */

import { useEffect, useState } from "react";
import apiClient from "../../../services/apiClient";
import type { WorklistSummaryData } from "../../../types/worklist.types";
import type { ApiResponse } from "../../../types/common.types";
import { API_BASE_PATH } from "../../../lib/constants";

/** Shape returned by the useDashboard hook. */
export interface UseDashboardResult {
  /** Aggregated worklist summary counts. */
  summary: WorklistSummaryData | null;
  /** Whether the summary is currently loading. */
  isLoading: boolean;
  /** Error message if the fetch failed, otherwise null. */
  error: string | null;
  /** Manually re-triggers a data refresh. */
  refresh: () => void;
}

/**
 * Fetches the worklist summary from the API and tracks loading/error state.
 *
 * @returns {UseDashboardResult}
 */
function useDashboard(): UseDashboardResult {
  const [summary, setSummary] = useState<WorklistSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    /**
     * Performs the actual API fetch.
     *
     * @returns {Promise<void>}
     */
    async function fetchSummary(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<ApiResponse<WorklistSummaryData>>(
          `${API_BASE_PATH}/worklist-summary`
        );
        if (!cancelled) {
          setSummary(response.data.data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load summary.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  /** Increments tick to re-trigger the effect. */
  function refresh(): void {
    setTick((prev) => prev + 1);
  }

  return { summary, isLoading, error, refresh };
}

export default useDashboard;
