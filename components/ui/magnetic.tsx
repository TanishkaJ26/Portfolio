"use client";

import * as m from "motion/react-m";
import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

type MagneticProps = {
  children: ReactNode;
  /** Keep ≤ 0.4 — beyond that it reads as broken, not responsive. */
  strength?: number;
  className?: string;
};

/**
 * Pointer-following displacement, spring-damped. Disabled entirely on coarse
 * pointers and under reduced motion.
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 22 });
  const sy = useSpring(y, { stiffness: 220, damping: 22 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x.set((e.clientX - (r.left + r.width / 2)) * strength);
      y.set((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("blur", reset, true);

    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("blur", reset, true);
    };
  }, [strength, x, y]);

  return (
    <m.span
      ref={ref}
      className={`inline-block ${className ?? ""}`}
      style={{ x: sx, y: sy }}
    >
      {children}
    </m.span>
  );
}
