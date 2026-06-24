/**
 * Unit tests for the useQuickPrint hook.
 * The quick-print service is mocked; covers lookup validation/dedupe/errors,
 * quantity updates, removal, print-all, and queue clearing.
 */

jest.mock("../services/quickPrintService", () => ({
  lookupItem: jest.fn(),
  submitBatchPrint: jest.fn(),
}));

import { renderHook, act } from "@testing-library/react";
import useQuickPrint from "./useQuickPrint";
import { lookupItem, submitBatchPrint } from "../services/quickPrintService";

const lookup = lookupItem as jest.Mock;
const submit = submitBatchPrint as jest.Mock;

const found = { itemNumber: "12345", description: "Milk", department: "DAIRY", price: 3.5, found: true };

describe("useQuickPrint", () => {
  beforeEach(() => {
    lookup.mockReset();
    submit.mockReset();
  });

  it("rejects an invalid item number without calling the service", async () => {
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("bad value!!"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toMatch(/valid item number/i);
    expect(lookup).not.toHaveBeenCalled();
  });

  it("queues a found item and clears the input", async () => {
    lookup.mockResolvedValue(found);
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });

    expect(result.current.queuedItems).toHaveLength(1);
    expect(result.current.queuedItems[0].formattedPrice).toBe("$3.50");
    expect(result.current.itemNumber).toBe("");
  });

  it("sets an error when the item is not found", async () => {
    lookup.mockResolvedValue({ ...found, found: false });
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toMatch(/not found/i);
    expect(result.current.queuedItems).toHaveLength(0);
  });

  it("does not queue a duplicate item", async () => {
    lookup.mockResolvedValue(found);
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.queuedItems).toHaveLength(1);
  });

  it("captures a service error during lookup", async () => {
    lookup.mockRejectedValue(new Error("lookup boom"));
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    expect(result.current.error).toBe("lookup boom");
  });

  it("updates quantity and removes items", async () => {
    lookup.mockResolvedValue(found);
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });

    act(() => result.current.updateQuantity("12345", 5));
    expect(result.current.queuedItems[0].quantity).toBe(5);

    act(() => result.current.removeItem("12345"));
    expect(result.current.queuedItems).toHaveLength(0);
  });

  it("handlePrintAll errors when the queue is empty", async () => {
    const { result } = renderHook(() => useQuickPrint());
    await act(async () => { await result.current.handlePrintAll(); });
    expect(result.current.error).toMatch(/No items/i);
  });

  it("submits all queued items and clears the queue", async () => {
    lookup.mockResolvedValue(found);
    submit.mockResolvedValue({ jobId: "j1" });
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });

    await act(async () => { await result.current.handlePrintAll(); });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(result.current.queuedItems).toHaveLength(0);
  });

  it("captures a service error during print", async () => {
    lookup.mockResolvedValue(found);
    submit.mockRejectedValue(new Error("print boom"));
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    await act(async () => { await result.current.handlePrintAll(); });
    expect(result.current.error).toBe("print boom");
  });

  it("clearQueue empties the queue and clears error", async () => {
    lookup.mockResolvedValue(found);
    const { result } = renderHook(() => useQuickPrint());
    act(() => result.current.setItemNumber("12345"));
    await act(async () => { await result.current.handleLookup(); });
    act(() => result.current.clearQueue());
    expect(result.current.queuedItems).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });
});
