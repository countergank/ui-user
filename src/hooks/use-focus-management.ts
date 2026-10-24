import { useEffect, useRef } from "react";

export function useFocusManagement(pathname: string) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    containerRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return { containerRef };
}
