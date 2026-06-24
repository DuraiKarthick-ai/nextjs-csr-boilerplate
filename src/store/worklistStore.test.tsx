/**
 * Unit tests for the worklist store (Context + useState).
 * Covers item replacement, filter merge/clear, selection toggling,
 * select-all/clear, loading/error flags, and the out-of-provider guard.
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import useWorklistStore, { WorklistProvider } from "./worklistStore";
import type { WorklistItem } from "../types/worklist.types";
import { WorklistItemStatus, WorklistPrintStatus } from "../types/worklist.types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorklistProvider>{children}</WorklistProvider>
);

function makeItem(id: string): WorklistItem {
  return {
    id,
    itemNumber: id,
    description: `Item ${id}`,
    department: "PRODUCE",
    oldPrice: 1,
    newPrice: 2,
    effectiveDate: "2026-06-19",
    status: WorklistItemStatus.PENDING,
    printStatus: WorklistPrintStatus.NOT_PRINTED,
    isPrinted: false,
    createdAt: "2026-06-19",
    updatedAt: "2026-06-19",
  };
}

describe("useWorklistStore", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets items", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    act(() => result.current.setItems([makeItem("1"), makeItem("2")]));
    expect(result.current.items).toHaveLength(2);
  });

  it("merges and clears filters", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    act(() => result.current.setFilters({ department: "BAKERY" }));
    act(() => result.current.setFilters({ searchTerm: "milk" }));
    expect(result.current.filters).toEqual({ department: "BAKERY", searchTerm: "milk" });
    act(() => result.current.clearFilters());
    expect(result.current.filters).toEqual({});
  });

  it("toggles selection on and off", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    act(() => result.current.toggleSelection("1"));
    expect(result.current.selectedIds.has("1")).toBe(true);
    act(() => result.current.toggleSelection("1"));
    expect(result.current.selectedIds.has("1")).toBe(false);
  });

  it("selects all items then clears selection", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    act(() => result.current.setItems([makeItem("1"), makeItem("2")]));
    act(() => result.current.selectAll());
    expect(result.current.selectedIds.size).toBe(2);
    act(() => result.current.clearSelection());
    expect(result.current.selectedIds.size).toBe(0);
  });

  it("sets loading and error state", () => {
    const { result } = renderHook(() => useWorklistStore(), { wrapper });
    act(() => result.current.setLoading(true));
    expect(result.current.isLoading).toBe(true);
    act(() => result.current.setError("boom"));
    expect(result.current.error).toBe("boom");
    act(() => result.current.setError(null));
    expect(result.current.error).toBeNull();
  });

  it("throws when used outside of WorklistProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useWorklistStore())).toThrow(/WorklistProvider/);
    spy.mockRestore();
  });
});
