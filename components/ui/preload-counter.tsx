"use client";

import { useEffect, useRef } from "react";

/**
 * How long the counter takes to reach 100, matched to the CSS wipe. Its type
 * is deliberately smaller than the hero headline's: whichever text block is
 * largest becomes the LCP element, and the counter's digits change late.
 */
const RUN_MS = 400;

/**
 * The one piece of the preloader that needs JS. It writes straight to the DOM
 * node rather than through state — this runs during the busiest moment of the
 * page's life and there is no reason to put ~40 renders through React for it.
 *
 * Server-renders as "000", so the slot is correct even if this never hydrates.
 */
export function PreloadCounter() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const started = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / RUN_MS);
      // Ease out, so it sprints and then settles rather than crawling linearly.
      const value = Math.round(100 * (1 - Math.pow(1 - t, 2.2)));
      el.textContent = String(value).padStart(3, "0");
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      ref={ref}
      suppressHydrationWarning
      className="font-mono text-[clamp(1.75rem,6vw,3rem)] leading-none tracking-tight text-pink"
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      000
    </span>
  );
}
