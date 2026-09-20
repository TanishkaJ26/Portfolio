"use client";

import * as m from "motion/react-m";
import { useScroll, useSpring } from "motion/react";

/** Hairline progress bar under the header. Transform-only, so it costs nothing. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <m.div
      aria-hidden="true"
      className="absolute right-0 bottom-0 left-0 h-px origin-left bg-pink"
      style={{ scaleX }}
    />
  );
}
