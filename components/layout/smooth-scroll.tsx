"use client";

import { useEffect } from "react";

import { afterIdle } from "@/lib/defer";
import { createSmoothScroll } from "@/lib/lenis";

/**
 * Mounts Lenis and hands GSAP the frame loop, once the page has loaded and the
 * main thread is idle — fetching ~45KB of animation library during the LCP
 * window costs more than a few hundred milliseconds of native scrolling does.
 *
 * Skipped entirely under reduced motion; native scrolling is correct there.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let teardown: (() => void) | null = null;
    let cancelled = false;

    const cancelIdle = afterIdle(() => {
      void createSmoothScroll().then((dispose) => {
        if (cancelled) dispose();
        else teardown = dispose;
      });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      teardown?.();
    };
  }, []);

  return null;
}
