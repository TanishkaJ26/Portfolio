"use client";

import Image from "next/image";
import * as m from "motion/react-m";
import { useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";

import { NodeGraphMark } from "@/components/ui/patterns";
import { ease, inView } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { Project } from "@/types";

type ProjectPreviewProps = {
  image: Project["image"];
};

/**
 * Inset-clip reveal with counter-scale on the image inside — the pairing is
 * what makes it read as expensive rather than as a fade. A few degrees of
 * cursor tilt on top, killed on touch and under reduced motion.
 *
 * While `image.pending` is set the frame shows a line grid and a graph mark
 * instead of an image, so the layout is honest about what is missing. Drop the
 * screenshot in, remove the flag, and the real thing takes over with no other
 * change.
 */
export function ProjectPreview({ image }: ProjectPreviewProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 180, damping: 20 });
  const sy = useSpring(py, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(sx, [-0.5, 0.5], ["-3deg", "3deg"]);

  const onEnter = () => {
    if (reduce) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setTiltEnabled(true);
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onLeave = () => {
    px.set(0);
    py.set(0);
    setTiltEnabled(false);
  };

  return (
    <div style={{ perspective: 1200 }}>
      <m.div
        ref={ref}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="line-grid relative overflow-hidden rounded-xl border border-line bg-surface"
        style={
          tiltEnabled
            ? { rotateX, rotateY, transformStyle: "preserve-3d" }
            : undefined
        }
        initial={
          reduce
            ? { opacity: 0, clipPath: "inset(0% 0 0 0)" }
            : { clipPath: "inset(100% 0 0 0)" }
        }
        whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
        viewport={inView}
        transition={{
          duration: reduce ? 0.2 : 1,
          ease: reduce ? "linear" : ease.out,
        }}
      >
        {image.pending ? (
          // No <img> at all until there is a real screenshot: an empty frame
          // that says so beats a grey rectangle pretending to be a product.
          <div
            className="flex flex-col items-center justify-center gap-4 px-6 text-center"
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
          >
            <NodeGraphMark className="h-[70px] w-auto" />
            <span className="label max-w-[36ch] text-text-mute">
              Screenshot pending — drop it at {image.src}
            </span>
          </div>
        ) : (
          <m.div
            initial={reduce ? { scale: 1 } : { scale: 1.08 }}
            whileInView={{ scale: 1 }}
            viewport={inView}
            transition={{ duration: 1.1, ease: ease.out }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="h-auto w-full"
            />
          </m.div>
        )}
      </m.div>
    </div>
  );
}
