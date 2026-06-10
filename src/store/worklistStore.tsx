/**
 * Worklist state via React Context + useState.
 * Manages the list of worklist items, active filters, selection state,
 * and pagination cursor. Wrap the worklist feature with WorklistProvider.
 */

import React, { createContext, useContext, useState } from "react";
import type { WorklistItem, WorklistFilter } from "../types/worklist.types";

/**
 * Shape of the worklist store.
 */
interface WorklistState {
  /** All loaded worklist items for the current view. */
  items: WorklistItem[];
  /** Currently applied filter criteria. */
  filters: WorklistFilter;
  /** Set of item IDs currently selected for batch operations. */
  selectedIds: Set<string>;
  /** Whether a data fetch is in progress. */
  isLoading: boolean;
  /** Current error message, if any. */
  error: string | null;

  /**
   * Replaces the full list of displayed worklist items.
   *
   * @param {WorklistItem[]} items - The new set of items to display.
   */
  setItems: (items: WorklistItem[]) => void;

  /**
   * Merges partial filter updates into the existing filter state.
   *
   * @param {Partial<WorklistFilter>} filters - Partial filter to apply.
   */
  setFilters: (filters: Partial<WorklistFilter>) => void;

  /** Clears all applied filters back to defaults. */
  clearFilters: () => void;

  /**
   * Toggles the selection state of a single item by ID.
   *
   * @param {string} id - The worklist item ID to toggle.
   */
  toggleSelection: (id: string) => void;

  /**
   * Selects all currently displayed items.
   */
  selectAll: () => void;

  /** Clears the entire selection. */
  clearSelection: () => void;

  /**
   * Sets the loading state flag.
   *
   * @param {boolean} isLoading - Whether loading is in progress.
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the current error message, or clears it with null.
   *
   * @param {string | null} error - The error message or null to clear.
   */
  setError: (error: string | null) => void;
}

const WorklistContext = createContext<WorklistState | undefined>(undefined);

/**
 * WorklistProvider — wraps the worklist feature and provides shared state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function WorklistProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [items, setItemsState] = useState<WorklistItem[]>([]);
  const [filters, setFiltersState] = useState<WorklistFilter>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  /**
   * Replaces the full list of displayed worklist items.
   *
   * @param {WorklistItem[]} newItems - The new set of items.
   */
  function setItems(newItems: WorklistItem[]): void {
    setItemsState(newItems);
  }

  /**
   * Merges partial filter updates into the existing filter state.
   *
   * @param {Partial<WorklistFilter>} partial - Partial filter to merge.
   */
  function setFilters(partial: Partial<WorklistFilter>): void {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }

  /** Clears all applied filters back to defaults. */
  function clearFilters(): void {
    setFiltersState({});
  }

  /**
   * Toggles the selection state of a single item by ID.
   *
   * @param {string} id - The worklist item ID to toggle.
   */
  function toggleSelection(id: string): void {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  /** Selects all currently displayed items. */
  function selectAll(): void {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  /** Clears the entire selection. */
  function clearSelection(): void {
    setSelectedIds(new Set());
  }

  /**
   * Sets the loading state flag.
   *
   * @param {boolean} loading - Whether loading is in progress.
   */
  function setLoading(loading: boolean): void {
    setLoadingState(loading);
  }

  /**
   * Sets the current error message, or clears it with null.
   *
   * @param {string | null} err - The error message or null to clear.
   */
  function setError(err: string | null): void {
    setErrorState(err);
  }

  return (
    <WorklistContext.Provider
      value={{
        items,
        filters,
        selectedIds,
        isLoading,
        error,
        setItems,
        setFilters,
        clearFilters,
        toggleSelection,
        selectAll,
        clearSelection,
        setLoading,
        setError,
      }}
    >
      {children}
    </WorklistContext.Provider>
  );
}

/**
 * useWorklistStore — returns the worklist context value.
 * Must be used inside WorklistProvider.
 *
 * @returns {WorklistState} The worklist context value.
 * @throws {Error} If used outside of WorklistProvider.
 */
function useWorklistStore(): WorklistState {
  const ctx = useContext(WorklistContext);
  if (!ctx) throw new Error("useWorklistStore must be used inside WorklistProvider");
  return ctx;
}

export default useWorklistStore;
