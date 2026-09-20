"use client";

import { LazyMotion, domAnimation } from "motion/react";
import type { ReactNode } from "react";

/**
 * Every animated component uses `m.*` from `motion/react-m` rather than
 * `motion.*`, which keeps the full feature bundle out of the build — this
 * provider supplies only the DOM animation features the site actually uses
 * (animate, exit, gestures, viewport). No drag, no layout animations.
 * `strict` makes a stray `motion.*` import throw instead of silently
 * re-adding ~30KB.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
