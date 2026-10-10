// RouteAnnouncer.tsx
// Accessible route change announcer for SPAs.
// Uses aria-live="polite" to announce page transitions to screen reader users.
// Mount once at the app root; call announce() after route changes complete.

import { useEffect, useRef, useState, useCallback } from "react";

interface RouteAnnouncerProps {
  /** Message to announce after route change (e.g., page title) */
  message: string;
}

export function RouteAnnouncer({ message }: RouteAnnouncerProps) {
  const [announced, setAnnounced] = useState("");

  // Delay announcement so screen readers pick it up after DOM update
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(message), 100);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {announced}
    </div>
  );
}

// Hook-based usage for programmatic announcements
export function useAnnouncer() {
  const announcerRef = useRef<((msg: string) => void) | null>(null);

  const announce = useCallback((message: string) => {
    announcerRef.current?.(message);
  }, []);

  return { announce, announcerRef };
}
