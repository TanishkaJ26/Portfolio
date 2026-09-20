"use client";

import * as m from "motion/react-m";
import { ArrowUpRight } from "lucide-react";

import { PortraitGraph, Rings } from "@/components/ui/patterns";
import { SectionHeader } from "@/components/ui/section-header";
import { about, stats } from "@/content/about";
import { ease, inView } from "@/lib/motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function About() {
  const reduce = useReducedMotion();

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="dot-grid relative overflow-hidden py-24 sm:py-32"
    >
      <Rings className="pointer-events-none absolute -top-36 -right-32 hidden h-[420px] w-[420px] lg:block" />

      <div className="shell relative">
        <SectionHeader
          id="about-heading"
          index="02"
          label="About"
          heading={
            <>
              Most application work treats the network as a flat, reliable
              pipe. <span className="text-pink">It isn’t.</span>
            </>
          }
        />

        <div className="grid gap-12 border-t border-line pt-10 lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <m.div
              className="relative h-[360px] overflow-hidden rounded-xl border border-line bg-surface"
              initial={
                reduce
                  ? { opacity: 0, clipPath: "inset(0% 0 0 0)" }
                  : { clipPath: "inset(100% 0 0 0)" }
              }
              whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
              viewport={inView}
              transition={{ duration: reduce ? 0.2 : 1, ease: ease.out }}
            >
              <m.div
                className="h-full w-full"
                initial={reduce ? { scale: 1 } : { scale: 1.08 }}
                whileInView={{ scale: 1 }}
                viewport={inView}
                transition={{ duration: 1.1, ease: ease.out }}
              >
                <PortraitGraph className="h-full w-full" />
              </m.div>
              <span className="label absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/90 to-transparent pt-8 pb-4 text-center text-text-mute">
                Portrait — or keep the graph
              </span>
            </m.div>

            <dl className="grid grid-cols-2 gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1 border-t border-line pt-2"
                >
                  <dt className="label text-text-mute">{stat.label}</dt>
                  <dd className="label text-text">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-2 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
            {about.map((paragraph, i) => (
              <m.p
                key={i}
                className="leading-[1.7] text-text-dim"
                initial={reduce ? { opacity: 0, y: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inView}
                transition={{
                  duration: reduce ? 0.2 : 0.7,
                  ease: ease.out,
                  delay: reduce ? 0 : i * 0.06,
                }}
              >
                {paragraph}
              </m.p>
            ))}

            <a
              href="#contact"
              className="group inline-flex w-fit items-center gap-2 rounded-md border border-line-lit px-4 py-3 font-sans text-[0.9375rem] font-medium transition-colors duration-200 hover:border-pink hover:text-pink lg:col-start-2"
            >
              Get in touch
              <ArrowUpRight
                size={14}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
