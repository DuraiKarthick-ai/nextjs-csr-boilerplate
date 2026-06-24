/**
 * Unit tests for the useCustomSign hook.
 * renderCustomSign, global.fetch (item-search + print endpoints), and
 * pdfFromImage are mocked. Covers lookup validation/success, field re-render,
 * print/download flows, printer/tray changes, and reset.
 */

jest.mock("../services/customSignService", () => ({ renderCustomSign: jest.fn() }));
jest.mock("../../../utils/pdfFromImage", () => ({
  base64PngToPdfBlob: jest.fn().mockResolvedValue(new Blob(["pdf"])),
  downloadBlob: jest.fn(),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import useCustomSign from "./useCustomSign";
import { renderCustomSign } from "../services/customSignService";
import { base64PngToPdfBlob, downloadBlob } from "../../../utils/pdfFromImage";

const render = renderCustomSign as jest.Mock;
const originalFetch = global.fetch;

function routeFetch(routes: Record<string, unknown>): void {
  global.fetch = jest.fn((url: string) => {
    const key = Object.keys(routes).find((k) => url.includes(k));
    return Promise.resolve({ json: async () => (key ? routes[key] : { success: true }) } as Response);
  }) as unknown as typeof fetch;
}

const itemSearchOk = {
  "/item-search": {
    success: true,
    items: [{ styleId: 7, styleName: "S", description: "Milk", productTypeCode: "ITM" }],
  },
};

/** Loads an item so the hook reaches the isLoaded=true state. */
async function loadItem(result: { current: ReturnType<typeof useCustomSign> }): Promise<void> {
  render.mockResolvedValue({ data: [{ responseData: "previewbytes" }] });
  routeFetch(itemSearchOk);
  act(() => result.current.setSize("3x5"));
  act(() => result.current.setProductCode("12345"));
  await act(async () => { await result.current.handleLookup(); });
}

describe("useCustomSign", () => {
  beforeEach(() => {
    render.mockReset();
    (base64PngToPdfBlob as jest.Mock).mockClear();
    (downloadBlob as jest.Mock).mockClear();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("requires a size before lookup", async () => {
    const { result } = renderHook(() => useCustomSign());
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toMatch(/select a size/i);
  });

  it("rejects an invalid product code", async () => {
    const { result } = renderHook(() => useCustomSign());
    act(() => result.current.setSize("3x5"));
    act(() => result.current.setProductCode("bad code!"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toMatch(/valid Item/i);
  });

  it("loads the preview and item detail on a successful lookup", async () => {
    const { result } = renderHook(() => useCustomSign());
    await loadItem(result);
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.previewBase64).toBe("previewbytes");
    expect(result.current.error).toBeNull();
  });

  it("errors when the render returns no preview data", async () => {
    render.mockResolvedValue({ data: [] });
    routeFetch(itemSearchOk);
    const { result } = renderHook(() => useCustomSign());
    act(() => result.current.setSize("3x5"));
    act(() => result.current.setProductCode("12345"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toMatch(/No preview data/i);
  });

  it("re-renders the preview on field blur", async () => {
    const { result } = renderHook(() => useCustomSign());
    await loadItem(result);

    render.mockResolvedValue({ data: [{ responseData: "updatedbytes" }] });
    await act(async () => { await result.current.handleFieldBlur(); });
    expect(result.current.previewBase64).toBe("updatedbytes");
  });

  it("runs the print flow after opening the modal", async () => {
    const { result } = renderHook(() => useCustomSign());
    await loadItem(result);

    routeFetch({
      "/session": { success: true, sessionID: "s1" },
      "/printers": { success: true, printers: ["P1"] },
      "/trays": { success: true, trays: ["T1"] },
      "/clear-signs": { success: true },
      "/adhoc-load": { success: true },
      "/print-batch": { success: true },
    });

    await act(async () => { await result.current.openPrintModal(); });
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    await act(async () => { await result.current.startPrint(); });
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(result.current.successInfo).not.toBeNull();
  });

  it("runs the download flow", async () => {
    const { result } = renderHook(() => useCustomSign());
    await loadItem(result);

    await act(async () => { await result.current.startDownload(); });
    await waitFor(() => expect(result.current.isDone).toBe(true));
    expect(base64PngToPdfBlob).toHaveBeenCalledWith("previewbytes");
    expect(downloadBlob).toHaveBeenCalled();
  });

  it("blocks openPrintModal until a lookup is done", async () => {
    const { result } = renderHook(() => useCustomSign());
    await act(async () => { await result.current.openPrintModal(); });
    expect(result.current.error).toMatch(/perform a lookup/i);
  });

  it("handleReset clears the form but keeps size", async () => {
    const { result } = renderHook(() => useCustomSign());
    await loadItem(result);

    act(() => result.current.handleReset());
    expect(result.current.productCode).toBe("");
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.size).toBe("3x5");
  });

  it("onTrayChange updates the selected tray", () => {
    const { result } = renderHook(() => useCustomSign());
    act(() => result.current.onTrayChange("T9"));
    expect(result.current.selectedTray).toBe("T9");
  });
});
