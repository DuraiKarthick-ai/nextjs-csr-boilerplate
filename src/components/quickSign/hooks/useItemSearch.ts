/**
 * useItemSearch — manages item search state and debounced API calls
 * for the Quick Sign "By Item" tab.
 *
 * Handles per-row search options, loading state, and invalid row tracking
 * when the search returns no results.
 */

import { useState, useRef, useCallback } from "react";
import type { ItemSearchResult } from "../quickSign.types";
import {
  ITEM_SEARCH_URL,
  MIN_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
} from "../quickSign.constants";

export interface UseItemSearchResult {
  /** Search results per row index. */
  searchOptions: Record<number, ItemSearchResult[]>;
  /** Loading state per row index. */
  searchLoading: Record<number, boolean>;
  /** Whether the search API has completed per row index. */
  searchDone: Record<number, boolean>;
  /** Row indices whose search returned no results. */
  invalidRows: Set<number>;
  /** Row indices that were successfully printed. */
  printedRows: Set<number>;
  /** Success message to display under printed rows. */
  printedMessage: string;
  /** Triggers a debounced search for the given row and query. */
  triggerSearch: (index: number, query: string) => void;
  /** Clears the invalid flag for a specific row. */
  clearInvalid: (index: number) => void;
  /** Clears the printed flag for a specific row. */
  clearPrinted: (index: number) => void;
  /** Marks the given row indices as successfully printed with a message. */
  markPrinted: (indices: number[], message: string) => void;
  /** Resets all search-related state. */
  resetSearch: () => void;
}

/**
 * Hook that encapsulates item search logic including debouncing,
 * loading indicators, and invalid/printed row tracking.
 *
 * @returns {UseItemSearchResult} Search state and action handlers.
 */
export function useItemSearch(): UseItemSearchResult {
  const [searchOptions, setSearchOptions] = useState<Record<number, ItemSearchResult[]>>({});
  const [searchLoading, setSearchLoading] = useState<Record<number, boolean>>({});
  const [searchDone, setSearchDone] = useState<Record<number, boolean>>({});
  const [invalidRows, setInvalidRows] = useState<Set<number>>(new Set());
  const [printedRows, setPrintedRows] = useState<Set<number>>(new Set());
  const [printedMessage, setPrintedMessage] = useState("");
  const timerRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  /**
   * Triggers a debounced item search for a specific row.
   * Clears previous results if the query is too short.
   * Marks the row as invalid if the search returns no results.
   *
   * @param {number} index - The row index to search for.
   * @param {string} query - The numeric query string.
   */
  const triggerSearch = useCallback((index: number, query: string): void => {
    if (timerRef.current[index]) clearTimeout(timerRef.current[index]);

    if (query.length < MIN_SEARCH_LENGTH) {
      setSearchOptions((prev) => ({ ...prev, [index]: [] }));
      setSearchDone((prev) => ({ ...prev, [index]: false }));
      setInvalidRows((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      return;
    }

    timerRef.current[index] = setTimeout(async () => {
      setSearchLoading((prev) => ({ ...prev, [index]: true }));
      setSearchDone((prev) => ({ ...prev, [index]: false }));
      try {
        const res = await fetch(
          `${ITEM_SEARCH_URL}?search=${encodeURIComponent(query)}`
        );
        const data: ItemSearchResult[] = res.ok ? await res.json() : [];
        setSearchOptions((prev) => ({ ...prev, [index]: data }));
        if (data.length === 0) {
          setInvalidRows((prev) => new Set(prev).add(index));
        }
      } catch {
        setSearchOptions((prev) => ({ ...prev, [index]: [] }));
      } finally {
        setSearchLoading((prev) => ({ ...prev, [index]: false }));
        setSearchDone((prev) => ({ ...prev, [index]: true }));
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  /**
   * Clears the invalid flag for a specific row index.
   *
   * @param {number} index - The row index to clear.
   */
  const clearInvalid = useCallback((index: number): void => {
    setInvalidRows((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  /**
   * Clears the printed flag for a specific row index.
   * Clears the printed message if no printed rows remain.
   *
   * @param {number} index - The row index to clear.
   */
  const clearPrinted = useCallback((index: number): void => {
    setPrintedRows((prev) => {
      const next = new Set(prev);
      next.delete(index);
      if (next.size === 0) setPrintedMessage("");
      return next;
    });
  }, []);

  /**
   * Marks the given row indices as successfully printed.
   *
   * @param {number[]} indices - Row indices that were printed.
   * @param {string} message - Success message to display.
   */
  const markPrinted = useCallback((indices: number[], message: string): void => {
    setPrintedRows(new Set(indices));
    setPrintedMessage(message);
  }, []);

  /**
   * Resets all search-related state to initial values.
   */
  const resetSearch = useCallback((): void => {
    setSearchOptions({});
    setSearchLoading({});
    setSearchDone({});
    setInvalidRows(new Set());
    setPrintedRows(new Set());
    setPrintedMessage("");
  }, []);

  return {
    searchOptions,
    searchLoading,
    searchDone,
    invalidRows,
    printedRows,
    printedMessage,
    triggerSearch,
    clearInvalid,
    clearPrinted,
    markPrinted,
    resetSearch,
  };
}
