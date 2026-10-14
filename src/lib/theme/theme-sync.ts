// Theme bootstrap (COU-270).
//
// `tokens.css` ships a complete `.dark` block, but nothing in the app ever
// activated it. This module is that missing wire, and it is imperative on
// purpose: the composition root calls `startThemeSync()` once at boot, before
// React renders, so the very first paint already matches the user's preference.
//
// It reads/writes the store directly (`uiStore`, not the React hook) because
// bootstrapping happens outside the React tree.
import { uiStore } from "@/stores/use-ui-store";

import {
  DARK_MEDIA_QUERY,
  applyTheme,
  readStoredPreference,
  resolveTheme,
  systemPrefersDark,
} from "./theme";

/**
 * Wire the stored preference, the OS color scheme and the DOM together.
 *
 * @returns an unsubscribe function that detaches both listeners (store + OS).
 */
export function startThemeSync(): () => void {
  // 1. Hydrate: a persisted choice wins over the `"system"` default. `setTheme`
  //    also re-persists, which normalizes a corrupt stored value to `"system"`.
  uiStore.getState().setTheme(readStoredPreference());

  const applyPreferredTheme = (): void => {
    const { theme } = uiStore.getState();
    applyTheme(resolveTheme(theme, systemPrefersDark()));
  };

  // 2. Apply before returning, so the DOM matches ahead of the first render.
  applyPreferredTheme();

  // 3. Any `setTheme` (from a UI control or elsewhere) re-applies the theme.
  const unsubscribeStore = uiStore.subscribe(applyPreferredTheme);

  // 4. The OS is only consulted while the preference is `"system"`: a pinned
  //    light/dark choice must survive an OS scheme change.
  const mediaQuery =
    typeof window.matchMedia === "function" ? window.matchMedia(DARK_MEDIA_QUERY) : null;

  const handleSystemChange = (): void => {
    if (uiStore.getState().theme === "system") {
      applyPreferredTheme();
    }
  };

  mediaQuery?.addEventListener("change", handleSystemChange);

  // 5. No leaked listeners: teardown detaches both subscriptions.
  return () => {
    unsubscribeStore();
    mediaQuery?.removeEventListener("change", handleSystemChange);
  };
}
