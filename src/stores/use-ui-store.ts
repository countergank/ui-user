import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

import type { ThemePreference } from "@/lib/theme/theme";
import { writeStoredPreference } from "@/lib/theme/theme";
import { writeStoredSidebarOpen } from "@/lib/ui/sidebar";

export interface UiState {
  sidebarOpen: boolean;
  theme: ThemePreference;
}

export interface UiActions {
  /** Collapse/expand the console sidebar; the choice is persisted (COU-278, S6). */
  toggleSidebar: () => void;
  /** Set the sidebar expansion explicitly; the value is also persisted. */
  setSidebarOpen: (open: boolean) => void;
  /** Set the theme preference; the value is also persisted for the next visit. */
  setTheme: (preference: ThemePreference) => void;
}

export type UiStore = UiState & UiActions;

// Pure literal, deliberately free of import-time side effects: reading storage here
// would leak state across tests — `startThemeSync()` and `hydrateSidebarState()` hydrate.
// The sidebar starts expanded (COU-278): collapsing is the choice that must be remembered.
export const initialState: UiState = { sidebarOpen: true, theme: "system" };

export const uiStore = createStore<UiStore>()((set, get) => ({
  ...initialState,
  toggleSidebar: () => {
    const next = !get().sidebarOpen;
    set({ sidebarOpen: next });
    writeStoredSidebarOpen(next);
  },
  setSidebarOpen: (open) => {
    set({ sidebarOpen: open });
    writeStoredSidebarOpen(open);
  },
  setTheme: (preference) => {
    set({ theme: preference });
    writeStoredPreference(preference);
  },
}));

export const selectSidebarOpen = (s: UiStore): boolean => s.sidebarOpen;
export const selectTheme = (s: UiStore): ThemePreference => s.theme;

export const useUiStore = <T>(selector: (state: UiStore) => T): T => useStore(uiStore, selector);
