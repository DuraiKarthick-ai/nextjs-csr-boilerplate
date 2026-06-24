/**
 * Unit tests for usePagination.
 * Covers page-count derivation, navigation clamping, page-size changes,
 * and reset behaviour.
 */

import { renderHook, act } from "@testing-library/react";
import usePagination from "./usePagination";

describe("usePagination", () => {
  it("derives totalPages from totalItems and page size", () => {
    const { result } = renderHook(() => usePagination(45, 20));
    expect(result.current.totalPages).toBe(3);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.hasNextPage).toBe(true);
  });

  it("always reports at least one page, even with zero items", () => {
    const { result } = renderHook(() => usePagination(0, 20));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("advances and retreats pages within bounds", () => {
    const { result } = renderHook(() => usePagination(45, 20));

    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(2);

    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(1);
  });

  it("does not advance past the last page", () => {
    const { result } = renderHook(() => usePagination(45, 20));
    act(() => result.current.goToPage(3));
    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(3);
    expect(result.current.hasNextPage).toBe(false);
  });

  it("does not retreat before the first page", () => {
    const { result } = renderHook(() => usePagination(45, 20));
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(1);
  });

  it("clamps goToPage to the valid range", () => {
    const { result } = renderHook(() => usePagination(45, 20));
    act(() => result.current.goToPage(99));
    expect(result.current.currentPage).toBe(3);
    act(() => result.current.goToPage(-5));
    expect(result.current.currentPage).toBe(1);
  });

  it("changing page size resets to page 1", () => {
    const { result } = renderHook(() => usePagination(100, 20));
    act(() => result.current.goToPage(4));
    expect(result.current.currentPage).toBe(4);

    act(() => result.current.setPageSize(50));
    expect(result.current.pageSize).toBe(50);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalPages).toBe(2);
  });

  it("reset returns to the first page", () => {
    const { result } = renderHook(() => usePagination(100, 20));
    act(() => result.current.goToPage(3));
    act(() => result.current.reset());
    expect(result.current.currentPage).toBe(1);
  });

  it("defaults to the DEFAULT_PAGE_SIZE when no size is given", () => {
    const { result } = renderHook(() => usePagination(100));
    expect(result.current.pageSize).toBe(20);
  });
});
