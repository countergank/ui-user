import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ThemePreference } from "@/lib/theme/theme";
import { writeStoredPreference } from "@/lib/theme/theme";

export interface UiState {
  sidebarOpen: boolean;
  theme: ThemePreference;
}

export interface UiActions {
  toggleSidebar: () => void;
  /** Set the theme preference; the value is also persisted for the next visit. */
  setTheme: (preference: ThemePreference) => void;
}

export type UiStore = UiState & UiActions;

// Pure literal, deliberately free of import-time side effects: reading storage
// here would leak state across tests. `startThemeSync()` performs hydration.
export const initialState: UiState = { sidebarOpen: false, theme: "system" };

export const uiStore = createStore<UiStore>()((set) => ({
  ...initialState,
  toggleSidebar: () => {
    set((s) => ({ sidebarOpen: !s.sidebarOpen }));
  },
  setTheme: (preference) => {
    set({ theme: preference });
    writeStoredPreference(preference);
  },
}));

export const selectSidebarOpen = (s: UiStore): boolean => s.sidebarOpen;
export const selectTheme = (s: UiStore): ThemePreference => s.theme;

export const useUiStore = <T>(selector: (state: UiStore) => T): T => useStore(uiStore, selector);
