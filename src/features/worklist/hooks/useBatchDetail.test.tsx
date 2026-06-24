/**
 * Unit tests for the useBatchDetail hook.
 * The worklist service is mocked; covers the no-params no-op, success, and the
 * fallback path on error.
 */

jest.mock("../services/worklistService", () => ({ fetchBatchDetail: jest.fn() }));

import { renderHook, waitFor } from "@testing-library/react";
import useBatchDetail from "./useBatchDetail";
import { fetchBatchDetail } from "../services/worklistService";
import type { BatchQueryParams } from "../../../types/batch.types";

const fetchDetail = fetchBatchDetail as jest.Mock;
const params: BatchQueryParams = { batchId: 22, storeId: "106", batchConfigId: 10, batchName: "B" };

describe("useBatchDetail", () => {
  beforeEach(() => fetchDetail.mockReset());

  it("does nothing and stays idle when params is null", () => {
    const { result } = renderHook(() => useBatchDetail(null));
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(fetchDetail).not.toHaveBeenCalled();
  });

  it("loads items on success", async () => {
    fetchDetail.mockResolvedValue({ items: [{ itemNumber: "1" }] });

    const { result } = renderHook(() => useBatchDetail(params));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toEqual([{ itemNumber: "1" }]);
    expect(result.current.error).toBeNull();
  });

  it("sets an error and leaves items empty on failure", async () => {
    fetchDetail.mockRejectedValue(new Error("detail failed"));

    const { result } = renderHook(() => useBatchDetail(params));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("detail failed");
    expect(result.current.items).toEqual([]);
  });
});
