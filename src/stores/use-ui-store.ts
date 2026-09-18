import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export interface UiState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
}

export interface UiActions {
  toggleSidebar: () => void;
  setTheme: (theme: UiState["theme"]) => void;
  toggleTheme: () => void;
}

export type UiStore = UiState & UiActions;

export const initialState: UiState = { sidebarOpen: false, theme: "light" };

export const uiStore = createStore<UiStore>()((set) => ({
  ...initialState,
  toggleSidebar: () => {
    set((s) => ({ sidebarOpen: !s.sidebarOpen }));
  },
  setTheme: (theme) => {
    set({ theme });
  },
  toggleTheme: () => {
    set((s) => ({ theme: s.theme === "light" ? "dark" : "light" }));
  },
}));

export const selectSidebarOpen = (s: UiStore): boolean => s.sidebarOpen;
export const selectTheme = (s: UiStore): "light" | "dark" => s.theme;

export const useUiStore = <T>(selector: (state: UiStore) => T): T => useStore(uiStore, selector);
