"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    const scrollMainToTop = () => {
      document
        .getElementById("main-content")
        ?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollMainToTop();
    const frame = window.requestAnimationFrame(scrollMainToTop);
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
