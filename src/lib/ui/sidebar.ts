export const SIDEBAR_STORAGE_KEY = "countergank.ui.sidebar";

const DEFAULT_SIDEBAR_OPEN = true;

/**
 * @returns The persisted choice, defaulting to expanded when storage is absent, corrupt or
 * unreadable; only an exact `"false"` literal means collapsed.
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
 * @param open - the expansion choice, persisted as a bare `"true"` / `"false"` literal.
 * @returns void; a failed write is swallowed because the in-memory store already holds the choice.
 */
export function writeStoredSidebarOpen(open: boolean): void {
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
    // eslint-disable-next-line no-empty -- storage is a cache, not a source of truth.
  } catch {}
}
