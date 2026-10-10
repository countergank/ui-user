import { useEffect, useState } from "react";

interface RouteAnnouncerProps {
  /** Message to announce after route change (e.g., page title) */
  message: string;
}

/**
 * Accessible route change announcer (a11y route-announcer rule / ARCH-6).
 * Uses `aria-live="polite"` to announce page transitions to screen reader
 * users. Mount once at the app root; the message updates after route changes.
 * Source: countergank react-frontend skill asset.
 */
export function RouteAnnouncer({ message }: RouteAnnouncerProps) {
  const [announced, setAnnounced] = useState("");

  // Delay announcement so screen readers pick it up after DOM update
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(message);
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
    // Deliberate visually-hidden live region from the react-frontend skill asset:
    // `<div role="status">` is the canonical screen-reader announcer pattern.
    // biome-ignore lint/a11y/useSemanticElements: intentional aria-live announcer, not an <output>
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
