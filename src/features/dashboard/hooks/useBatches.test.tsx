/**
 * Unit tests for the useBatches hook.
 * The dashboard service is mocked; covers successful load, the error path,
 * and manual refresh.
 */

jest.mock("../services/dashboardService", () => ({ fetchAllBatches: jest.fn() }));

import { renderHook, waitFor, act } from "@testing-library/react";
import useBatches from "./useBatches";
import { fetchAllBatches } from "../services/dashboardService";

const fetchBatches = fetchAllBatches as jest.Mock;

describe("useBatches", () => {
  beforeEach(() => fetchBatches.mockReset());

  it("loads batches from the service on mount", async () => {
    const batches = [{ batchId: 1, batchName: "B", storeId: "1", batchConfigId: 1, status: "READY" }];
    fetchBatches.mockResolvedValue({ batches });

    const { result } = renderHook(() => useBatches());
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.batches).toEqual(batches);
    expect(result.current.error).toBeNull();
  });

  it("sets an error and leaves batches empty when the fetch fails", async () => {
    fetchBatches.mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useBatches());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("network down");
    expect(result.current.batches).toEqual([]);
  });

  it("re-fetches when refresh is called", async () => {
    fetchBatches.mockResolvedValue({ batches: [] });
    const { result } = renderHook(() => useBatches());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.refresh());

    await waitFor(() => expect(fetchBatches).toHaveBeenCalledTimes(2));
  });
});
