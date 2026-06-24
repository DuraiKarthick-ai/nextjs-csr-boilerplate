/**
 * Unit tests for the global app store (Context + useState).
 * Covers sidebar actions, active-department filter, reset, and the
 * out-of-provider guard.
 */

import React from "react";
import { renderHook, act } from "@testing-library/react";
import useAppStore, { AppProvider } from "./useAppStore";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe("useAppStore", () => {
  it("defaults to an open sidebar and empty department", () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    expect(result.current.isSidebarOpen).toBe(true);
    expect(result.current.activeDepartment).toBe("");
  });

  it("toggles the sidebar", () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    act(() => result.current.toggleSidebar());
    expect(result.current.isSidebarOpen).toBe(false);
    act(() => result.current.toggleSidebar());
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it("opens and closes the sidebar explicitly", () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    act(() => result.current.closeSidebar());
    expect(result.current.isSidebarOpen).toBe(false);
    act(() => result.current.openSidebar());
    expect(result.current.isSidebarOpen).toBe(true);
  });

  it("sets and resets the active department", () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    act(() => result.current.setActiveDepartment("BAKERY"));
    expect(result.current.activeDepartment).toBe("BAKERY");
    act(() => result.current.resetFilters());
    expect(result.current.activeDepartment).toBe("");
  });

  it("throws when used outside of AppProvider", () => {
    // Suppress the expected React error log for this assertion.
    const spy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useAppStore())).toThrow(/AppProvider/);
    spy.mockRestore();
  });
});
