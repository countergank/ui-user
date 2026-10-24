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
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (preference: ThemePreference) => void;
}

export type UiStore = UiState & UiActions;

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
