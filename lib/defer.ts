/**
 * Runs work after the page has finished loading and the main thread is idle.
 *
 * GSAP, Lenis and the hero canvas are all lazy chunks, but "lazy" only moves
 * them out of the initial bundle — mounting still requests them immediately,
 * where they compete with the fonts for bandwidth and push out LCP. Waiting
 * for load + idle takes them out of that window entirely.
 *
 * Returns a cancel function; calling it prevents the work from starting.
 */
export function afterIdle(work: () => void, timeout = 1500): () => void {
  let cancelled = false;
  let idleHandle: number | undefined;
  let usedIdleCallback = false;

  const schedule = () => {
    if (cancelled) return;
    const run = () => {
      if (!cancelled) work();
    };

    // Safari still has no requestIdleCallback; a short timeout is close enough.
    usedIdleCallback = typeof window.requestIdleCallback === "function";
    idleHandle = usedIdleCallback
      ? window.requestIdleCallback(run, { timeout })
      : window.setTimeout(run, 200);
  };

  if (document.readyState === "complete") {
    schedule();
  } else {
    window.addEventListener("load", schedule, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (idleHandle === undefined) return;
    if (usedIdleCallback) window.cancelIdleCallback(idleHandle);
    else window.clearTimeout(idleHandle);
  };
}
