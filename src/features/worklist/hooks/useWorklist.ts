/**
 * useWorklist hook — manages data fetching, filtering, selection, and
 * batch print submission for the Worklist feature.
 *
 * @returns {UseWorklistResult} Hook state and action handlers.
 */

import { useEffect, useCallback, useState } from "react";
import useWorklistStore from "../../../store/worklistStore";
import { fetchWorklist, printWorklistItems } from "../services/worklistService";
import type { WorklistFilter } from "../../../types/worklist.types";
import { DEFAULT_PAGE_SIZE } from "../../../lib/constants";

/** Shape returned by useWorklist. */
export interface UseWorklistResult {
  /** Current page number. */
  page: number;
  /** Total number of items (for pagination). */
  totalItems: number;
  /** Whether a print request is in flight. */
  isPrinting: boolean;
  /** Manually re-triggers the data fetch. */
  refresh: () => void;
  /** Applies new filter values and resets to page 1. */
  applyFilters: (filters: Partial<WorklistFilter>) => void;
  /** Resets all filters. */
  resetFilters: () => void;
  /** Navigates to a specific page. */
  goToPage: (page: number) => void;
  /** Submits selected items for batch printing. */
  handlePrintSelected: () => Promise<void>;
}

/**
 * Worklist data and action hook.
 *
 * @returns {UseWorklistResult}
 */
function useWorklist(): UseWorklistResult {
  const {
    filters,
    selectedIds,
    setItems,
    setFilters,
    clearFilters,
    clearSelection,
    setLoading,
    setError,
  } = useWorklistStore();

  const [page, setPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);

  /**
   * Fetches the current page of worklist items from the API.
   *
   * @returns {Promise<void>}
   */
  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchWorklist(filters, page, DEFAULT_PAGE_SIZE);
        if (!cancelled) {
          setItems(response.data);
          setTotalItems(response.meta.total);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load worklist.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [filters, page, tick]);

  /** Increments tick to force a re-fetch. */
  const refresh = useCallback((): void => {
    setTick((prev) => prev + 1);
  }, []);

  /**
   * Applies partial filter updates and resets to page 1.
   *
   * @param {Partial<WorklistFilter>} newFilters - Filters to merge.
   */
  const applyFilters = useCallback(
    (newFilters: Partial<WorklistFilter>): void => {
      setFilters(newFilters);
      setPage(1);
    },
    [setFilters]
  );

  /**
   * Resets all applied filters and returns to page 1.
   */
  const resetFilters = useCallback((): void => {
    clearFilters();
    setPage(1);
  }, [clearFilters]);

  /**
   * Submits all currently selected items for batch printing.
   *
   * @returns {Promise<void>}
   */
  const handlePrintSelected = useCallback(async (): Promise<void> => {
    if (selectedIds.size === 0) return;
    setIsPrinting(true);
    try {
      await printWorklistItems({ itemIds: Array.from(selectedIds) });
      clearSelection();
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Print failed.");
    } finally {
      setIsPrinting(false);
    }
  }, [selectedIds, clearSelection, refresh, setError]);

  return {
    page,
    totalItems,
    isPrinting,
    refresh,
    applyFilters,
    resetFilters,
    goToPage: setPage,
    handlePrintSelected,
  };
}

export default useWorklist;
