/**
 * Unit tests for the useWorklist hook.
 * The worklist service is mocked and the hook is rendered inside the
 * WorklistProvider so its store interactions work.
 */

jest.mock("../services/worklistService", () => ({
  fetchWorklist: jest.fn(),
  printWorklistItems: jest.fn(),
}));

import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import useWorklist from "./useWorklist";
import useWorklistStore, { WorklistProvider } from "../../../store/worklistStore";
import { fetchWorklist, printWorklistItems } from "../services/worklistService";

const fetchMock = fetchWorklist as jest.Mock;
const printMock = printWorklistItems as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorklistProvider>{children}</WorklistProvider>
);

describe("useWorklist", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    printMock.mockReset();
    fetchMock.mockResolvedValue({ data: [{ id: "1" }], meta: { total: 1 } });
  });

  it("loads items and total on mount", async () => {
    const { result } = renderHook(() => useWorklist(), { wrapper });
    await waitFor(() => expect(result.current.totalItems).toBe(1));
    expect(fetchMock).toHaveBeenCalled();
  });

  it("applyFilters resets the page to 1 and refetches", async () => {
    const { result } = renderHook(() => useWorklist(), { wrapper });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    act(() => result.current.applyFilters({ department: "BAKERY" }));

    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1));
    expect(result.current.page).toBe(1);
  });

  it("goToPage updates the page number", async () => {
    const { result } = renderHook(() => useWorklist(), { wrapper });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    act(() => result.current.goToPage(3));
    expect(result.current.page).toBe(3);
  });

  it("handlePrintSelected does nothing when nothing is selected", async () => {
    const { result } = renderHook(() => useWorklist(), { wrapper });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    await act(async () => {
      await result.current.handlePrintSelected();
    });
    expect(printMock).not.toHaveBeenCalled();
  });

  it("handlePrintSelected submits selected items", async () => {
    printMock.mockResolvedValue({ jobId: "j1" });

    // Render the hook and the store together so we can seed a selection.
    const { result } = renderHook(
      () => ({ worklist: useWorklist(), store: useWorklistStore() }),
      { wrapper }
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    act(() => result.current.store.toggleSelection("1"));

    await act(async () => {
      await result.current.worklist.handlePrintSelected();
    });

    expect(printMock).toHaveBeenCalledWith({ itemIds: ["1"] });
  });
});
