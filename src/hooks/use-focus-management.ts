import { useEffect, useRef } from "react";

/**
 * Focus management for client-side navigation (ARCH-6, a11y focus mgmt).
 *
 * On pathname change, parks focus to a designated container so screen reader
 * and keyboard users start each page from its own content landmark instead of
 * the last focused element. Focus restoration is left to the consumer via the
 * returned ref (assign it to the focusable target).
 */
export function useFocusManagement(pathname: string) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial full-page load: on loading, focus must start at the
    // document body so the skip link remains the first Tab stop (a11y
    // skip-links rule). Only client-side navigations park focus to the content
    // landmark to give screen reader and keyboard users a stable starting point.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    containerRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return { containerRef };
}
