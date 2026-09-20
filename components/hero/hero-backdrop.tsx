"use client";

import dynamic from "next/dynamic";
import * as m from "motion/react-m";
import { useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { NodeGraph, Wash } from "@/components/ui/patterns";
import { afterIdle } from "@/lib/defer";
import { useReducedMotion } from "@/lib/use-reduced-motion";

// Neither the canvas nor its chunk belongs in the critical path.
const RoutingCanvas = dynamic(
  () =>
    import("@/components/hero/routing-canvas").then((mod) => mod.RoutingCanvas),
  { ssr: false },
);

/**
 * Scroll behaviour and the live graph. The hero's content is passed in from
 * the server component, so none of it depends on this hydrating.
 *
 * The static `NodeGraph` is server-rendered and visible immediately; the
 * canvas fades in over it once idle and takes the same shape, so the
 * transition reads as the graph coming alive rather than as a swap.
 */
export function HeroBackdrop({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Fetching the canvas chunk during the LCP window would take bandwidth from
  // the fonts, which is what actually delays hero paint.
  const [canvasReady, setCanvasReady] = useState(false);
  useEffect(() => afterIdle(() => setCanvasReady(true)), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "34%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const graphY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="dot-grid relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <Wash
        className="pointer-events-none absolute -top-64 -right-60 h-[900px] w-[900px] rounded-full"
      />

      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
        style={reduce ? undefined : { y: graphY }}
      >
        <div className="relative h-full w-full">
          <NodeGraph
            className="absolute top-[18%] right-[6%] h-[62%] w-auto"
            style={{
              // Fades out as the canvas takes over, so there is no hard swap.
              opacity: canvasReady && !reduce ? 0 : 1,
              transition: "opacity 600ms ease",
            }}
          />
          {canvasReady && !reduce ? <RoutingCanvas /> : null}
        </div>
      </m.div>

      <m.div
        className="shell relative z-10 flex w-full flex-1 flex-col justify-center gap-16 pt-32 pb-10"
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
      >
        {children}
      </m.div>
    </section>
  );
}
