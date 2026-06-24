/**
 * Unit tests for the useQuickPrintItem hook.
 * global.fetch is routed by endpoint; renderCustomSign and pdfFromImage are
 * mocked. Covers modal setup, print flow, download flow, and reset.
 */

jest.mock("../../custom-sign/services/customSignService", () => ({
  renderCustomSign: jest.fn(),
}));
jest.mock("../../../utils/pdfFromImage", () => ({
  multipleBase64PngsToPdfBlob: jest.fn().mockResolvedValue(new Blob(["pdf"])),
  downloadBlob: jest.fn(),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useQuickPrintItem } from "./useQuickPrintItem";
import { renderCustomSign } from "../../custom-sign/services/customSignService";
import { multipleBase64PngsToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";
import type { PrintItem } from "../types";

const render = renderCustomSign as jest.Mock;
const originalFetch = global.fetch;

function routeFetch(routes: Record<string, unknown>): void {
  global.fetch = jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
  }) as unknown as typeof fetch;
}

const items: PrintItem[] = [
  { itemUpc: "123", description: "Milk", productTypeCode: "ITM", quantity: "2", styleId: 7, styleName: "S" } as unknown as PrintItem,
];

const setupRoutes = {
  "/session": { success: true, sessionID: "s1" },
  "/printers": { success: true, printers: ["P1"] },
  "/trays": { success: true, trays: ["T1"] },
};

describe("useQuickPrintItem", () => {
  beforeEach(() => {
    render.mockReset();
    (multipleBase64PngsToPdfBlob as jest.Mock).mockClear();
    (downloadBlob as jest.Mock).mockClear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("opens the modal and loads printers/trays", async () => {
    routeFetch(setupRoutes);
    const { result } = renderHook(() => useQuickPrintItem());

    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    expect(result.current.isOpen).toBe(true);
    expect(result.current.printers).toEqual(["P1"]);
    expect(result.current.selectedTray).toBe("T1");
  });

  it("runs the print flow to completion", async () => {
    routeFetch({
      ...setupRoutes,
      "/clear-signs": { success: true },
      "/adhoc-load": { success: true },
      "/print-batch": { success: true },
    });
    const { result } = renderHook(() => useQuickPrintItem());
    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startPrint(); });
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.successInfo?.pageCount).toBe(2);
  });

  it("fails the print flow when adhoc-load fails", async () => {
    routeFetch({
      ...setupRoutes,
      "/clear-signs": { success: true },
      "/adhoc-load": { success: false, message: "load failed" },
    });
    const { result } = renderHook(() => useQuickPrintItem());
    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startPrint(); });
    expect(result.current.printError).toBe("load failed");
  });

  it("runs the download flow to completion", async () => {
    routeFetch(setupRoutes);
    render.mockResolvedValue({ data: [{ responseData: "imgbytes" }] });

    const { result } = renderHook(() => useQuickPrintItem());
    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startDownload(); });
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(multipleBase64PngsToPdfBlob).toHaveBeenCalled();
    expect(downloadBlob).toHaveBeenCalled();
  });

  it("fails the download flow when no images are rendered", async () => {
    routeFetch(setupRoutes);
    render.mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useQuickPrintItem());
    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startDownload(); });
    expect(result.current.printError).toMatch(/No sign images/i);
  });

  it("onPrinterChange, onTrayChange, and closeModal update state", async () => {
    routeFetch(setupRoutes);
    const { result } = renderHook(() => useQuickPrintItem());
    await act(async () => { await result.current.openPrintModal(items); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    act(() => result.current.onTrayChange("T2"));
    expect(result.current.selectedTray).toBe("T2");

    // Cached tray path (P1 already cached at open time).
    await act(async () => { await result.current.onPrinterChange("P1"); });
    expect(result.current.selectedPrinter).toBe("P1");

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);
  });
});
