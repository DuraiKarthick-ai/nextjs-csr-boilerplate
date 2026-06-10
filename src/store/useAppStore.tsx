/**
 * Global application state via React Context + useState.
 * Provides sidebar open/close state and active department filter
 * to any component inside AppProvider.
 */

import React, { createContext, useContext, useState } from "react";

/**
 * Shape of the global application context value.
 */
export interface AppContextValue {
  /** Whether the sidebar navigation is open. */
  isSidebarOpen: boolean;
  /** The currently active department filter applied globally. */
  activeDepartment: string;
  /** Toggles the sidebar open/closed state. */
  toggleSidebar: () => void;
  /** Opens the sidebar. */
  openSidebar: () => void;
  /** Closes the sidebar. */
  closeSidebar: () => void;
  /**
   * Sets the globally active department filter.
   *
   * @param {string} department - The department code to set as active.
   */
  setActiveDepartment: (department: string) => void;
  /** Resets all global filters to their default values. */
  resetFilters: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * AppProvider — wraps the application and provides global UI state.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function AppProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeDepartment, setActiveDepartmentState] = useState<string>("");

  /** Toggles the sidebar open/closed state. */
  function toggleSidebar(): void {
    setIsSidebarOpen((prev) => !prev);
  }

  /** Opens the sidebar. */
  function openSidebar(): void {
    setIsSidebarOpen(true);
  }

  /** Closes the sidebar. */
  function closeSidebar(): void {
    setIsSidebarOpen(false);
  }

  /**
   * Sets the globally active department filter.
   *
   * @param {string} department - The department code to activate.
   */
  function setActiveDepartment(department: string): void {
    setActiveDepartmentState(department);
  }

  /** Resets all global filters. */
  function resetFilters(): void {
    setActiveDepartmentState("");
  }

  return (
    <AppContext.Provider
      value={{
        isSidebarOpen,
        activeDepartment,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        setActiveDepartment,
        resetFilters,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

/**
 * useAppStore — returns the global app context value.
 * Must be used inside AppProvider.
 *
 * @returns {AppContextValue} The app context value.
 * @throws {Error} If used outside of AppProvider.
 */
function useAppStore(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppProvider");
  return ctx;
}

export default useAppStore;
