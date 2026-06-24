/**
 * Unit tests for the useDashboardPrint hook.
 * global.fetch is routed by endpoint; pdfFromImage is mocked. Covers the print
 * flow, the download flow, their failure paths, and modal reset.
 */

jest.mock("../../../utils/pdfFromImage", () => ({
  multipleBase64PngsToPdfBlob: jest.fn().mockResolvedValue(new Blob(["pdf"])),
  downloadBlob: jest.fn(),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useDashboardPrint } from "./useDashboardPrint";
import { multipleBase64PngsToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";
import type { BatchItem } from "../../../types/batch.types";
import { BatchStatus } from "../../../types/batch.types";

const originalFetch = global.fetch;

/** Routes fetch by URL substring to the supplied JSON bodies. */
function routeFetch(routes: Record<string, unknown>): void {
  global.fetch = jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
  }) as unknown as typeof fetch;
}

const batch: BatchItem = {
  batchId: 22,
  batchName: "Batch A",
  storeId: "106",
  batchConfigId: 10,
  status: BatchStatus.READY,
  signQuantity: 5,
  printedQuantity: 0,
};

describe("useDashboardPrint", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    (multipleBase64PngsToPdfBlob as jest.Mock).mockClear();
    (downloadBlob as jest.Mock).mockClear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("runs the print flow to completion", async () => {
    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/load-batch": { success: true },
      "/print-batch": { success: true, layoutCount: 3 },
    });

    const { result } = renderHook(() => useDashboardPrint());
    await act(async () => { await result.current.startPrint(batch, "P1", "T1"); });

    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.mode).toBe("print");
    expect(result.current.error).toBeNull();
    expect(result.current.successInfo).toEqual({ printer: "P1", tray: "T1", pageCount: 5 });
  });

  it("sets an error when session creation fails during print", async () => {
    routeFetch({ "/session": { success: false, message: "no session" } });

    const { result } = renderHook(() => useDashboardPrint());
    await act(async () => { await result.current.startPrint(batch, "P1", "T1"); });

    expect(result.current.error).toBe("no session");
    expect(result.current.isDone).toBe(false);
  });

  it("runs the download flow to completion", async () => {
    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/load-preview": { success: true, previewImages: ["img1", "img2"] },
    });

    const { result } = renderHook(() => useDashboardPrint());
    await act(async () => { await result.current.startDownload(batch); });

    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.mode).toBe("download");
    expect(multipleBase64PngsToPdfBlob).toHaveBeenCalledWith(["img1", "img2"]);
    expect(downloadBlob).toHaveBeenCalled();
  });

  it("sets an error when no preview images are returned", async () => {
    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/load-preview": { success: false, message: "no images" },
    });

    const { result } = renderHook(() => useDashboardPrint());
    await act(async () => { await result.current.startDownload(batch); });

    expect(result.current.error).toBe("no images");
  });

  it("closeModal resets the flow state", async () => {
    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/load-batch": { success: true },
      "/print-batch": { success: true, layoutCount: 1 },
    });
    const { result } = renderHook(() => useDashboardPrint());
    await act(async () => { await result.current.startPrint(batch, "P1", "T1"); });

    act(() => result.current.closeModal());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.steps).toEqual([]);
    expect(result.current.successInfo).toBeNull();
  });
});
