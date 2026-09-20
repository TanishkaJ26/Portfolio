"use client";

import * as m from "motion/react-m";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

import { NodeGraph } from "@/components/ui/patterns";
import { Pixel } from "@/components/ui/pixel";
import { ProjectPreview } from "@/components/work/project-preview";
import { techGlyph } from "@/lib/pixel-art";
import { RevealText } from "@/components/ui/reveal-text";
import { loadGsap } from "@/lib/lenis";
import { ease, inView, stagger } from "@/lib/motion";
import {
  prefersReducedMotion,
  useReducedMotion,
} from "@/lib/use-reduced-motion";
import type { Project } from "@/types";

type ProjectPanelProps = {
  project: Project;
};

const PIN_BREAKPOINT = 1024;

/**
 * One project: a left column that pins while the right column scrolls through
 * the three beats. The pinned panel carries the node graph, which is what
 * keeps a long column of prose from reading as a wall of text.
 */
export function ProjectPanel({ project }: ProjectPanelProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `reduce` is false for one render; asking the browser directly avoids
    // starting GSAP for someone who asked for no motion and then having its
    // revert() clobber React's corrected styles.
    if (reduce || prefersReducedMotion()) return;
    const panel = panelRef.current;
    const left = leftRef.current;
    if (!panel || !left) return;

    let mm: gsap.MatchMedia | null = null;
    let cancelled = false;

    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;

      // Pinning below 1024px is a known usability disaster — the panels are a
      // plain vertical stack there instead.
      mm = gsap.matchMedia();
      mm.add("(min-width: " + PIN_BREAKPOINT + "px)", () => {
        const trigger = ScrollTrigger.create({
          trigger: panel,
          start: "top top",
          end: "bottom bottom",
          pin: left,
          pinSpacing: false,
          scrub: 0.6,
          anticipatePin: 1,
        });
        return () => trigger.kill();
      });
    });

    return () => {
      cancelled = true;
      mm?.revert();
    };
  }, [reduce]);

  return (
    <article
      ref={panelRef}
      aria-labelledby={"project-" + project.slug}
      className="relative grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
    >
      {/* Left column — pins on desktop. */}
      <div ref={leftRef} className="lg:h-[100svh] lg:py-24">
        <div className="relative flex h-full flex-col justify-center gap-7 overflow-hidden rounded-xl border border-line bg-surface p-8 sm:p-10">
          <NodeGraph
            className="pointer-events-none absolute -top-10 -left-12 h-[420px] w-auto opacity-40"
          />

          <div className="relative flex flex-col gap-5">
            <span className="label text-pink">
              Project {project.index} · {project.year}
            </span>
            <h3
              id={"project-" + project.slug}
              className="text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[0.96]"
            >
              <RevealText>{project.title}</RevealText>
            </h3>
            <p className="max-w-[38ch] text-[1.0625rem] leading-relaxed text-text-dim">
              {project.summary}
            </p>
          </div>

          <div className="relative flex flex-col gap-6">
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((tech, i) => (
                <m.li
                  key={tech}
                  className="label flex items-center gap-1.5 rounded-full border border-line-lit py-2 pr-3.5 pl-2.5 text-text-dim"
                  initial={
                    reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 10 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={inView}
                  transition={{
                    duration: 0.45,
                    ease: ease.out,
                    delay: reduce ? 0 : i * stagger.base,
                  }}
                >
                  <Pixel art={techGlyph(tech)} className="h-3.5 w-3.5 shrink-0" />
                  {tech}
                </m.li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              {project.links.demo ? (
                <ProjectLink href={project.links.demo} label="Live demo" primary />
              ) : null}
              {project.links.repo ? (
                <ProjectLink href={project.links.repo} label="Source" />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Right column — scrolls through the three beats. */}
      <div className="flex flex-col gap-12 lg:gap-24 lg:py-24">
        <ProjectPreview image={project.image} />

        {project.beats.map((beat, i) => (
          <div key={beat.label} className="max-w-[60ch]">
            <span className="label mb-4 block text-text-mute">
              {String(i + 1).padStart(2, "0")} — {beat.label}
            </span>
            <h4 className="mb-5 font-display text-[clamp(1.375rem,2.4vw,2rem)] leading-[1.12] font-semibold tracking-[-0.02em]">
              <RevealText>{beat.heading}</RevealText>
            </h4>
            <p className="leading-[1.65] text-text-dim">{beat.body}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function ProjectLink({
  href,
  label,
  primary = false,
}: {
  href: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        primary
          ? "group inline-flex items-center gap-2 rounded-md bg-pink px-4 py-3 font-sans text-[0.9375rem] font-medium text-ground transition-transform duration-200 hover:-translate-y-0.5"
          : "group inline-flex items-center gap-2 rounded-md border border-line-lit px-4 py-3 font-sans text-[0.9375rem] font-medium transition-colors duration-200 hover:border-pink hover:text-pink"
      }
    >
      {label}
      <ArrowUpRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </a>
  );
}
