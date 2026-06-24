/**
 * Unit tests for print utility helpers.
 * Covers print-request building/validation, the status colour map, and the
 * triggerPrint DOM flow (window.open is stubbed).
 */

import { buildPrintRequest, triggerPrint, getPrintStatusColorClass } from "./print";
import { MAX_PRINT_BATCH_SIZE, DEFAULT_PRINTER_QUEUE } from "../lib/constants";

describe("buildPrintRequest", () => {
  it("builds a valid request with defaults", () => {
    const req = buildPrintRequest(["a", "b"]);
    expect(req).toEqual({ signIds: ["a", "b"], quantity: 1, printerQueue: DEFAULT_PRINTER_QUEUE });
  });

  it("clamps the sign IDs to the max batch size", () => {
    const ids = Array.from({ length: MAX_PRINT_BATCH_SIZE + 10 }, (_, i) => `s${i}`);
    expect(buildPrintRequest(ids, 1).signIds).toHaveLength(MAX_PRINT_BATCH_SIZE);
  });

  it("throws for an invalid quantity", () => {
    expect(() => buildPrintRequest(["a"], 0)).toThrow(/Invalid quantity/);
    expect(() => buildPrintRequest(["a"], 100)).toThrow(/Invalid quantity/);
  });
});

describe("getPrintStatusColorClass", () => {
  it.each([
    ["QUEUED", "bg-yellow-100 text-yellow-800"],
    ["PRINTING", "bg-blue-100 text-blue-800"],
    ["COMPLETED", "bg-green-100 text-green-800"],
    ["FAILED", "bg-red-100 text-red-800"],
  ])("maps %s to its colour class", (status, expected) => {
    expect(getPrintStatusColorClass(status)).toBe(expected);
  });

  it("falls back to a neutral class for unknown statuses", () => {
    expect(getPrintStatusColorClass("WHATEVER")).toBe("bg-gray-100 text-gray-600");
  });
});

describe("triggerPrint", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("does nothing when the element is not found", () => {
    const openSpy = jest.spyOn(window, "open").mockReturnValue(null);
    triggerPrint("missing");
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("does nothing when the print window cannot be opened", () => {
    document.body.innerHTML = `<div id="printable">content</div>`;
    jest.spyOn(window, "open").mockReturnValue(null);
    expect(() => triggerPrint("printable")).not.toThrow();
  });

  it("clones the element into the print window and triggers print", () => {
    document.body.innerHTML = `<div id="printable">content</div>`;
    const print = jest.fn();
    const focus = jest.fn();
    const addEventListener = jest.fn();
    const fakeWindow = { document, focus, print, addEventListener } as unknown as Window;
    jest.spyOn(window, "open").mockReturnValue(fakeWindow);

    triggerPrint("printable");

    expect(focus).toHaveBeenCalled();
    expect(print).toHaveBeenCalled();
    expect(addEventListener).toHaveBeenCalledWith("afterprint", expect.any(Function));
  });
});
