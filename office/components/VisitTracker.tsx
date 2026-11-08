"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let timer: any;
    let elapsed = 0;
    let startTime = Date.now();
    let recorded = false;

    const recordVisit = async () => {
      if (recorded) return;

      recorded = true;

      try {
        await fetch("/api/visits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: pathname,
            referrer: document.referrer,
          }),
        });
      } catch (error) {
        console.error("Failed to record visit:", error);
      }
    };

    const startTimer = () => {
      if (document.visibilityState !== "visible" || recorded) return;

      startTime = Date.now();

      timer = setTimeout(
        () => {
          elapsed += Date.now() - startTime;
          recordVisit();
        },
        Math.max(0, 3000 - elapsed),
      );
    };

    const pauseTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;

        elapsed += Date.now() - startTime;
      }
    };

    startTimer();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        pauseTimer();
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      pauseTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return null;
}
