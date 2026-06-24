/**
 * Unit tests for the usePrinterSetup hook.
 * global.fetch is mocked to simulate the session → printers → trays flow.
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { usePrinterSetup } from "./usePrinterSetup";

const originalFetch = global.fetch;

/** Wraps a value as a fetch-like Response with a json() method. */
function jsonResponse(body: unknown): Response {
  return { json: async () => body } as unknown as Response;
}

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe("usePrinterSetup", () => {
  it("creates a session, loads printers, and pre-fetches trays", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, sessionID: "s1" }))
      .mockResolvedValueOnce(jsonResponse({ success: true, printers: ["P1", "P2"] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, trays: ["T1"] })) as typeof fetch;

    const { result } = renderHook(() => usePrinterSetup());

    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    expect(result.current.setupSessionID).toBe("s1");
    expect(result.current.printers).toEqual(["P1", "P2"]);
    expect(result.current.getSelectedPrinter(1)).toBe("P1");
    expect(result.current.getTraysForBatch(1)).toEqual(["T1"]);
    expect(result.current.getSelectedTray(1)).toBe("T1");
    expect(result.current.isLoadingTrays(1)).toBe(false);
  });

  it("sets a printer error when session creation fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: false, message: "no session" })) as typeof fetch;

    const { result } = renderHook(() => usePrinterSetup());

    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));
    expect(result.current.printerError).toBe("no session");
  });

  it("setSelectedTray updates the tray for a batch", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, sessionID: "s1" }))
      .mockResolvedValueOnce(jsonResponse({ success: true, printers: ["P1"] }))
      .mockResolvedValueOnce(jsonResponse({ success: true, trays: ["T1"] })) as typeof fetch;

    const { result } = renderHook(() => usePrinterSetup());
    await waitFor(() => expect(result.current.isLoadingPrinters).toBe(false));

    act(() => result.current.setSelectedTray(5, "T9"));
    expect(result.current.getSelectedTray(5)).toBe("T9");
  });
});
