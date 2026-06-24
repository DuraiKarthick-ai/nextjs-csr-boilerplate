/**
 * Unit tests for the useWorklistPrint hook.
 * global.fetch is routed by endpoint. Covers modal setup, the print flow,
 * printer change (cached + fetched), failure handling, and modal reset.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useWorklistPrint } from "./useWorklistPrint";
import type { BatchQueryParams, BatchDetailItem } from "../../../types/batch.types";

const originalFetch = global.fetch;

function routeFetch(routes: Record<string, unknown>): void {
  global.fetch = jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
  }) as unknown as typeof fetch;
}

const batchParams: BatchQueryParams = { batchId: 22, storeId: "106", batchConfigId: 10, batchName: "B" };
const items: BatchDetailItem[] = [
  { itemNumber: "1", description: "Milk", department: "Dairy", signSize: "3x5", copies: 2, printStatus: "PENDING", changeReason: "PC", effectiveDate: "2026-06-19" },
];

const setupRoutes = {
  "/session": { success: true, sessionID: "s1" },
  "/printers": { success: true, printers: ["P1", "P2"] },
  "/trays": { success: true, trays: ["T1"] },
};

describe("useWorklistPrint", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("opens the modal and loads printers and trays", async () => {
    routeFetch(setupRoutes);
    const { result } = renderHook(() => useWorklistPrint());

    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.printers).toEqual(["P1", "P2"]);
    expect(result.current.selectedPrinter).toBe("P1");
    expect(result.current.trays).toEqual(["T1"]);
  });

  it("sets an error when session creation fails", async () => {
    routeFetch({ "/session": { success: false, message: "no session" } });
    const { result } = renderHook(() => useWorklistPrint());

    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    expect(result.current.error).toBe("no session");
  });

  it("runs the print flow to completion", async () => {
    routeFetch({
      ...setupRoutes,
      "/clear-signs": { success: true },
      "/item-search": { success: true, items: [{ productCode: "1", description: "Milk", productTypeCode: "ITM", styleId: 7 }] },
      "/adhoc-load": { success: true },
      "/print-batch": { success: true, layoutCount: 1 },
    });
    const { result } = renderHook(() => useWorklistPrint());
    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startPrint(); });
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.successInfo?.pageCount).toBe(2);
  });

  it("fails the print flow when clear-signs fails", async () => {
    routeFetch({ ...setupRoutes, "/clear-signs": { success: false, message: "clear failed" } });
    const { result } = renderHook(() => useWorklistPrint());
    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startPrint(); });
    expect(result.current.error).toBe("clear failed");
  });

  it("onPrinterChange fetches trays for a new printer", async () => {
    routeFetch(setupRoutes);
    const { result } = renderHook(() => useWorklistPrint());
    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    routeFetch({ "/trays": { success: true, trays: ["T9"] } });
    await act(async () => { await result.current.onPrinterChange("P2"); });
    expect(result.current.selectedPrinter).toBe("P2");
    expect(result.current.trays).toEqual(["T9"]);
  });

  it("onTrayChange and closeModal update state", async () => {
    routeFetch(setupRoutes);
    const { result } = renderHook(() => useWorklistPrint());
    await act(async () => { await result.current.openPrintModal(batchParams, items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    act(() => result.current.onTrayChange("T2"));
    expect(result.current.selectedTray).toBe("T2");

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.printers).toEqual([]);
  });
});
