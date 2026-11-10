"use client";

import { useEffect, useState } from "react";

/**
 * Replaces Chakra's useBreakpointValue. Returns undefined until mounted
 * (avoids SSR hydration mismatch), then true below Tailwind's `md` (768px).
 */
export function useIsMobile(breakpoint = 768): boolean | undefined {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
