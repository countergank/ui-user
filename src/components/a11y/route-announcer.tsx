import { useEffect, useState } from "react";

interface RouteAnnouncerProps {
  message: string;
}

/**
 * @param message - the text to announce after a route change (e.g. the page title).
 * @returns A visually hidden `aria-live="polite"` announcer; mount once at the app root.
 */
export function RouteAnnouncer({ message }: RouteAnnouncerProps) {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnnounced(message);
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [message]);

  return (
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
