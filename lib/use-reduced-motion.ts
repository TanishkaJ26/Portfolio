"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe `prefers-reduced-motion`. Returns `false` on the server and on the
 * first client render so hydration matches, then settles on the real value.
 *
 * That one-render flip has a sharp edge: a component whose non-reduced
 * `initial` sets `y`, `scale` or `clipPath` will have already had that style
 * written to the DOM before `reduced` turns true. If the reduced branch then
 * animates opacity alone, the element stays translated, scaled to zero or
 * clipped out — invisible, with no animation to reveal it.
 *
 * So every reduced-motion target in this codebase resets the properties its
 * non-reduced counterpart touches, rather than only setting opacity.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Synchronous read, for use inside effects.
 *
 * `useReducedMotion()` is a render value and is `false` for one render. An
 * effect that trusts it will start GSAP work for a user who asked for no
 * motion; when the flag then flips, GSAP's `revert()` runs *after* React has
 * committed the corrected styles and restores the pre-animation ones — leaving
 * the element stuck. Whether that happens depends on whether the GSAP chunk is
 * cached, so it reproduces on a second visit and not a first. Effects run
 * after mount, so they can just ask the browser.
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
