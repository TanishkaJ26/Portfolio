/**
 * Lenis and GSAP both want to own the frame loop. Driving Lenis from GSAP's
 * ticker — and pushing every Lenis scroll into ScrollTrigger.update — is what
 * stops scrubbed timelines from jittering half a frame behind the scroll.
 *
 * Everything here is imported at runtime: GSAP and Lenis together are ~45KB
 * gzipped and neither belongs in the critical bundle.
 */
export async function createSmoothScroll(): Promise<() => void> {
  const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] =
    await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
      import("lenis"),
    ]);

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off("scroll", onScroll);
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}

/** Loads GSAP + ScrollTrigger on demand, registering the plugin once. */
export async function loadGsap() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
