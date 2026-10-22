// Sidebar expansion storage (COU-278): the key, the vocabulary and the storage
// failure policy for "el sidebar recuerda el estado" (S6). Mirrors
// `lib/theme/theme.ts` on purpose.

/** `localStorage` key holding the console sidebar's expansion choice. */
export const SIDEBAR_STORAGE_KEY = "countergank.ui.sidebar";

/**
 * Expanded is the default: a console that opens with its navigation hidden makes every
 * visit start with a click. Collapsing is the deliberate choice, so it is the one that
 * has to be remembered.
 */
const DEFAULT_SIDEBAR_OPEN = true;

/**
 * Read the persisted choice. Absent, corrupt or unreadable storage all resolve to the
 * default: a broken `localStorage` must never throw. The check is a positive match on the
 * only value that means "collapsed", so an unexpected literal cannot hide the navigation.
 */
export function readStoredSidebarOpen(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "false"
      ? false
      : DEFAULT_SIDEBAR_OPEN;
  } catch {
    return DEFAULT_SIDEBAR_OPEN;
  }
}

/**
 * Persist the choice as a bare literal (`"true"` / `"false"`). Best-effort: a failed write
 * is swallowed because the in-memory store already holds the user's choice.
 */
export function writeStoredSidebarOpen(open: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  } catch {
    // Intentionally ignored: storage is a cache, not a source of truth.
  }
}
