/**
 * Unit tests for the useDashboard hook.
 * apiClient is mocked; covers summary load, error handling, and refresh.
 */

jest.mock("../../../services/apiClient", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

import { renderHook, waitFor, act } from "@testing-library/react";
import useDashboard from "./useDashboard";
import apiClient from "../../../services/apiClient";

const get = (apiClient as unknown as { get: jest.Mock }).get;

describe("useDashboard", () => {
  beforeEach(() => get.mockReset());

  it("loads the worklist summary on mount", async () => {
    const summary = { totalItems: 5, pendingItems: 2, printedItems: 3, failedItems: 0, approvedItems: 3 };
    get.mockResolvedValue({ data: { success: true, message: "OK", data: summary } });

    const { result } = renderHook(() => useDashboard());
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.summary).toEqual(summary);
    expect(result.current.error).toBeNull();
  });

  it("captures an error when the fetch fails", async () => {
    get.mockRejectedValue(new Error("summary down"));

    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("summary down");
  });

  it("re-fetches when refresh is called", async () => {
    get.mockResolvedValue({ data: { data: null } });
    const { result } = renderHook(() => useDashboard());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.refresh());
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });
});
