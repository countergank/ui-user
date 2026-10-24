import { uiStore } from "@/stores/use-ui-store";

import { readStoredSidebarOpen } from "./sidebar";

/**
 * @returns void; applies the persisted expansion choice to the store before React renders.
 */
export function hydrateSidebarState(): void {
  uiStore.getState().setSidebarOpen(readStoredSidebarOpen());
}
