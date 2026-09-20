"use client";

import * as m from "motion/react-m";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ease } from "@/lib/motion";

const WORD = "traceroute";

const HOPS = [
  { id: "top", label: "hero.index" },
  { id: "work", label: "work.projects" },
  { id: "about", label: "about.self" },
  { id: "stack", label: "stack.tools" },
  { id: "experience", label: "experience.timeline" },
  { id: "contact", label: "contact.mailto" },
] as const;

type Hop = { label: string; ms: number };

/**
 * Type `traceroute` anywhere and the page traces a route through its own
 * sections. Entirely optional; delete the import in layout.tsx to cut it.
 */
export function Traceroute() {
  const [open, setOpen] = useState(false);
  const [hops, setHops] = useState<Hop[]>([]);
  const [done, setDone] = useState(false);
  const bufferRef = useRef("");
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const close = useCallback(() => {
    clearTimers();
    setOpen(false);
    setHops([]);
    setDone(false);
  }, [clearTimers]);

  const run = useCallback(() => {
    clearTimers();
    setHops([]);
    setDone(false);
    setOpen(true);

    HOPS.forEach((hop, i) => {
      const id = window.setTimeout(
        () => {
          setHops((prev) => [
            ...prev,
            { label: hop.label, ms: Math.round(4 + Math.random() * 28) },
          ]);
          document
            .getElementById(hop.id)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
          if (i === HOPS.length - 1) setDone(true);
        },
        380 + i * 420,
      );
      timersRef.current.push(id);
    });
  }, [clearTimers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }

      if (e.key.length !== 1) return;
      bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(
        -WORD.length,
      );
      if (bufferRef.current === WORD) {
        bufferRef.current = "";
        run();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimers();
    };
  }, [run, close, clearTimers]);

  return (
    <AnimatePresence>
      {open ? (
        <m.div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-[80] w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-line-lit bg-raised/95 p-4 font-mono text-xs backdrop-blur"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: ease.out }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-text-dim">
              traceroute to tanishkajangir.com
            </span>
            <button
              type="button"
              onClick={close}
              className="px-1 text-text-mute transition-colors hover:text-pink"
              aria-label="Close traceroute"
            >
              ✕
            </button>
          </div>

          <ol className="flex flex-col gap-1">
            {hops.map((hop, i) => (
              <m.li
                key={hop.label}
                className="flex items-baseline gap-3 text-text-dim"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: ease.out }}
              >
                <span className="w-4 text-right text-text-mute">
                  {i + 1}
                </span>
                <span className="flex-1">{hop.label}</span>
                <span className="text-pink">{hop.ms} ms</span>
              </m.li>
            ))}
          </ol>

          {done ? (
            <p className="mt-3 text-text-mute">
              6 hops · route complete
            </p>
          ) : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
