"use client";

import * as m from "motion/react-m";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";

import { dur, ease, inView } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type RevealTextProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/**
 * Line-mask reveal. Highest impact per byte on the site — the text is already
 * in the HTML, and the mask only moves transform.
 *
 * The `whileInView` lives on the WRAPPER, not on the line that moves. The line
 * starts translated 110% below the wrapper, which has `overflow: hidden` — and
 * IntersectionObserver measures through ancestor clipping, so an observer on
 * the line itself reports zero intersection forever. It could never come into
 * view, so it could never animate, so the heading stayed invisible. The
 * wrapper is unclipped, sees the viewport normally, and propagates its variant
 * down to the line.
 */
export function RevealText({
  children,
  delay = 0,
  className,
}: RevealTextProps) {
  const reduce = useReducedMotion();

  const line: Variants = {
    hidden: reduce ? { opacity: 0, y: "0%" } : { opacity: 1, y: "110%" },
    visible: {
      opacity: 1,
      y: "0%",
      transition: {
        duration: reduce ? 0.2 : 0.75,
        ease: reduce ? "linear" : ease.out,
        delay: reduce ? 0 : delay,
      },
    },
  };

  return (
    <m.span
      className={`block overflow-hidden ${className ?? ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
    >
      <m.span className="block" variants={line}>
        {children}
      </m.span>
    </m.span>
  );
}

type FadeUpProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** The other half of the vocabulary: opacity + 16px rise. Never scale, never rotate. */
export function FadeUp({ children, delay = 0, className }: FadeUpProps) {
  const reduce = useReducedMotion();

  return (
    <m.div
      className={className}
      initial={reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{
        duration: reduce ? 0.2 : dur.base,
        ease: reduce ? "linear" : ease.out,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </m.div>
  );
}
