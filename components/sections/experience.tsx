"use client";

import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

import { GLYPHS } from "@/lib/pixel-art";
import { Pixel } from "@/components/ui/pixel";
import { experience } from "@/content/experience";
import { loadGsap } from "@/lib/lenis";
import { ease, inView, spring } from "@/lib/motion";
import {
  prefersReducedMotion,
  useReducedMotion,
} from "@/lib/use-reduced-motion";

/**
 * The timeline, in the right column of the Stack section. The spine draws
 * downward scrubbed to scroll and each node pops as the line passes it.
 *
 * Each node is a pixel glyph in a tile rather than a dot — a briefcase, a
 * cap, a flag. The tile is opaque so it interrupts the spine cleanly, and it
 * sets `color`, which the glyph inherits: the current entry reads pink, the
 * rest sit at the hairline.
 */
export function Experience() {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce || prefersReducedMotion()) return;
    const list = listRef.current;
    const spine = spineRef.current;
    if (!list || !spine) return;

    let ctx: gsap.Context | null = null;
    let cancelled = false;

    void loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: list,
              start: "top 75%",
              end: "bottom 70%",
              scrub: 0.8,
            },
          },
        );
      }, list);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduce]);

  return (
    <div className="flex flex-col gap-8 lg:pt-[7.5rem]">
      <span className="label flex items-center gap-2 text-pink">
        <Pixel art={GLYPHS.briefcase} className="h-3.5 w-3.5 shrink-0" />
        04 — Experience &amp; leadership
      </span>

      <ol ref={listRef} className="relative flex flex-col gap-10 pl-7">
        {/* Spine — a track, plus a scrubbed fill drawn over it. */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-0 w-px bg-line"
        />
        {/* Explicit in both branches: relying on React to strip an inline
            transform when `reduce` flips would leave the spine at scaleY(0)
            — invisible — for anyone who prefers reduced motion. */}
        <div
          ref={spineRef}
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-0 w-px origin-top bg-pink"
          style={{ transform: reduce ? "scaleY(1)" : "scaleY(0)" }}
        />

        {experience.map((entry, i) => (
          <li key={entry.org} className="relative">
            <m.span
              aria-hidden="true"
              className="absolute top-0.5 -left-7 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-md border bg-ground"
              style={{
                color: i === 0 ? "var(--pink)" : "var(--line-lit)",
                borderColor: i === 0 ? "var(--pink)" : "var(--line)",
              }}
              initial={reduce ? { opacity: 0, scale: 1 } : { scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={inView}
              transition={reduce ? { duration: 0.2 } : spring}
            >
              <Pixel art={GLYPHS[entry.icon]} className="h-3.5 w-3.5" />
            </m.span>

            <m.div
              className="flex flex-col gap-2"
              initial={reduce ? { opacity: 0, x: 0 } : { opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={inView}
              transition={{
                duration: reduce ? 0.2 : 0.65,
                ease: ease.out,
                delay: reduce ? 0 : i * 0.05,
              }}
            >
              <span className="label text-text-mute">
                {entry.period}
                {entry.meta ? ` · ${entry.meta}` : ""}
              </span>
              <h3 className="font-display text-[1.375rem] leading-[1.15] font-semibold tracking-[-0.01em]">
                {entry.role}
              </h3>
              <p className="text-[0.9375rem] text-text-dim">{entry.org}</p>
              <p className="mt-1 text-[0.875rem] leading-[1.6] text-text-mute">
                {entry.detail}
              </p>
            </m.div>
          </li>
        ))}
      </ol>
    </div>
  );
}
