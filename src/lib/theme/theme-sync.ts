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
  uiStore.getState().setTheme(readStoredPreference());

  const applyPreferredTheme = (): void => {
    const { theme } = uiStore.getState();
    applyTheme(resolveTheme(theme, systemPrefersDark()));
  };

  applyPreferredTheme();

  const unsubscribeStore = uiStore.subscribe(applyPreferredTheme);

  const mediaQuery =
    typeof window.matchMedia === "function" ? window.matchMedia(DARK_MEDIA_QUERY) : null;

  const handleSystemChange = (): void => {
    if (uiStore.getState().theme === "system") {
      applyPreferredTheme();
    }
  };

  mediaQuery?.addEventListener("change", handleSystemChange);

  return () => {
    unsubscribeStore();
    mediaQuery?.removeEventListener("change", handleSystemChange);
  };
}
