/**
 * usePagination hook — manages client-side pagination state including
 * the current page index, page size, and helper navigation actions.
 *
 * @param {number} totalItems - Total number of items across all pages.
 * @param {number} [initialPageSize=20] - Number of items per page.
 * @returns {PaginationState} Current pagination state and navigation actions.
 */

import { useCallback, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "../lib/constants";

/**
 * The shape of the value returned by usePagination.
 */
export interface PaginationState {
  /** Current 1-based page number. */
  currentPage: number;
  /** Number of items displayed per page. */
  pageSize: number;
  /** Total number of pages based on totalItems and pageSize. */
  totalPages: number;
  /** Whether there is a page after the current one. */
  hasNextPage: boolean;
  /** Whether there is a page before the current one. */
  hasPrevPage: boolean;
  /** Navigates to the next page. */
  nextPage: () => void;
  /** Navigates to the previous page. */
  prevPage: () => void;
  /**
   * Jumps directly to a specific page.
   *
   * @param {number} page - 1-based page number to navigate to.
   */
  goToPage: (page: number) => void;
  /**
   * Updates the page size and resets to page 1.
   *
   * @param {number} size - New page size to apply.
   */
  setPageSize: (size: number) => void;
  /** Resets pagination back to page 1. */
  reset: () => void;
}

function usePagination(
  totalItems: number,
  initialPageSize: number = DEFAULT_PAGE_SIZE
): PaginationState {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const clamped = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(clamped);
    },
    [totalPages]
  );

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setCurrentPage(1);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    setPageSize,
    reset,
  };
}

export default usePagination;
