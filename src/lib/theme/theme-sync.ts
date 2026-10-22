// Theme bootstrap (COU-270): imperative on purpose — `startThemeSync()` runs at boot,
// before React renders, so the first paint matches the preference. It reads/writes the
// store directly because bootstrapping runs outside the React tree.
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
