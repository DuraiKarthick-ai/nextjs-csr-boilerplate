/**
 * Unit tests for useDebounce.
 * Uses fake timers to assert the returned value only updates after the
 * configured delay and that rapid changes reset the pending timer.
 */

import { renderHook, act } from "@testing-library/react";
import useDebounce from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 300));
    expect(result.current).toBe("initial");
  });

  it("updates the value only after the delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    // Not yet elapsed — still the old value.
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("b");
  });

  it("resets the timer when the value changes again before the delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    rerender({ value: "c" });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    // Only 200ms since the last change — still the original value.
    expect(result.current).toBe("a");

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe("c");
  });
});
