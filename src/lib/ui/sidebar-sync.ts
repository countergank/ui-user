// Sidebar bootstrap (COU-278).
//
// The store deliberately has no import-time side effects, so the persisted choice is
// applied from the composition root, exactly like the theme preference
// (`lib/theme/theme-sync.ts`). There is no OS listener to wire here: the sidebar has no
// system-level source, only the user's own choice.
import { uiStore } from "@/stores/use-ui-store";

import { readStoredSidebarOpen } from "./sidebar";

/** Apply the persisted expansion choice to the store, before React renders. */
export function hydrateSidebarState(): void {
  uiStore.getState().setSidebarOpen(readStoredSidebarOpen());
}
