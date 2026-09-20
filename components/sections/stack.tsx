"use client";

import * as m from "motion/react-m";
import { useState } from "react";

import { Experience } from "@/components/sections/experience";
import { Pixel } from "@/components/ui/pixel";
import { Rings } from "@/components/ui/patterns";
import { techGlyph } from "@/lib/pixel-art";
import { SectionHeader } from "@/components/ui/section-header";
import { stack } from "@/content/stack";
import { ease, inView, stagger } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Stack and experience share a screen: a typographic index on the left, the
 * timeline on the right. Hovering an item lights it and dims its siblings —
 * a colour transition only, so nothing reflows.
 *
 * Each item carries a 12x12 pixel glyph drawn in `currentColor`, so the same
 * one colour change lights the mark along with the word. The glyph sits at
 * 0.78em and is held a little under full strength: twenty-six of them at text
 * brightness would read as a toolbar rather than as an index.
 */
export function Stack() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="stack"
      aria-labelledby="stack-heading"
      className="dot-grid relative overflow-hidden py-24 sm:py-32"
    >
      <Rings
        crosshair
        radii={[90, 170, 250, 315]}
        className="pointer-events-none absolute -right-80 -bottom-72 hidden h-[640px] w-[640px] lg:block"
      />

      <div className="shell relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
        <div>
          <SectionHeader
            id="stack-heading"
            index="03"
            label="Stack"
            glyph="terminal"
            heading="What I reach for."
          />

          <div
            className="flex flex-col"
            onPointerLeave={() => setHovered(null)}
          >
            {stack.map((group, groupIndex) => (
              <div
                key={group.label}
                className="grid gap-3 border-t border-line py-6 sm:grid-cols-[130px_minmax(0,1fr)] sm:gap-5"
              >
                <span className="label pt-1.5 text-text-mute">
                  {group.label}
                </span>
                <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  {group.items.map((item, i) => (
                    <m.li
                      key={item}
                      initial={
                        reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 10 }
                      }
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={inView}
                      transition={{
                        duration: 0.45,
                        ease: ease.out,
                        delay: reduce
                          ? 0
                          : groupIndex * 0.04 + i * stagger.tight,
                      }}
                    >
                      <span
                        onPointerEnter={() => setHovered(item)}
                        className="inline-flex cursor-default items-center gap-2 text-[clamp(1.125rem,1.9vw,1.625rem)] tracking-[-0.015em] transition-colors duration-200"
                        style={{
                          color:
                            hovered === null
                              ? "var(--text)"
                              : hovered === item
                                ? "var(--pink)"
                                : "var(--text-mute)",
                        }}
                      >
                        <Pixel
                          art={techGlyph(item)}
                          className="h-[0.78em] w-[0.78em] shrink-0 transition-opacity duration-200"
                          style={{ opacity: hovered === item ? 1 : 0.72 }}
                        />
                        {item}
                      </span>
                    </m.li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="border-t border-line" />
          </div>
        </div>

        <Experience />
      </div>
    </section>
  );
}
