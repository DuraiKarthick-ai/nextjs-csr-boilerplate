// src/store/useStore.ts
/**
 * Global Zustand Store
 * Manages application-wide state
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define store state interface
interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;

  // User preferences (can be expanded)
  preferences: {
    language: string;
    timezone: string;
  };
  setPreferences: (preferences: Partial<AppState['preferences']>) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Reset store
  reset: () => void;
}

// Initial state
const initialState = {
  theme: 'system' as const,
  sidebarOpen: true,
  notificationsEnabled: true,
  preferences: {
    language: 'en',
    timezone: 'UTC',
  },
  isLoading: false,
};

// Create store
export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Theme actions
        setTheme: (theme) => set({ theme }),

        // Sidebar actions
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Notifications actions
        setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),

        // Preferences actions
        setPreferences: (preferences) =>
          set((state) => ({
            preferences: { ...state.preferences, ...preferences },
          })),

        // Loading actions
        setIsLoading: (loading) => set({ isLoading: loading }),

        // Reset action
        reset: () => set(initialState),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          notificationsEnabled: state.notificationsEnabled,
          preferences: state.preferences,
        }),
      }
    ),
    { name: 'AppStore' }
  )
);

// Selectors (optional, but recommended for performance)
export const selectTheme = (state: AppState) => state.theme;
export const selectSidebarOpen = (state: AppState) => state.sidebarOpen;
export const selectPreferences = (state: AppState) => state.preferences;
