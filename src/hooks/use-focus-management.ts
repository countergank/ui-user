import { useEffect, useRef } from "react";

/**
 * ARCH-6: on client-side navigation, park focus on the container (via the returned ref)
 * so screen reader and keyboard users start each page at the content landmark.
 */
export function useFocusManagement(pathname: string) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // On initial load focus must stay at the document body so the skip link remains the
    // first Tab stop; only client-side navigations park focus on the content landmark.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    containerRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return { containerRef };
}
